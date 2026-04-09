import payload from 'payload';
import config from './src/payload.config';

const run = async () => {
    await payload.init({
        config,
        local: true,
    });

    try {
        const page = await payload.findByID({
            collection: 'pages',
            id: '69cdec11a4273dcf86b2cb6a',
            draft: true, // Fetch it even if it's a draft
        });
        
        console.log("Page found!");
        console.log("Status:", page._status);
        console.log("Title:", page.title);
        
        const pb = page.layout?.find((b: any) => b.blockType === 'WowtourProductCardBlock');
        if (pb && pb.tours) {
            console.log(`Found WowtourProductCardBlock. Tours count: ${pb.tours.length}`);
            if (pb.tours.length > 0) {
               console.log("First tour title:");
               console.log(pb.tours[0].tourTitle);
               console.log("First tour details:");
               console.log(JSON.stringify(pb.tours[0], null, 2));
            }
        } else {
            console.log("No WowtourProductCardBlock or tours found in layout.");
            console.log("Available blocks in layout:", page.layout?.map((b: any) => b.blockType));
        }
    } catch (e) {
        console.error("Error fetching page:", e.message);
    }
    process.exit(0);
};

run();
