"use server";

import { getAuthenticatedCustomer } from "@/lib/customer";
import { fetchAuthenticated } from "@/lib/fetchAuthenticated";
import { fetchWC } from "@/api/client";
import { revalidatePath } from "next/cache";

export async function updateAddress(type: "billing" | "shipping", formData: FormData) {
  try {
    const customer = await getAuthenticatedCustomer();
    const customerId = customer.id;

    const payload = {
      [type]: {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        company: formData.get("company") as string,
        address_1: formData.get("address_1") as string,
        address_2: formData.get("address_2") as string,
        city: formData.get("city") as string,
        postcode: formData.get("postcode") as string,
        country: formData.get("country") as string,
        state: formData.get("state") as string,
        email: formData.get("email") as string, // billing only usually
        phone: formData.get("phone") as string,
      }
    };

    const updatedCustomer = await fetchWC(`customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    
    if (updatedCustomer && updatedCustomer.code) {
       throw new Error(updatedCustomer.message || "Failed to update address");
    }

    revalidatePath("/account/addresses");
    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to update ${type} address`, error);
    return { success: false, error: error.message || "Failed to update address" };
  }
}
