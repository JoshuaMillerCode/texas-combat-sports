import { NextResponse } from 'next/server';

type GalleryEvent = {
  name: string;
  thumbnail?: { url: string };
};

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials not configured');
      return NextResponse.json([] as GalleryEvent[]);
    }

    const authHeader =
      'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    // 1) List subfolders under /events
    const foldersRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/folders/events`,
      {
        headers: { Authorization: authHeader },
        cache: 'no-store',
      }
    );

    if (!foldersRes.ok) {
      console.error('Failed to fetch folders:', await foldersRes.text());
      return NextResponse.json([] as GalleryEvent[]);
    }

    const foldersData: { folders: { name: string; path: string }[] } =
      await foldersRes.json();
    const folders = foldersData.folders || [];

    console.log(
      'Found folders:',
      folders.map((f) => f.name)
    );

    // 2) For each folder, fetch first image as thumbnail
    const events = await Promise.all(
      folders.map(async (f) => {
        try {
          console.log(`\n=== Fetching thumbnail for: ${f.name} ===`);

          // Use a more precise search that only looks in the specific folder
          const expression = `folder:events/${f.name} AND resource_type:image`;
          console.log('Search expression:', expression);

          const searchRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
            {
              method: 'POST',
              headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                expression,
                max_results: 10, // Get more results to see what's available
                sort_by: [{ created_at: 'desc' }],
              }),
              cache: 'no-store',
            }
          );

          if (!searchRes.ok) {
            console.log(`Search failed for ${f.name}:`, await searchRes.text());
            return { name: f.name } as GalleryEvent;
          }

          const data: {
            resources: { secure_url: string; public_id: string }[];
          } = await searchRes.json();

          console.log(
            `Found ${data.resources?.length || 0} images for ${f.name}:`
          );
          data.resources?.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img.public_id}`);
          });

          if (data.resources && data.resources.length > 0) {
            const first = data.resources[0];
            const thumbUrl = first.secure_url.replace(
              '/upload/',
              '/upload/f_webp,q_85,w_600,h_400,c_fill/'
            );
            console.log(`Selected thumbnail for ${f.name}: ${first.public_id}`);

            return {
              name: f.name,
              thumbnail: { url: thumbUrl },
            };
          } else {
            console.log(`No images found for ${f.name}`);
            return { name: f.name } as GalleryEvent;
          }
        } catch (error) {
          console.error(`Error fetching thumbnail for ${f.name}:`, error);
          return { name: f.name } as GalleryEvent;
        }
      })
    );

    console.log('\n=== Final Events Summary ===');
    events.forEach((e) => {
      console.log(
        `${e.name}: ${e.thumbnail ? 'Has thumbnail' : 'No thumbnail'}`
      );
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching gallery events:', error);
    return NextResponse.json([] as GalleryEvent[]);
  }
}
