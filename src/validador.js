// Valida un objeto contra el contrato canónico. El contrato (JSON Schema) es la única fuente de
// las reglas: aquí solo se interpreta el subconjunto de palabras clave que ese contrato usa.
import { readFileSync } from 'node:fs';

export const contrato = JSON.parse(
  readFileSync(new URL('../contrato/cliente-canonico.v1.schema.json', import.meta.url), 'utf8'),
);

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function esFechaReal(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [a, m, d] = texto.split('-').map(Number);
  const f = new Date(Date.UTC(a, m - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
}

function validarCampo(nombre, valor, regla) {
  const errores = [];
  if (regla.type === 'string' && typeof valor !== 'string') {
    return [{ campo: nombre, motivo: 'debe ser texto' }];
  }
  if (regla.enum && !regla.enum.includes(valor)) {
    errores.push({ campo: nombre, motivo: `debe ser uno de: ${regla.enum.join(', ')}` });
  }
  if (regla.minLength !== undefined && valor.length < regla.minLength) {
    errores.push({ campo: nombre, motivo: `mínimo ${regla.minLength} caracteres` });
  }
  if (regla.maxLength !== undefined && valor.length > regla.maxLength) {
    errores.push({ campo: nombre, motivo: `máximo ${regla.maxLength} caracteres` });
  }
  if (regla.pattern && !new RegExp(regla.pattern).test(valor)) {
    errores.push({ campo: nombre, motivo: `no cumple el formato ${regla.pattern}` });
  }
  if (regla.format === 'email' && !CORREO.test(valor)) {
    errores.push({ campo: nombre, motivo: 'no es un correo válido' });
  }
  if (regla.format === 'date' && !esFechaReal(valor)) {
    errores.push({ campo: nombre, motivo: 'no es una fecha válida AAAA-MM-DD' });
  }
  return errores;
}

export function validar(objeto, esquema = contrato) {
  const errores = [];
  for (const campo of esquema.required) {
    if (objeto[campo] === undefined || objeto[campo] === null || objeto[campo] === '') {
      errores.push({ campo, motivo: 'es obligatorio' });
    }
  }
  for (const [campo, valor] of Object.entries(objeto)) {
    const regla = esquema.properties[campo];
    if (!regla) {
      if (esquema.additionalProperties === false) {
        errores.push({ campo, motivo: 'no pertenece al contrato' });
      }
      continue;
    }
    if (valor === undefined || valor === null || valor === '') continue;
    errores.push(...validarCampo(campo, valor, regla));
  }
  return errores;
}
