import { VERSION_CONTRATO } from '../src/servicio.js';

export function GET() {
  return Response.json({ estado: 'ok', contrato: `Cliente canónico v${VERSION_CONTRATO}` });
}
