"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/data/orders";
import type { OrderStatus } from "@/lib/data/orders";

const VALID_STATUSES: OrderStatus[] = ["Nuevo", "En búsqueda", "Contactado", "Cerrado"];

export async function updateOrderStatusAction(orderId: string, status: string): Promise<void> {
  if (!VALID_STATUSES.includes(status as OrderStatus)) return;
  await updateOrderStatus(orderId, status as OrderStatus);
  revalidatePath("/pedidos");
}
