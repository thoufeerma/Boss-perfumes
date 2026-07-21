"use server";

import { getAuthenticatedCustomer } from "@/lib/customer";
import { fetchAuthenticated } from "@/lib/fetchAuthenticated";
import { revalidatePath } from "next/cache";

export async function updateAccountDetails(formData: FormData) {
  try {
    const customer = await getAuthenticatedCustomer();
    const customerId = customer.id;

    const payload = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      // You can add more fields if needed by WooCommerce REST API (e.g. billing phone etc)
      billing: {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") as string,
      },
      shipping: {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
      }
    };

    await fetchAuthenticated(`customers/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    revalidatePath("/account/details");
    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to update account details`, error);
    return { success: false, error: error.message || "Failed to update account details" };
  }
}
