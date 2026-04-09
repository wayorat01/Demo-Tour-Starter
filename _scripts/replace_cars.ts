import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const vSuffix = '_v2';

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
  
  const NEW_CARS = [
      { oldName: 'mock_odyssey_1775121921850.webp', shortBase: 'mock_odyssey', artifact: 'honda_odyssey_city_1775128816220.png' },
      { oldName: 'mock_civic_1775122047617.webp', shortBase: 'mock_civic', artifact: 'honda_civic_city_1775128835449.png' }
  ];

  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('wowtour-gig');

  const tmpDir = path.join(process.cwd(), 'tmp');
  if(!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  for (const car of NEW_CARS) {
    const sourcePath = path.join(artifactsDir, car.artifact);
    const newFileName = `${car.shortBase}${vSuffix}.webp`;
    const tempWebpPath = path.join(tmpDir, newFileName);

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
        
        await db.collection('media').updateOne(
            { filename: car.oldName },
            { $set: { 
                filename: newFileName,
                url: `/${newFileName}`,
                filesize: stats.size,
                mimeType: 'image/webp'
            }}
        );
        console.log(`Updated DB: ${car.oldName} -> ${newFileName}`);
        
        // Clean up old from S3 if possible
        try {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET!,
                Key: car.oldName,
            }));
            console.log(`Deleted S3: ${car.oldName}`);
        } catch(e) {}
        
    } catch(e) {
        console.error(`Error processing ${car.shortBase}: `, e);
    }
  }
  
  await client.close();
  console.log("Done upgrading CAR models.");
}

run().catch(console.error);
