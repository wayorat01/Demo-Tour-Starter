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
const files = fs.readdirSync(publicMediaDir).filter(f => f.match(/\.(png|jpg|jpeg|webp|svg)$/i));

async function uploadToS3() {
  for (const file of files) {
    const filePath = path.join(publicMediaDir, file);
    const fileStream = fs.createReadStream(filePath);
    console.log(`Uploading ${file} to S3...`);
    
    let contentType = 'image/png';
    if(file.endsWith('.jpg') || file.endsWith('.jpeg')) contentType = 'image/jpeg';
    if(file.endsWith('.webp')) contentType = 'image/webp';
    if(file.endsWith('.svg')) contentType = 'image/svg+xml';

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: encodeURI(file), // Payload's generateFileURL encodes the URI, S3 key should match! Wait, S3 keys are usually literal. If Payload encodes URI when fetching, the S3 Key should remain literal.
    // Let's use the literal file name.
      Body: fileStream,
      ContentType: contentType,
      ACL: 'public-read',
    });
    
    try {
      // We overwrite existing or just upload everything. Let's execute.
      command.input.Key = file;
      await s3Client.send(command);
      console.log(`Success: ${file}`);
    } catch (e) {
      console.error(`Error uploading ${file}:`, e);
    }
  }
  console.log("All uploads complete!");
}

uploadToS3();
