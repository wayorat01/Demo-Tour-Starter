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
            draft: true,
        });
        
        console.log("Page found. Processing...");

        const media = await payload.find({
            collection: 'media',
            where: { mimeType: { like: 'image' } },
            limit: 12,
        });

        const imageIds = media.docs.map(d => d.id);
        const getImage = (index: number) => imageIds[index % imageIds.length];

        const mockCars = [
            { name: 'Nissan Serena', price: 2000, desc: 'รถครอบครัว 7 ที่นั่ง กว้างขวาง นั่งสบาย เหมาะสำหรับการเดินทางเป็นครอบครัว' },
            { name: 'Toyota Alphard', price: 5500, desc: 'รถตู้ระดับพรีเมียม VIP 7 ที่นั่ง หรูหรา พร้อมคนขับมืออาชีพ' },
            { name: 'Honda Odyssey', price: 3500, desc: 'รถมินิแวน 7 ที่นั่ง ดีไซน์สปอร์ต ช่วงล่างนุ่มนวล พร้อมระบบความปลอดภัยครบครัน' },
            { name: 'Hyundai Staria', price: 4500, desc: 'รถตู้ดีไซน์ล้ำอนาคต 11 ที่นั่ง ภายในกว้างขวาง เหมาะกับกลุ่มเพื่อนหรือครอบครัวใหญ่' },
            { name: 'Toyota Camry', price: 2500, desc: 'รถเก๋งซีดานหรู 4 ที่นั่ง ดีไซน์สปอร์ต และสมรรถนะดีเยี่ยมตลอดการเดินทาง' },
            { name: 'Mercedes-Benz E-Class', price: 7500, desc: 'รถหรูระดับ Executive 4 ที่นั่ง ให้ภาพลักษณ์ที่ดูภูมิฐาน พร้อมความสบายสูงสุด' },
            { name: 'BMW 5 Series', price: 7000, desc: 'รถหรูสไตล์สปอร์ตซีดาน 4 ที่นั่ง สมรรถนะแรง ขับสนุก นุ่มนวลในทุกเส้นทาง' },
            { name: 'Toyota Voxy', price: 2800, desc: 'มินิแวนอเนกประสงค์ 7 ที่นั่ง ประตูสไลด์ไฟฟ้าขึ้นลงสะดวก เหมาะกับทริปครอบครัว' },
            { name: 'Nissan Elgrand', price: 4800, desc: 'รถตู้พรีเมียม 7 ที่นั่ง ระบบขับเคลื่อนยอดเยี่ยม ออกแบบมาเพื่อความผ่อนคลาย' },
            { name: 'BMW 7 Series', price: 12000, desc: 'ที่สุดของความหรูหรา ซีดาน 4 ที่นั่งระดับท็อป เตรียมพร้อมรับแขก VIP' },
            { name: 'Porsche Panamera', price: 15000, desc: 'สปอร์ตซีดานสุดหรู 4 ที่นั่ง ประสิทธิภาพเหนือความคาดหมาย หรูหราในทุกมุมมอง' },
            { name: 'Audi A6', price: 6500, desc: 'ซีดานระดับพรีเมียม 4 ที่นั่ง ภายในเรียบหรู พร้อมเทคโนโลยีล้ำสมัย' },
        ];

        const newLayout = page.layout.map((block: any) => {
            if (block.blockType === 'wowtourProductCard' && block.productType === 'car_rental') {
                const items = mockCars.map((car, index) => ({
                    coverImage: getImage(index),
                    title: car.name,
                    shortDescription: car.desc,
                    duration: 'รายวัน',
                    originalPrice: car.price,
                }));

                return {
                    ...block,
                    items
                };
            }
            return block;
        });

        await payload.update({
            collection: 'pages',
            id: '69cdec11a4273dcf86b2cb6a',
            data: { layout: newLayout },
            draft: true, // save as draft to avoid overriding published state unnecessarily
            context: { skipRevalidate: true }, // Prevent next.js revalidate hook failure
        });

        console.log("Successfully mocked 12 car rental items!");

    } catch (e) {
        console.error("Error updates:", e.message);
    }
    process.exit(0);
};

run();
