import { type NextRequest, NextResponse } from 'next/server';
import { FlashSaleService } from '@/lib/services/flashSale.service';
import { isFeatureEnabled } from '@/lib/feature-flags';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/flash-sales/[id]
 * Get a specific flash sale by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if flash sales are enabled
    if (!isFeatureEnabled('FLASH_SALES_ENABLED')) {
      return NextResponse.json(
        { error: 'Flash sales are currently disabled' },
        { status: 503 }
      );
    }

    const flashSale = await FlashSaleService.getFlashSaleById(params.id);

    if (!flashSale) {
      return NextResponse.json(
        { error: 'Flash sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ flashSale });
  } catch (error) {
    console.error('Error fetching flash sale:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch flash sale';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PATCH /api/flash-sales/[id]
 * Update a flash sale
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if flash sales are enabled
    if (!isFeatureEnabled('FLASH_SALES_ENABLED')) {
      return NextResponse.json(
        { error: 'Flash sales are currently disabled' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    // Only include fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.startAt !== undefined) updateData.startAt = new Date(body.startAt);
    if (body.endAt !== undefined) updateData.endAt = new Date(body.endAt);
    if (body.targetTicketTypes !== undefined)
      updateData.targetTicketTypes = body.targetTicketTypes;
    if (body.stripePriceId !== undefined)
      updateData.stripePriceId = body.stripePriceId;
    if (body.originalStripePriceId !== undefined)
      updateData.originalStripePriceId = body.originalStripePriceId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Validate dates if both are provided
    if (updateData.startAt && updateData.endAt) {
      if (updateData.endAt <= updateData.startAt) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    const flashSale = await FlashSaleService.updateFlashSale(
      params.id,
      updateData
    );

    if (!flashSale) {
      return NextResponse.json(
        { error: 'Flash sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ flashSale });
  } catch (error) {
    console.error('Error updating flash sale:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update flash sale';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/flash-sales/[id]
 * Delete a flash sale
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if flash sales are enabled
    if (!isFeatureEnabled('FLASH_SALES_ENABLED')) {
      return NextResponse.json(
        { error: 'Flash sales are currently disabled' },
        { status: 503 }
      );
    }

    const success = await FlashSaleService.deleteFlashSale(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Flash sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Flash sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting flash sale:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete flash sale';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
