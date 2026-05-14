"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import { deleteCustomer } from "@/lib/data/customers";

export async function deleteCustomerAction(
  customerId: string,
  reason?: string
): Promise<{ error?: string }> {
  const { name, role } = await getCurrentUserProfile();

  if (role !== "admin") {
    return { error: "Solo el administrador puede eliminar clientes." };
  }

  try {
    await deleteCustomer(customerId, name, reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo eliminar el cliente." };
  }

  revalidatePath("/clientes");
  revalidatePath("/");
  redirect("/clientes");
}
