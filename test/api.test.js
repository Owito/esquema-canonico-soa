import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { POST as transformar } from '../api/transformar.js';
import { GET as contrato } from '../api/contrato.js';
import { GET as registro } from '../api/registro.js';
import { GET as salud } from '../api/salud.js';
import { GET as openapi } from '../api/openapi.js';
import { ejemplos } from '../src/ejemplos.js';

const BASE = 'https://ejemplo.local';

test('POST /api/transformar?origen=crm responde 200 con JSON canónico', async () => {
  const r = await transformar(new Request(`${BASE}/api/transformar?origen=crm`, { method: 'POST', body: ejemplos.crm }));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).sistemaOrigen, 'crm');
});

test('POST /api/transformar sin origen responde 400', async () => {
  const r = await transformar(new Request(`${BASE}/api/transformar`, { method: 'POST', body: '{}' }));
  assert.equal(r.status, 400);
});

test('CA7 /api/contrato publica exactamente el archivo que usa el validador', async () => {
  const r = contrato();
  assert.match(r.headers.get('content-type'), /application\/schema\+json/);
  const archivo = JSON.parse(readFileSync(new URL('../contrato/cliente-canonico.v1.schema.json', import.meta.url), 'utf8'));
  assert.deepEqual(await r.json(), archivo);
});

test('CA8 /api/registro lista el servicio de transformación con versión y operaciones', async () => {
  const cuerpo = await registro().json();
  const servicio = cuerpo.servicios.find((s) => s.nombre === 'transformacion-cliente');
  assert.equal(servicio.version, '1.0.0');
  assert.equal(servicio.operaciones[0].metodo, 'POST');
  assert.deepEqual(Object.keys(servicio.operaciones[0].entrada), ['ventas', 'crm', 'facturacion']);
});

test('/api/salud responde ok', async () => {
  assert.equal((await salud().json()).estado, 'ok');
});

test('CA9 /api/openapi publica el contrato de la interfaz y cubre exactamente las rutas de api/', async () => {
  const r = openapi();
  assert.match(r.headers.get('content-type'), /application\/yaml/);
  const texto = await r.text();
  assert.equal(texto, readFileSync(new URL('../contrato/openapi.v1.yaml', import.meta.url), 'utf8'));
  assert.match(texto, /^openapi: 3\.1\.\d+\n/);
  const rutasDeclaradas = [...texto.matchAll(/^  (\/api\/[a-z]+):$/gm)].map((m) => m[1]).sort();
  const rutasReales = readdirSync(new URL('../api/', import.meta.url))
    .filter((f) => f.endsWith('.js'))
    .map((f) => `/api/${f.slice(0, -3)}`)
    .sort();
  assert.deepEqual(rutasDeclaradas, rutasReales);
});
