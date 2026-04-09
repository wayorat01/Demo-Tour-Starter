import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { MongoClient } from "mongodb";
import { config } from "dotenv";
import https from "https";

config();

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const uploadWebps = async (filePath: string, s3Key: string) => {
    const fileStream = fs.createReadStream(filePath);
    await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: s3Key,
        Body: fileStream,
        ContentType: 'image/webp',
        ACL: 'public-read',
    }));
};

const deleteS3File = async (s3Key: string) => {
    try {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: s3Key,
        }));
    } catch(e) {}
}

const downloadFile = (url: string, dest: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode && response.statusCode >= 300) {
                 return reject(new Error('Status: ' + response.statusCode));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

async function run() {
  const artifactsDir = '/Users/macintoshhd/.gemini/antigravity/brain/ee9ee596-60d9-406d-b5df-8ebba2c8fbd0';
  
  // 1. Process 7 new tickets
  const NEW_TICKETS = [
      { id: '04-ticket-fuji-q', artifact: 'ticket_fuji_q_1775127508431.png' },
      { id: '06-ticket-tokyo-skytree', artifact: 'ticket_skytree_1775127527970.png' },
      { id: '07-ticket-harry-potter', artifact: 'ticket_warner_1775104681681.png' }, // wait, I didn't generate a new one for WB, I will reuse it. Oh, teamLab and WB are fine. Wait, teamLab has new.
      { id: '08-ticket-teamlab', artifact: 'ticket_teamlab_1775127546736.png' },
      { id: '09-ticket-sanrio', artifact: 'ticket_sanrio_1775127567818.png' },
      { id: '10-ticket-legoland', artifact: 'ticket_legoland_1775127587030.png' },
      { id: '11-ticket-shibuya-sky', artifact: 'ticket_shibuya_1775127609222.png' },
      { id: '12-ticket-ghibli', artifact: 'ticket_ghibli_1775127639181.png' },
  ];

  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('wowtour-gig');

  const tmpDir = path.join(process.cwd(), 'tmp');
  if(!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  for (const ticket of NEW_TICKETS) {
      if(!ticket.artifact) continue;
      const sourcePath = path.join(artifactsDir, ticket.artifact);
      if(!fs.existsSync(sourcePath)) {
          console.warn(`Missing artifact: ${sourcePath}`);
          continue;
      }
      
      const targetWebpName = `${ticket.id}.webp`;
      const tmpWebpPath = path.join(tmpDir, targetWebpName);
      
      try {
          await sharp(sourcePath).webp({ quality: 80 }).toFile(tmpWebpPath);
          const stats = fs.statSync(tmpWebpPath);
          await uploadWebps(tmpWebpPath, targetWebpName);
          
          await db.collection('media').updateOne(
            { filename: targetWebpName }, // Note: we already changed them to .webp in the last script!
            { $set: { 
                url: `/${targetWebpName}`, 
                mimeType: 'image/webp',
                filesize: stats.size 
            }}
          );
          console.log(`Updated ${targetWebpName}`);
      } catch(e) {
          console.error(e);
      }
  }

  // 2. Scan and Convert all remaining .png tracking records to .webp
  const pngRecords = await db.collection('media').find({ filename: /\.png$/i }).toArray();
  console.log(`Found ${pngRecords.length} remaining PNG records in DB`);
  
  for (const record of pngRecords) {
      const origFilename = record.filename;
      const baseName = origFilename.substring(0, origFilename.lastIndexOf('.'));
      const webpFilename = `${baseName}.webp`;
      const tmpPngPath = path.join(tmpDir, origFilename);
      const tmpWebpPath = path.join(tmpDir, webpFilename);
      
      try {
          let hasFile = false;
          // Try local first
          if (fs.existsSync(path.join(process.cwd(), 'public', 'media', origFilename))) {
              fs.copyFileSync(path.join(process.cwd(), 'public', 'media', origFilename), tmpPngPath);
              hasFile = true;
          } else if (record.url) {
              const url = record.url.startsWith('http') ? record.url : `https://localtourdemo.b-cdn.net/${origFilename}`;
              try {
                  await downloadFile(url, tmpPngPath);
                  hasFile = true;
              } catch(e) { console.log(`Could not download ${url}`) }
          }
          
          if (hasFile) {
              await sharp(tmpPngPath).webp({ quality: 80 }).toFile(tmpWebpPath);
              const stats = fs.statSync(tmpWebpPath);
              
              await uploadWebps(tmpWebpPath, webpFilename);
              
              await db.collection('media').updateOne(
                  { _id: record._id },
                  { $set: {
                      filename: webpFilename,
                      url: `/${webpFilename}`,
                      mimeType: 'image/webp',
                      filesize: stats.size
                  }}
              );
              
              // Clean up local public/media if exists
              if (fs.existsSync(path.join(process.cwd(), 'public', 'media', origFilename))) {
                  fs.unlinkSync(path.join(process.cwd(), 'public', 'media', origFilename));
              }
              // Clean up S3 PNG
              await deleteS3File(origFilename);
              
              console.log(`Converted and cleaned up: ${origFilename} -> ${webpFilename}`);
          } else {
              console.log(`Target file not found for ${origFilename}, skipping conversion.`);
          }
      } catch(e) {
          console.log(`Error converting ${origFilename}:`, e);
      }
      
      // Remove tmp files
      if(fs.existsSync(tmpPngPath)) fs.unlinkSync(tmpPngPath);
      if(fs.existsSync(tmpWebpPath)) fs.unlinkSync(tmpWebpPath);
  }
  
  await client.close();
  console.log("ALL DONE!");
}

run().catch(console.error);
