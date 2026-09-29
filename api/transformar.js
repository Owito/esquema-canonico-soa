import { transformar } from '../src/servicio.js';

export async function POST(request) {
  const origen = new URL(request.url).searchParams.get('origen') ?? '';
  const { estado, cuerpo } = transformar(origen, await request.text());
  return Response.json(cuerpo, { status: estado });
}
