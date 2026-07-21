import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getYithWishlist, addToYithWishlist, removeFromYithWishlist, WishlistError } from "@/lib/yithWishlist";

export const dynamic = 'force-dynamic';

export async function GET() {
  const tokenPayload = await getCurrentUser();
  if (!tokenPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await getYithWishlist();
    return NextResponse.json(items);
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    return NextResponse.json({ error: error.message || "Failed to fetch wishlist" }, { status: error.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  const tokenPayload = await getCurrentUser();
  if (!tokenPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { product_id } = await req.json();
    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const result = await addToYithWishlist(product_id);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    return NextResponse.json({ error: error.message || "Failed to add to wishlist" }, { status: error.statusCode || 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const tokenPayload = await getCurrentUser();
  if (!tokenPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { product_id } = await req.json();
    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const result = await removeFromYithWishlist(product_id);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') throw error;
    return NextResponse.json({ error: error.message || "Failed to remove from wishlist" }, { status: error.statusCode || 500 });
  }
}
