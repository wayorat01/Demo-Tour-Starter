import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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
  const publicMediaDir = path.join(process.cwd(), 'public', 'media');
  // Match 01-MSC-World-Europa.png to 12-Silversea-Greek-Islands.png
  const files = fs.readdirSync(publicMediaDir).filter((f: string) => /^\d{2}-.*\.png$/.test(f));
  
  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('wowtour-gig');

  for (const file of files) {
    const pngPath = path.join(publicMediaDir, file);
    const webpFile = file.replace('.png', '.webp');
    const webpPath = path.join(publicMediaDir, webpFile);
    
    // 1. Convert to WEBP
    await sharp(pngPath).webp({ quality: 80 }).toFile(webpPath);
    const stats = fs.statSync(webpPath);
    console.log(`Converted: ${file} -> ${webpFile} (${Math.round(stats.size/1024)}KB)`);
    
    // 2. Upload WEBP to S3
    const fileStream = fs.createReadStream(webpPath);
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: webpFile, // Use literal file name
      Body: fileStream,
      ContentType: 'image/webp',
      ACL: 'public-read',
    }));
    
    // 3. Delete old PNG from S3
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: file
      }));
    } catch(e) {
      console.log(`Could not delete S3 object ${file}`);
    }
    
    // 4. Update MongoDB
    await db.collection('media').updateOne(
      { filename: file },
      { $set: { 
          filename: webpFile, 
          url: `/media/${webpFile}`, 
          mimeType: 'image/webp',
          filesize: stats.size 
      }}
    );
    
    // 5. Delete local PNG
    fs.unlinkSync(pngPath);
  }
  
  await client.close();
  console.log("Done upgrading cruises to WEBP.");
  
  // Bust cache
  fs.writeFileSync('next.config.ts', fs.readFileSync('next.config.ts'));
}

run().catch(console.error);
