import { MongoClient } from "mongodb";

async function run() {
  const uri = "mongodb://127.0.0.1:27017";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('wowtour-gig');

  const tickets = [
      { baseId: '01-ticket-usj', v: '-v3' },
      { baseId: '02-ticket-disneyland', v: '-v3' },
      { baseId: '03-ticket-disneysea', v: '-v3' },
      { baseId: '04-ticket-fuji-q', v: '-v3' },
      { baseId: '05-ticket-osaka-aquarium', v: '-v3' },
      { baseId: '06-ticket-tokyo-skytree', v: '-v3' },
      { baseId: '07-ticket-harry-potter', v: '-v3' },
      { baseId: '08-ticket-teamlab', v: '-v3' },
      { baseId: '09-ticket-sanrio', v: '-v3' },
      { baseId: '10-ticket-legoland', v: '-v3' },
      { baseId: '11-ticket-shibuya-sky', v: '-v3' },
      { baseId: '12-ticket-ghibli', v: '-v3' }
  ];

  for (const t of tickets) {
      const match = await db.collection('media').findOne({ filename: new RegExp('^' + t.baseId) });
      if (match) {
          const newFileName = `${t.baseId}${t.v}.webp`;
          const res = await db.collection('media').updateOne(
              { _id: match._id }, 
              { $set: { 
                  filename: newFileName, 
                  url: `/${newFileName}` 
              } }
          );
          console.log(`Updated ticket ${match.filename} -> ${newFileName}`, res.modifiedCount);
      }
  }

  const cars = [
      { base: 'mock_odyssey', v: '_v2' },
      { base: 'mock_civic', v: '_v2' }
  ];

  for(const c of cars) {
      const match = await db.collection('media').findOne({ filename: new RegExp('^' + c.base) });
      if(match) {
          const newFileName = `${c.base}${c.v}.webp`;
          const res = await db.collection('media').updateOne(
              { _id: match._id },
              { $set: {
                  filename: newFileName,
                  url: `/${newFileName}`
              }}
          );
          console.log(`Updated car ${match.filename} -> ${newFileName}`, res.modifiedCount);
      }
  }

  await client.close();
}

run().catch(console.error);
