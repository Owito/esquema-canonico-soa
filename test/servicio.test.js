import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformar } from '../src/servicio.js';
import { ejemplos } from '../src/ejemplos.js';
import { validar } from '../src/validador.js';

test('CA1 Ventas: JSON snake_case al canónico, fecha DD/MM/AAAA a ISO', () => {
  const { estado, cuerpo } = transformar('ventas', ejemplos.ventas);
  assert.equal(estado, 200);
  assert.deepEqual(cuerpo, {
    version: '1.0',
    idCliente: 'VEN-7781',
    tipoDocumento: 'CC',
    numeroDocumento: '1020304050',
    nombreCompleto: 'Ana Maria Rojas Perez',
    correo: 'ana.rojas@example.com',
    telefono: '+573001234567',
    fechaRegistro: '2026-09-15',
    sistemaOrigen: 'ventas',
  });
});

test('CA2 CRM: XML con tipo="cedula" pasa a CC y une nombres y apellidos', () => {
  const { estado, cuerpo } = transformar('crm', ejemplos.crm);
  assert.equal(estado, 200);
  assert.equal(cuerpo.tipoDocumento, 'CC');
  assert.equal(cuerpo.nombreCompleto, 'Ana María Rojas Pérez');
  assert.equal(cuerpo.fechaRegistro, '2026-09-15');
  assert.equal(cuerpo.telefono, '+573001234567');
});

test('CA3 Facturación: documento anidado a NIT y teléfono fijo a +57', () => {
  const { estado, cuerpo } = transformar('facturacion', ejemplos.facturacion);
  assert.equal(estado, 200);
  assert.equal(cuerpo.tipoDocumento, 'NIT');
  assert.equal(cuerpo.numeroDocumento, '900123456-7');
  assert.equal(cuerpo.telefono, '+576015550000');
});

test('CA4 datos inválidos: 422 con todos los errores, no solo el primero', () => {
  const { estado, cuerpo } = transformar('ventas', ejemplos.conErrores);
  assert.equal(estado, 422);
  const campos = cuerpo.errores.map((e) => e.campo).sort();
  assert.deepEqual(campos, ['correo', 'fechaRegistro', 'numeroDocumento']);
});

test('CA5 origen desconocido: 400 con los orígenes válidos', () => {
  const { estado, cuerpo } = transformar('inventario', '{}');
  assert.equal(estado, 400);
  assert.deepEqual(cuerpo.origenesValidos, ['ventas', 'crm', 'facturacion']);
});

test('CA6 XML mal formado para el CRM: 400 con el formato esperado', () => {
  const { estado, cuerpo } = transformar('crm', '<cliente><id>1</id><email>x</cliente>');
  assert.equal(estado, 400);
  assert.equal(cuerpo.formatoEsperado, 'application/xml');
});

test('JSON mal formado para Ventas: 400', () => {
  const { estado } = transformar('ventas', '{"cliente_id": 1,');
  assert.equal(estado, 400);
});

test('los tres sistemas describen al mismo cliente y quedan iguales salvo id y origen', () => {
  const v = transformar('ventas', ejemplos.ventas).cuerpo;
  const c = transformar('crm', ejemplos.crm).cuerpo;
  for (const campo of ['tipoDocumento', 'numeroDocumento', 'correo', 'telefono', 'fechaRegistro']) {
    assert.equal(v[campo], c[campo], campo);
  }
});

test('el validador rechaza campos que no pertenecen al contrato', () => {
  const errores = validar({
    version: '1.0', idCliente: 'X-001', tipoDocumento: 'CC', numeroDocumento: '12345',
    nombreCompleto: 'Ana', correo: 'a@example.com', fechaRegistro: '2026-01-01',
    sistemaOrigen: 'ventas', edad: '30',
  });
  assert.deepEqual(errores, [{ campo: 'edad', motivo: 'no pertenece al contrato' }]);
});
