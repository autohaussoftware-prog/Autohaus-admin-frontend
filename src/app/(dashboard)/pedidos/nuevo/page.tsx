import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { OrderForm } from "@/components/orders/order-form";

export default function NuevoPedidoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gestión comercial"
        title="Nuevo pedido"
        description="Registra la solicitud de un cliente. Los campos con * son obligatorios."
      />

      <div className="mb-4 flex">
        <Link href="/pedidos" className={buttonClassName({ variant: "outline" })}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      <OrderForm />
    </>
  );
}
