import configPromise from '@payload-config';
import { getPayload } from 'payload';

async function run() {
  try {
    const payload = await getPayload({ config: configPromise });

    // 1. Re-save Admission Tickets
    console.log('Finding admission-tickets page...');
    const admissionQuery = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'admission-tickets' } },
      depth: 0,
    });

    if (admissionQuery.docs.length > 0) {
      const admissionId = admissionQuery.docs[0].id;
      console.log(`Re-saving admission-tickets (ID: ${admissionId})...`);
      await payload.update({
        collection: 'pages',
        id: admissionId,
        data: {
          // Just making a dummy update to trigger hooks
          title: admissionQuery.docs[0].title, 
        },
      });
      console.log('✅ admission-tickets page saved and cache busted!');
    } else {
      console.log('❌ admission-tickets page not found.');
    }

    // 2. Re-save Car Rental
    console.log('Finding car-rental page...');
    const carQuery = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'car-rental' } },
      depth: 0,
    });

    if (carQuery.docs.length > 0) {
      const carId = carQuery.docs[0].id;
      console.log(`Re-saving car-rental (ID: ${carId})...`);
      await payload.update({
        collection: 'pages',
        id: carId,
        data: {
          title: carQuery.docs[0].title,
        },
      });
      console.log('✅ car-rental page saved and cache busted!');
    } else {
      console.log('❌ car-rental page not found.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
