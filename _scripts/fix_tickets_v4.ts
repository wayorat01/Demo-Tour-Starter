import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const vSuffix = '-v4';

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
  
  const TICKET_MAP = {
      'Universal Studios Japan': { base: '01-ticket-usj', artifact: 'scenic_usj_1775127753579.png' },
      'Tokyo Disneyland': { base: '02-ticket-disneyland', artifact: 'scenic_disneyland_1775127772874.png' },
      'Tokyo DisneySea': { base: '03-ticket-disneysea', artifact: 'scenic_disneysea_1775127789734.png' },
      'Fuji-Q Highland': { base: '04-ticket-fuji-q', artifact: 'scenic_fuji_q_1775127808113.png' },
      'Osaka Aquarium Kaiyukan': { base: '05-ticket-osaka-aquarium', artifact: 'scenic_aquarium_1775127822634.png' },
      'Tokyo Skytree': { base: '06-ticket-tokyo-skytree', artifact: 'scenic_skytree_1775127844646.png' },
      'Warner Bros. Studio - Harry Potter': { base: '07-ticket-harry-potter', artifact: 'scenic_harry_potter_1775127866706.png' },
      'teamLab Planets TOKYO': { base: '08-ticket-teamlab', artifact: 'scenic_teamlab_1775127884109.png' },
      'Sanrio Puroland': { base: '09-ticket-sanrio', artifact: 'scenic_sanrio_1775127900949.png' },
      'Legoland Japan': { base: '10-ticket-legoland', artifact: 'scenic_legoland_1775127920591.png' },
      'Shibuya Sky': { base: '11-ticket-shibuya-sky', artifact: 'scenic_shibuya_1775127938631.png' },
      'Ghibli Museum': { base: '12-ticket-ghibli', artifact: 'scenic_ghibli_1775127965326.png' }
  };

  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('wowtour-gig');

  // get the exact image IDs from the page items
  const page = await db.collection('pages').findOne({slug: 'admission-tickets'});
  const items = page.layout[0].items;

  for (const item of items) {
      const titleEn = item.title.en;
      const mediaId = item.coverImage;

      const mapping = TICKET_MAP[titleEn];
      if (!mapping) continue;

      const sourcePath = path.join(artifactsDir, mapping.artifact);
      const newFileName = `${mapping.base}${vSuffix}.webp`;
      const tempWebpPath = path.join(process.cwd(), 'tmp', newFileName);

      try {
          // generate webp
          await sharp(sourcePath).webp({ quality: 80 }).toFile(tempWebpPath);
          const stats = fs.statSync(tempWebpPath);
          
          // upload to S3
          const fileStream = fs.createReadStream(tempWebpPath);
          await s3Client.send(new PutObjectCommand({
              Bucket: process.env.S3_BUCKET!,
              Key: newFileName,
              Body: fileStream,
              ContentType: 'image/webp',
              ACL: 'public-read',
          }));
          
          // update exact media doc
          const updateRes = await db.collection('media').updateOne(
              { _id: mediaId },
              { $set: { 
                  filename: newFileName,
                  url: `/${newFileName}`,
                  filesize: stats.size,
                  mimeType: 'image/webp'
              }}
          );
          
          console.log(`Updated S3 and DB for ${titleEn}: ${newFileName} (Modified: ${updateRes.modifiedCount})`);
      } catch(e) {
          console.error(`Error processing ${titleEn}: `, e);
      }
  }

  // To trigger Next cache invalidate:
  const admissionId = page._id;
  await db.collection('pages').updateOne(
      { _id: admissionId },
      { $set: { updatedAt: new Date() } }
  );
  
  await client.close();
  console.log("Done fixing Tickets cache issues via V4.");
}

run().catch(console.error);
