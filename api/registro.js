import { registro } from '../src/registro.js';

export function GET() {
  return Response.json(registro);
}
