import { NextResponse } from 'next/server';

type RandomImage = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json([] as RandomImage[]);
    }

    const authHeader =
      'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    // 1) Get all event folders
    const foldersRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/folders/events`,
      {
        headers: { Authorization: authHeader },
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    );

    if (!foldersRes.ok) {
      return NextResponse.json([] as RandomImage[]);
    }

    const foldersData: { folders: { name: string; path: string }[] } =
      await foldersRes.json();
    const folders = foldersData.folders || [];

    // 2) Fetch images from all folders
    const allImages: Array<{
      id: string;
      url: string;
      width: number;
      height: number;
    }> = [];

    for (const folder of folders) {
      try {
        // Use only the most reliable search strategy to reduce API calls
        const expression = `folder:events/${folder.name} AND resource_type:image`;
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
              max_results: 15, // Reduced from 50 to 15
              sort_by: [{ created_at: 'desc' }],
            }),
            next: { revalidate: 1800 }, // Cache for 30 minutes
          }
        );

        if (searchRes.ok) {
          const data: {
            resources: {
              asset_id: string;
              secure_url: string;
              width: number;
              height: number;
            }[];
          } = await searchRes.json();

          if (data.resources && data.resources.length > 0) {
            // Add optimized images from this folder
            const folderImages = data.resources.map((img) => ({
              id: img.asset_id,
              url: img.secure_url.replace(
                '/upload/',
                '/upload/f_auto,q_auto:eco,w_250,h_170,c_fill/'
              ),
              width: img.width,
              height: img.height,
            }));

            allImages.push(...folderImages);
          }
        }
      } catch (error) {
        // Silently continue to next folder
      }
    }

    // 3) Shuffle and select 15 random images
    const shuffled = allImages.sort(() => 0.5 - Math.random());
    const randomImages = shuffled.slice(0, 16);

    return NextResponse.json(randomImages, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
        'CDN-Cache-Control': 'max-age=3600',
        Vary: 'Accept-Encoding',
      },
    });
  } catch (error: any) {
    return NextResponse.json([] as RandomImage[]);
  }
}
