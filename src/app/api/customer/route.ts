import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/customer";
import { fetchWC } from "@/api/client";

const ADDRESS_FIELDS = [
  "first_name", "last_name", "company", "address_1", "address_2",
  "city", "state", "postcode", "country", "phone",
] as const;

function pickAddress(input: unknown, allowEmail: boolean): Record<string, string> | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const source = input as Record<string, unknown>;
  const fields: readonly string[] = allowEmail ? [...ADDRESS_FIELDS, "email"] : ADDRESS_FIELDS;
  const out: Record<string, string> = {};
  for (const key of fields) {
    const value = source[key];
    if (typeof value === "string") out[key] = value.slice(0, 200);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function pickCustomerFields(body: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (typeof body.first_name === "string") payload.first_name = body.first_name.slice(0, 100);
  if (typeof body.last_name === "string") payload.last_name = body.last_name.slice(0, 100);
  // The billing contact email is order paperwork, not the login email.
  const billing = pickAddress(body.billing, true);
  if (billing) payload.billing = billing;
  const shipping = pickAddress(body.shipping, false);
  if (shipping) payload.shipping = shipping;
  return payload;
}

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
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // This request runs with admin WooCommerce credentials, so only forward the profile
    // fields a shopper may edit here. Account email, password, role and meta_data are
    // never accepted from the browser.
    const payload = pickCustomerFields(body);
    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No editable fields supplied" }, { status: 400 });
    }

    // Update the customer in WooCommerce
    const updatedCustomer = await fetchWC(`customers/${customer.id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
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
