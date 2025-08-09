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
      return NextResponse.json([] as GalleryEvent[]);
    }

    const foldersData: { folders: { name: string; path: string }[] } =
      await foldersRes.json();
    const folders = foldersData.folders || [];

    // 2) For each folder, fetch first image as thumbnail
    const events = await Promise.all(
      folders.map(async (f) => {
        try {
          // Use a more precise search that only looks in the specific folder
          const expression = `folder:events/${f.name} AND resource_type:image`;

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
            return { name: f.name } as GalleryEvent;
          }

          const data: {
            resources: { secure_url: string; public_id: string }[];
          } = await searchRes.json();

          if (data.resources && data.resources.length > 0) {
            const first = data.resources[0];
            const thumbUrl = first.secure_url.replace(
              '/upload/',
              '/upload/f_webp,q_85,w_600,h_400,c_fill/'
            );

            return {
              name: f.name,
              thumbnail: { url: thumbUrl },
            };
          } else {
            return { name: f.name } as GalleryEvent;
          }
        } catch (error) {
          return { name: f.name } as GalleryEvent;
        }
      })
    );

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json([] as GalleryEvent[]);
  }
}
