import { type NextRequest, NextResponse } from 'next/server';
import { FlashSaleService } from '@/lib/services/flashSale.service';
import { isFeatureEnabled } from '@/lib/feature-flags';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/flash-sales
 * Get all flash sales or filter by status
 */
export async function GET(req: NextRequest) {
  try {
    // Check if flash sales are enabled
    if (!isFeatureEnabled('FLASH_SALES_ENABLED')) {
      return NextResponse.json(
        { error: 'Flash sales are currently disabled' },
        { status: 503 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status'); // active, upcoming, past, all

    let flashSales;

    switch (status) {
      case 'active':
        flashSales = await FlashSaleService.getActiveFlashSales();
        break;
      case 'upcoming':
        flashSales = await FlashSaleService.getUpcomingFlashSales();
        break;
      case 'past':
        flashSales = await FlashSaleService.getPastFlashSales();
        break;
      default:
        flashSales = await FlashSaleService.getAllFlashSales();
    }

    return NextResponse.json({ flashSales });
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch flash sales';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/flash-sales
 * Create a new flash sale
 */
export async function POST(req: NextRequest) {
  try {
    // Check if flash sales are enabled
    if (!isFeatureEnabled('FLASH_SALES_ENABLED')) {
      return NextResponse.json(
        { error: 'Flash sales are currently disabled' },
        { status: 503 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (
      !body.title ||
      !body.startAt ||
      !body.endAt ||
      !body.targetTicketTypes ||
      !body.stripePriceId ||
      !body.originalStripePriceId
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: title, startAt, endAt, targetTicketTypes, stripePriceId, originalStripePriceId',
        },
        { status: 400 }
      );
    }

    // Validate dates
    const startAt = new Date(body.startAt);
    const endAt = new Date(body.endAt);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (endAt <= startAt) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate targetTicketTypes is an array
    if (!Array.isArray(body.targetTicketTypes)) {
      return NextResponse.json(
        { error: 'targetTicketTypes must be an array' },
        { status: 400 }
      );
    }

    const flashSale = await FlashSaleService.createFlashSale({
      title: body.title,
      description: body.description,
      startAt,
      endAt,
      targetTicketTypes: body.targetTicketTypes,
      stripePriceId: body.stripePriceId,
      originalStripePriceId: body.originalStripePriceId,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ flashSale }, { status: 201 });
  } catch (error) {
    console.error('Error creating flash sale:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create flash sale';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
