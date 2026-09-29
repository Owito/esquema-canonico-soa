# Spec 001 · Servicio de transformación al esquema canónico de Cliente

## Intención

Tres sistemas (Ventas, CRM y Facturación) intercambian datos de clientes con estructuras,
nombres de atributos y formatos distintos (JSON y XML). Cada integración punto a punto exige su
propia conversión y los errores aparecen en tiempo de ejecución. Este servicio aplica el patrón
**Canonical Schema**: todos los sistemas convierten su información a un único modelo común, el
**Cliente canónico v1**, cuyo contrato se publica aparte de la implementación (**Decoupled
Contract**).

## Comportamiento

- **R1.** Cuando un consumidor envía `POST /api/transformar?origen=<sistema>` con el cuerpo en el
  formato propio de ese sistema, el servicio responde `200` con el cliente en el esquema canónico.
- **R2.** Si el origen no está registrado, responde `400` con la lista de orígenes válidos.
- **R3.** Si el cuerpo no se puede leer en el formato del origen (JSON o XML mal formado), responde
  `400` indicando el formato esperado.
- **R4.** Si el resultado no cumple el contrato canónico, responde `422` con **todos** los errores
  encontrados, cada uno con el campo y el motivo, sin detenerse en el primero.
- **R5.** `GET /api/contrato` publica el JSON Schema del cliente canónico, que es la fuente de
  verdad de la validación (el validador lee ese archivo, no reglas duplicadas en el código).
- **R6.** `GET /api/registro` publica el registro de servicios: nombre, propósito, proveedor,
  versión, ubicación, operaciones y formatos de entrada y salida.
- **R7.** `GET /api/salud` responde `200` con el estado del servicio.
- **R8.** La interfaz web permite elegir el sistema de origen, editar un ejemplo, transformarlo y
  ver la respuesta canónica o los errores.

## Restricciones

- Sin dependencias de ejecución: solo la biblioteca estándar de Node.js (22 o superior).
- Sin base de datos ni datos personales reales: los ejemplos usan dominios `example.com`.
- Normalización: tipo de documento a `CC | CE | NIT | PA | TI`, teléfono a formato
  internacional `+57…`, fechas a ISO 8601 (`AAAA-MM-DD`), nombre en formato título.

## No objetivos

- No persiste los clientes ni los reenvía a otros sistemas.
- El lector de XML cubre documentos planos de un nivel (el formato del CRM de ejemplo); no es un
  analizador XML general.
- No implementa autenticación.

## Criterios de aceptación (Given-When-Then)

- **CA1** Dado un cliente de Ventas válido, cuando se transforma, entonces la respuesta es `200`,
  `sistemaOrigen = "ventas"` y la fecha `15/09/2026` queda como `2026-09-15`.
- **CA2** Dado un cliente del CRM en XML con `tipo="cedula"`, cuando se transforma, entonces
  `tipoDocumento = "CC"` y el nombre une nombres y apellidos.
- **CA3** Dado un cliente de Facturación con documento anidado, cuando se transforma, entonces
  `tipoDocumento = "NIT"` y el teléfono sale como `+576015550000`.
- **CA4** Dado un cliente con correo inválido y sin documento, cuando se transforma, entonces la
  respuesta es `422` y trae los dos errores.
- **CA5** Dado un origen desconocido, cuando se llama al servicio, entonces la respuesta es `400`.
- **CA6** Dado un XML mal formado para el CRM, cuando se transforma, entonces la respuesta es `400`.
- **CA7** El contrato publicado en `/api/contrato` es el mismo archivo que usa el validador.
- **CA8** El registro lista el servicio de transformación con su versión y sus operaciones.

Cada criterio tiene su prueba en `test/`.
