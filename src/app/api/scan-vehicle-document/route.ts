import { NextRequest, NextResponse } from "next/server";

const PROMPT = `Eres un experto en documentos vehiculares colombianos (tarjeta de propiedad, RUNT, matrícula).

Analiza la imagen y extrae ÚNICAMENTE los campos que puedas leer con alta confianza. Si un campo no es legible, no lo incluyas.

Devuelve un objeto JSON plano con los campos detectados. Sin texto adicional, sin markdown, solo el JSON.

Campos posibles:
- "plate": Placa (ej: "ABC123" o "ABC1234", mayúsculas sin espacios)
- "brand": Marca en mayúsculas (ej: "CHEVROLET", "RENAULT", "TOYOTA", "NISSAN")
- "line": Línea en mayúsculas (ej: "SPARK", "LOGAN", "COROLLA")
- "year": Año modelo como string de 4 dígitos (ej: "2019")
- "color": Color en español (ej: "Blanco", "Gris", "Rojo")
- "motor": Cilindraje convertido a litros (ej: si dice 1600cc → "1.6L", si dice 1000 → "1.0L", si ya está en litros mantén el formato "1.4L")
- "fuel": Uno de: "Gasolina", "Diésel", "Gas natural", "Eléctrico", "Híbrido"
- "transmission": Uno de: "Manual", "Automática"
- "traction": Tracción (ej: "4x2", "4x4")
- "cityRegistration": Nombre de la ciudad u organismo de tránsito colombiano (ej: "Bogotá D.C.", "Medellín", "Cali")

Reglas estrictas:
- Solo incluye campos legibles con certeza
- "fuel" y "transmission" SOLO pueden tener los valores exactos listados arriba
- "plate" siempre en mayúsculas, formato colombiano (3 letras + 3-4 dígitos)
- Para cilindraje: convierte cc a litros redondeando (998→1.0L, 1400→1.4L, 1598→1.6L, 1984→2.0L)
- Si el documento muestra "GASOLINA" → "Gasolina", "DIESEL"/"DIÉSEL" → "Diésel"
- Responde SOLO con el JSON`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "No se pudo leer la imagen." }, { status: 400 });
  }

  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No se recibió imagen." }, { status: 400 });

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "La imagen no debe superar 5 MB." }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Formato no soportado. Usa JPG, PNG o WebP." }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mediaType = file.type === "image/jpg" ? "image/jpeg" : file.type as "image/jpeg" | "image/png" | "image/webp";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as any)?.error?.message ?? "Error en la API de IA." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw: string = data?.content?.[0]?.text?.trim() ?? "";

    let fields: Record<string, string> = {};
    try {
      fields = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) fields = JSON.parse(match[0]);
    }

    const detectedFields = Object.keys(fields).filter((k) => fields[k]?.trim());

    return NextResponse.json({ fields, detectedFields });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error procesando el documento.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
