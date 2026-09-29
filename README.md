# Esquema canónico · Cliente v1

Servicio que aplica los patrones SOA **Canonical Schema** y **Decoupled Contract** a un problema
frecuente de integración: varios sistemas describen la misma entidad con estructuras, nombres de
atributos y formatos distintos, y cada integración punto a punto termina con su propia conversión
y sus propios errores.

**Demostración en vivo:** https://esquema-canonico-soa.vercel.app

## El problema

Tres sistemas manejan el mismo cliente:

| Sistema | Formato | Diferencias |
|---|---|---|
| Ventas | JSON | nombres en `snake_case`, documento con puntos, fecha `DD/MM/AAAA` |
| CRM | XML | nombres y apellidos separados, tipo de documento como atributo (`tipo="cedula"`) |
| Facturación | JSON | atributos en inglés, documento anidado (`document.type`, `document.number`) |

Sin un modelo común, con *n* sistemas hacen falta hasta *n × (n − 1)* conversiones distintas y
cualquier cambio de un sistema rompe a sus consumidores.

## La solución

```
Ventas (JSON) ─┐
CRM (XML) ─────┼─► Servicio de transformación ─► Cliente canónico v1 ─► consumidores
Facturación ───┘         │            ▲
                         ▼            │
               Registro de servicios  Contrato (JSON Schema)
```

- **Canonical Schema.** Cada sistema tiene un adaptador que lee *su* formato y lo entrega en el
  modelo común `Cliente canónico v1`. Ningún sistema necesita conocer el formato de los demás.
- **Decoupled Contract.** El contrato vive aparte de la implementación, en
  [`contrato/cliente-canonico.v1.schema.json`](contrato/cliente-canonico.v1.schema.json), y se
  publica en `/api/contrato`. El validador lee ese archivo; no hay reglas duplicadas en el código.
- **Registro de servicios.** `/api/registro` describe cada servicio: propósito, proveedor, versión,
  ubicación, operaciones y formatos de entrada y salida.

Reglas de normalización comunes: tipo de documento a `CC | CE | NIT | PA | TI`, teléfono a
`+57` más 10 dígitos, fechas a ISO 8601 y nombre en formato título.

## API

| Método | Ruta | Respuesta |
|---|---|---|
| `POST` | `/api/transformar?origen=ventas\|crm\|facturacion` | `200` cliente canónico · `400` origen desconocido o cuerpo ilegible · `422` no cumple el contrato, con **todos** los errores |
| `GET` | `/api/contrato` | JSON Schema del Cliente canónico v1 |
| `GET` | `/api/registro` | registro de servicios |
| `GET` | `/api/salud` | estado del servicio |
| `GET` | `/api/ejemplos` | mensajes de ejemplo de cada sistema |

Ejemplo:

```bash
curl -X POST "https://esquema-canonico-soa.vercel.app/api/transformar?origen=crm" \
  --data '<cliente><id>CRM-0042</id><documento tipo="cedula">1020304050</documento><nombres>Ana María</nombres><apellidos>Rojas Pérez</apellidos><email>ana.rojas@example.com</email><creado>2026-09-15</creado></cliente>'
```

```json
{
  "version": "1.0",
  "idCliente": "CRM-0042",
  "tipoDocumento": "CC",
  "numeroDocumento": "1020304050",
  "nombreCompleto": "Ana María Rojas Pérez",
  "correo": "ana.rojas@example.com",
  "fechaRegistro": "2026-09-15",
  "sistemaOrigen": "crm"
}
```

## Estructura

```
api/          funciones HTTP (una por ruta)
contrato/     contrato canónico en JSON Schema (fuente de verdad)
public/       interfaz web de prueba
src/
  adaptadores.js   un adaptador por sistema de origen
  normalizar.js    reglas de representación comunes
  validador.js     valida contra el contrato
  servicio.js      orquesta adaptador + validación
  registro.js      registro de servicios
specs/        especificación con requisitos y criterios de aceptación
test/         pruebas (una por criterio de aceptación)
```

## Ejecutar y probar

Requiere Node.js 22 o superior. No tiene dependencias.

```bash
npm test
```

Para levantarlo en local con el mismo entorno del despliegue: `npx vercel dev`.

## Despliegue

Desplegado en Vercel: la carpeta `public/` se sirve como sitio estático y cada archivo de `api/`
es una función. Los datos de ejemplo son ficticios (dominios `example.com`).

## Limitaciones

- No persiste los clientes ni los reenvía a otros sistemas: el alcance es transformar y validar.
- El lector de XML cubre documentos planos de un nivel, como el del CRM de ejemplo.
- Sin autenticación.

## Referencias

- Erl, T. (2009). *SOA design patterns*. Prentice Hall. Perfiles de
  [Canonical Schema](https://patterns.arcitura.com/soa-patterns/design_patterns/canonical_schema) y
  [Decoupled Contract](https://patterns.arcitura.com/soa-patterns/design_patterns/decoupled_contract).
- Hohpe, G., y Woolf, B. (2003). *Enterprise integration patterns*. Addison-Wesley.
  [Canonical Data Model](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CanonicalDataModel.html).
- Wright, A., Andrews, H., Hutton, B., y Dennis, G. (2022). *JSON Schema: A media type for describing
  JSON documents* (draft 2020-12). https://json-schema.org/draft/2020-12/json-schema-core

## Licencia

MIT
