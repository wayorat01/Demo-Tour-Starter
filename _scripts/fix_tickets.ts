import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

async function run() {
  const artifactsDir = '/Users/macintoshhd/.gemini/antigravity/brain/ee9ee596-60d9-406d-b5df-8ebba2c8fbd0';
  
  const artifactMapping: Record<string, string> = {
    '01-ticket-usj': 'ticket_usj_1775104611145.png',
    '02-ticket-disneyland': 'ticket_tokyo_disney_1775104627459.png',
    '03-ticket-disneysea': 'ticket_tokyo_disney_1775104627459.png',
    '04-ticket-fuji-q': 'ticket_warner_1775104681681.png',
    '05-ticket-osaka-aquarium': 'ticket_kaiyukan_1775104662350.png',
    '06-ticket-tokyo-skytree': 'ticket_harukas_1775104643497.png',
    '07-ticket-harry-potter': 'ticket_warner_1775104681681.png',
    '08-ticket-teamlab': 'ticket_harukas_1775104643497.png',
    '09-ticket-sanrio': 'ticket_tokyo_disney_1775104627459.png',
    '10-ticket-legoland': 'ticket_usj_1775104611145.png',
    '11-ticket-shibuya-sky': 'ticket_harukas_1775104643497.png',
    '12-ticket-ghibli': 'ticket_warner_1775104681681.png'
  };

  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('wowtour-gig');

  const keys = Object.keys(artifactMapping);

  for (const baseName of keys) {
    const artifactFile = artifactMapping[baseName];
    const sourcePath = path.join(artifactsDir, artifactFile);
    const webpFile = `${baseName}.webp`;
    const tempWebpPath = path.join(process.cwd(), 'tmp', webpFile);
    
    // Ensure tmp output dir exists
    if(!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'tmp'));
    }

    try {
        // 1. Convert artifact PNG to WEBP
        await sharp(sourcePath).webp({ quality: 80 }).toFile(tempWebpPath);
        const stats = fs.statSync(tempWebpPath);
        console.log(`Converted: ${artifactFile} -> ${webpFile} (${Math.round(stats.size/1024)}KB)`);
        
        // 2. Upload WEBP to S3
        const fileStream = fs.createReadStream(tempWebpPath);
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: webpFile,
            Body: fileStream,
            ContentType: 'image/webp',
            ACL: 'public-read',
        }));
        
        // 3. Update MongoDB (update existing media where filename equals baseName.png)
        const oldPngName = `${baseName}.png`;
        await db.collection('media').updateOne(
        { filename: oldPngName },
        { $set: { 
            filename: webpFile, 
            url: `/${webpFile}`, // Note: Payload S3 baseUrl dynamically attaches it, usually DB url is just the filename or whatever S3 adapter saves. Actually, earlier the DB url was /images/tickets/... We'll just put /media/webpFile. S3 urls work with filename!
            mimeType: 'image/webp',
            filesize: stats.size 
        }}
        );
        
        console.log(`Successfully processed ${webpFile}`);
    } catch(e) {
        console.error(`Error processing ${baseName}: `, e);
    }
  }
  
  await client.close();
  console.log("Done upgrading TICKETS to WEBP and syncing with DB and S3.");
  
  // Bust cache
  fs.writeFileSync('next.config.ts', fs.readFileSync('next.config.ts'));
}

run().catch(console.error);
