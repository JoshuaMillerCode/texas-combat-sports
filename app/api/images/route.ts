import { NextRequest, NextResponse } from 'next/server';

// Response shape from Cloudinary Search API (subset used)
type CloudinarySearchResource = {
  asset_id: string;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
};

type ApiResponse = {
  resources: Array<{
    id: string;
    publicId: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
  }>;
  nextCursor?: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const nextCursor = searchParams.get('nextCursor');

    if (!folder) {
      return NextResponse.json(
        { error: "Missing required 'folder' query parameter" },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary credentials are not configured' },
        { status: 500 }
      );
    }

    console.log('Fetching images for folder:', folder);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;

    // Use precise folder search
    const expression = `folder:${folder} AND resource_type:image`;
    console.log('Search expression:', expression);

    const body: Record<string, unknown> = {
      expression,
      max_results: 20,
      sort_by: [{ created_at: 'desc' }],
    };

    if (nextCursor && nextCursor.length > 0) {
      body.next_cursor = nextCursor;
    }

    const authHeader =
      'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Cloudinary search failed:', text);
      return NextResponse.json(
        { error: `Cloudinary error: ${text}` },
        { status: response.status }
      );
    }

    const data: {
      resources: CloudinarySearchResource[];
      next_cursor?: string;
    } = await response.json();

    console.log(
      `Found ${data.resources?.length || 0} images for folder: ${folder}`
    );
    data.resources?.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.public_id}`);
    });

    const resources = (data.resources || []).map((r) => ({
      id: r.asset_id,
      publicId: r.public_id,
      secureUrl: r.secure_url.replace(
        '/upload/',
        '/upload/f_webp,q_85,w_1200/'
      ),
      width: r.width,
      height: r.height,
      format: r.format,
    }));

    return NextResponse.json({
      resources,
      nextCursor: data.next_cursor,
    });
  } catch (error: any) {
    console.error('Error in images API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
