import { contrato } from '../src/validador.js';

export function GET() {
  return new Response(JSON.stringify(contrato, null, 2), {
    headers: { 'content-type': 'application/schema+json; charset=utf-8' },
  });
}
