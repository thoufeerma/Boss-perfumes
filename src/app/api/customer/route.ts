import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/customer";
import { fetchWC } from "@/api/client";

export async function GET(req: NextRequest) {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ customer }, { status: 200 });
  } catch (error: any) {
    console.error("Customer GET error:", error);
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customer = await getAuthenticatedCustomer();
    if (!customer || !customer.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Update the customer in WooCommerce
    const updatedCustomer = await fetchWC(`customers/${customer.id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });

    if (!updatedCustomer || updatedCustomer.code) {
      console.error("WooCommerce Customer Update Error:", updatedCustomer);
      return NextResponse.json({ error: updatedCustomer?.message || "Failed to update profile" }, { status: 400 });
    }

    return NextResponse.json({ success: true, customer: updatedCustomer }, { status: 200 });

  } catch (error: any) {
    console.error("Customer PUT error:", error);
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
