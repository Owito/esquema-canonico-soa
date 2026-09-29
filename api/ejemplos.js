import { ejemplos } from '../src/ejemplos.js';

export function GET() {
  return Response.json(ejemplos);
}
