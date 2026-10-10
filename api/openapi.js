import { readFileSync } from 'node:fs';

// Contrato de la interfaz (OpenAPI 3.1). Igual que el contrato de datos, se publica tal cual
// está en el archivo: una sola fuente de verdad, sin copias en el código.
export const openapi = readFileSync(new URL('../contrato/openapi.v1.yaml', import.meta.url), 'utf8');

export function GET() {
  return new Response(openapi, {
    headers: { 'content-type': 'application/yaml; charset=utf-8' },
  });
}
