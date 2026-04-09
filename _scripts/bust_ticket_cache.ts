import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const vSuffix = '-v3';

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
  
  const NEW_TICKETS = [
      { baseId: '01-ticket-usj', artifact: 'scenic_usj_1775127753579.png' },
      { baseId: '02-ticket-disneyland', artifact: 'scenic_disneyland_1775127772874.png' },
      { baseId: '03-ticket-disneysea', artifact: 'scenic_disneysea_1775127789734.png' },
      { baseId: '04-ticket-fuji-q', artifact: 'scenic_fuji_q_1775127808113.png' },
      { baseId: '05-ticket-osaka-aquarium', artifact: 'scenic_aquarium_1775127822634.png' },
      { baseId: '06-ticket-tokyo-skytree', artifact: 'scenic_skytree_1775127844646.png' },
      { baseId: '07-ticket-harry-potter', artifact: 'scenic_harry_potter_1775127866706.png' },
      { baseId: '08-ticket-teamlab', artifact: 'scenic_teamlab_1775127884109.png' },
      { baseId: '09-ticket-sanrio', artifact: 'scenic_sanrio_1775127900949.png' },
      { baseId: '10-ticket-legoland', artifact: 'scenic_legoland_1775127920591.png' },
      { baseId: '11-ticket-shibuya-sky', artifact: 'scenic_shibuya_1775127938631.png' },
      { baseId: '12-ticket-ghibli', artifact: 'scenic_ghibli_1775127965326.png' }
  ];

  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('wowtour-gig');

  for (const ticket of NEW_TICKETS) {
    const sourcePath = path.join(artifactsDir, ticket.artifact);
    const newFileName = `${ticket.baseId}${vSuffix}.webp`;
    const tempWebpPath = path.join(process.cwd(), 'tmp', newFileName);
    
    if(!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'tmp'));
    }

    try {
        await sharp(sourcePath).webp({ quality: 80 }).toFile(tempWebpPath);
        const stats = fs.statSync(tempWebpPath);
        
        const fileStream = fs.createReadStream(tempWebpPath);
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: newFileName,
            Body: fileStream,
            ContentType: 'image/webp',
            ACL: 'public-read',
        }));
        
        // 1. We must find the record by matching the base name prefix in filename, e.g. "01-ticket-usj"
        // or just by finding the document that starts with the baseId 
        await db.collection('media').updateOne(
            { filename: { $regex: new RegExp('^' + ticket.baseId) } },
            { $set: { 
                filename: newFileName,
                url: `/${newFileName}`,
                filesize: stats.size,
                mimeType: 'image/webp'
            }}
        );
        
        console.log(`Busted cache for ${newFileName}`);
    } catch(e) {
        console.error(`Error processing ${ticket.baseId}: `, e);
    }
  }
  
  await client.close();
  console.log("Done upgrading TICKETS to CDN Safe V3.");
}

run().catch(console.error);
