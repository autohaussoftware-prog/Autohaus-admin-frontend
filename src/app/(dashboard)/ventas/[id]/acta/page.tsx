import { notFound } from "next/navigation";
import { getSaleById } from "@/lib/data/sales";
import { getPaymentsBySaleId } from "@/lib/data/payments";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

const CHECKLIST = [
  "Llaves entregadas al cliente",
  "Manual de propietario entregado",
  "SOAT vigente al momento de entrega",
  "Documentos de transferencia firmados",
  "Pago total recibido o acuerdo de saldo formalizado",
  "Vehículo limpio e inspeccionado",
  "Tarjeta de propiedad o trámite de traspaso iniciado",
];

export default async function ActaEntregaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sale, payments] = await Promise.all([getSaleById(id), getPaymentsBySaleId(id)]);

  if (!sale) notFound();

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0) + sale.initialPayment;

  return (
    <html lang="es">
      <head>
        <title>Acta de entrega — {sale.vehicleName}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Arial', sans-serif; font-size: 12px; color: #111; background: #fff; padding: 32px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          h2 { font-size: 13px; font-weight: 700; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #111; padding-bottom: 16px; }
          .logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
          .logo span { color: #b8891f; }
          .doc-info { text-align: right; font-size: 11px; color: #555; }
          .section { margin-bottom: 24px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; }
          .field { margin-bottom: 6px; }
          .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; display: block; margin-bottom: 2px; }
          .field p { font-weight: 600; }
          .checklist { list-style: none; }
          .checklist li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 11.5px; }
          .box { width: 14px; height: 14px; border: 1.5px solid #999; border-radius: 2px; flex-shrink: 0; margin-top: 1px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
          .sig-line { border-top: 1px solid #999; padding-top: 6px; font-size: 11px; color: #555; }
          .highlight { background: #fef9ec; border: 1px solid #e8c96c; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; }
          .highlight .amount { font-size: 18px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { text-align: left; padding: 6px 8px; background: #f4f4f4; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: #555; }
          td { padding: 6px 8px; border-bottom: 1px solid #eee; }
          .footer { margin-top: 32px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
          @media print {
            body { padding: 16px; }
            .no-print { display: none; }
          }
        `}</style>
      </head>
      <body>
        <button
          onClick={() => window.print()}
          className="no-print"
          style={{ marginBottom: 24, padding: "8px 16px", background: "#111", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
        >
          Imprimir / Guardar PDF
        </button>

        <div className="header">
          <div>
            <div className="logo">AUTO<span>HAUS</span></div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Compraventa de vehículos</div>
          </div>
          <div className="doc-info">
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>ACTA DE ENTREGA</p>
            <p>Fecha: {formatDate(new Date().toISOString())}</p>
            <p style={{ color: "#888", fontSize: 10 }}>Ref: {sale.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="section">
          <h2>Datos del vehículo</h2>
          <div className="grid-3">
            <div className="field"><label>Marca / Línea</label><p>{sale.vehicleBrand} {sale.vehicleLine}</p></div>
            {sale.vehicleVersion && <div className="field"><label>Versión</label><p>{sale.vehicleVersion}</p></div>}
            <div className="field"><label>Placa</label><p>{sale.vehiclePlate || "Sin placa"}</p></div>
          </div>
        </div>

        <div className="section">
          <h2>Datos del comprador</h2>
          <div className="grid-2">
            <div className="field"><label>Nombre</label><p>{sale.customerName ?? "—"}</p></div>
            <div className="field"><label>Documento</label><p>{sale.customerDocument ?? "—"}</p></div>
            <div className="field"><label>Teléfono</label><p>{sale.customerPhone ?? "—"}</p></div>
            {sale.sellerName && <div className="field"><label>Asesor vendedor</label><p>{sale.sellerName}</p></div>}
          </div>
        </div>

        <div className="section">
          <h2>Condiciones comerciales</h2>
          <div className="highlight">
            <div className="grid-3">
              <div>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>PRECIO ACORDADO</div>
                <div className="amount">{formatCurrency(sale.agreedPrice)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>TOTAL RECIBIDO</div>
                <div className="amount" style={{ color: "#2d6a3f" }}>{formatCurrency(totalPaid)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>SALDO PENDIENTE</div>
                <div className="amount" style={{ color: sale.pendingBalance > 0 ? "#b91c1c" : "#2d6a3f" }}>
                  {sale.pendingBalance > 0 ? formatCurrency(sale.pendingBalance) : "Saldado"}
                </div>
              </div>
            </div>
          </div>

          {payments.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Canal</th>
                  <th>Referencia</th>
                  <th style={{ textAlign: "right" }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{formatDate(sale.createdAt)}</td>
                  <td>—</td>
                  <td>Abono inicial</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(sale.initialPayment)}</td>
                </tr>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.date)}</td>
                    <td>{p.channel}</td>
                    <td>{p.reference || p.notes || "—"}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="section">
          <h2>Checklist de entrega</h2>
          <p style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>
            Confirmo que los siguientes ítems fueron verificados al momento de la entrega:
          </p>
          <ul className="checklist">
            {CHECKLIST.map((item) => (
              <li key={item}>
                <div className="box" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="section">
          <p style={{ fontSize: 11, color: "#444", lineHeight: 1.6 }}>
            Las partes suscritas declaran que el vehículo descrito ha sido entregado en las condiciones acordadas,
            que todos los documentos han sido revisados y que el comprador declara haber recibido el vehículo
            a su entera satisfacción.
          </p>
        </div>

        <div className="signatures">
          <div>
            <div className="sig-line">Firma del vendedor / Autohaus</div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#666" }}>Nombre: {sale.sellerName ?? "___________________"}</div>
            <div style={{ marginTop: 4, fontSize: 11, color: "#666" }}>Fecha: ___________________</div>
          </div>
          <div>
            <div className="sig-line">Firma del comprador</div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#666" }}>Nombre: {sale.customerName ?? "___________________"}</div>
            <div style={{ marginTop: 4, fontSize: 11, color: "#666" }}>C.C.: {sale.customerDocument ?? "___________________"}</div>
          </div>
        </div>

        <div className="footer">
          <p>Autohaus · Este documento es válido como acta de entrega del vehículo descrito.</p>
        </div>
      </body>
    </html>
  );
}
