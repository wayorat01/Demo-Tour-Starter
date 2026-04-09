const { MongoClient, ObjectId } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('wowtour-gig');
  
  // Check if the referenced ID exists in intertours
  const testId = '697f495fb07e2531cfac1a53';
  const found = await db.collection('intertours').findOne({ _id: new ObjectId(testId) });
  console.log('Header ref ID', testId, 'exists?', !!found);
  if (found) {
    console.log('  Found:', typeof found.title === 'object' ? found.title.th : found.title);
  }
  
  // List actual intertours IDs 
  const allTours = await db.collection('intertours').find({}).project({ _id: 1, title: 1 }).limit(5).toArray();
  console.log('\nActual intertours IDs in DB:');
  for (const t of allTours) {
    console.log(' ', t._id.toString(), '->', typeof t.title === 'object' ? t.title.th : t.title);
  }
  
  // Count how many header tour refs are valid vs broken
  const header = await db.collection('globals').findOne({ globalType: 'header' });
  const items = [...(header.richItems || []), ...(header.items || [])];
  let valid = 0, broken = 0;
  const brokenIds = [];
  for (const item of items) {
    const blocks = item.blockType === 'submenu' ? (item.blocks || []) : [item];
    for (const block of blocks) {
      if (block.blockType !== 'tourCategoryMenu') continue;
      for (const tour of (block.tours || [])) {
        const id = typeof tour.value === 'string' ? tour.value : null;
        if (!id) continue;
        const exists = await db.collection(tour.relationTo).findOne({ _id: new ObjectId(id) });
        if (exists) valid++;
        else {
          broken++;
          brokenIds.push({ id, relationTo: tour.relationTo });
        }
      }
    }
  }
  console.log('\nHeader tour refs: valid=' + valid + ', broken=' + broken);
  if (brokenIds.length > 0) {
    console.log('Broken refs (first 5):');
    for (const b of brokenIds.slice(0, 5)) {
      console.log('  -', b.relationTo, ':', b.id);
    }
  }
  
  await client.close();
}
run();
