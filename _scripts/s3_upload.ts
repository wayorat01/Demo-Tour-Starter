import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config(); // load .env

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const publicMediaDir = path.join(process.cwd(), 'public', 'media');
const files = fs.readdirSync(publicMediaDir).filter(f => f.startsWith('mock_') && f.endsWith('.png'));

async function uploadToS3() {
  for (const file of files) {
    const filePath = path.join(publicMediaDir, file);
    const fileStream = fs.createReadStream(filePath);
    console.log(`Uploading ${file} to S3...`);
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: file, // root of bucket
      Body: fileStream,
      ContentType: 'image/png',
      ACL: 'public-read', // ensure public access
    });
    
    try {
      await s3Client.send(command);
      console.log(`Success: ${file}`);
    } catch (e) {
      console.error(`Error uploading ${file}:`, e);
    }
  }
  console.log("All uploads complete!");
}

uploadToS3();
