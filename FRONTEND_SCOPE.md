# Alcance visual entregado

Esta entrega no conecta backend. Ese es el punto: validar primero la experiencia visual y operativa.

## Pantallas reales incluidas

- `/` Dashboard principal
- `/login` Login visual
- `/inventario` Inventario vehicular
- `/vehiculos` Tabla de vehículos
- `/vehiculos/veh-001` Ficha individual de vehículo
- `/ventas` Ventas y separaciones
- `/comisiones` Asesores y comisiones
- `/banco` Contabilidad bancaria
- `/efectivo` Contabilidad en efectivo por ubicación
- `/reportes` Reportes consolidados
- `/alertas` Alertas críticas
- `/usuarios` Usuarios y permisos
- `/configuracion` Reglas internas

## Decisiones importantes

- La app está diseñada principalmente para escritorio.
- La versión móvil prioriza consulta rápida.
- La data está en `src/data/mock.ts` para poder reemplazarla luego por Supabase.
- Los componentes están separados por dominio, no todo en una sola pantalla.
- El estilo visual es oscuro, premium, corporativo, minimalista y con acento dorado.
