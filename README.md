# Autohaus Admin Frontend

Frontend administrativo para Autohaus: compraventa de vehículos de alto valor.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts
- Framer Motion

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Rutas principales: `/`, `/login`, `/inventario`, `/vehiculos`, `/vehiculos/veh-001`, `/ventas`, `/comisiones`, `/banco`, `/efectivo`, `/reportes`, `/alertas`, `/usuarios`, `/configuracion`.

## Estado actual

Esta versión es frontend visual sólido con data mockeada. Está preparada para conectar Supabase después sin rehacer el diseño.

La definición propuesta para entrada de datos, formularios, modelo mínimo y fases de backend está en [`DATA_INPUT_BLUEPRINT.md`](./DATA_INPUT_BLUEPRINT.md).

## Módulos incluidos

- Login visual
- Dashboard ejecutivo
- Inventario vehicular
- Ficha individual de vehículo
- Ventas y separaciones
- Comisiones
- Banco
- Efectivo por ubicación
- Reportes consolidados
- Alertas críticas
- Usuarios
- Configuración
