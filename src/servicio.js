// Servicio de transformación: recibe el formato propio de un sistema y devuelve el Cliente
// canónico v1, o todos los errores frente al contrato.
import { adaptadores, ErrorDeFormato } from './adaptadores.js';
import { validar } from './validador.js';

export const VERSION_CONTRATO = '1.0';

function sinVacios(objeto) {
  return Object.fromEntries(Object.entries(objeto).filter(([, v]) => v !== undefined));
}

export function transformar(origen, cuerpo) {
  const adaptador = adaptadores[origen];
  if (!adaptador) {
    return {
      estado: 400,
      cuerpo: { error: 'origen desconocido', origenesValidos: Object.keys(adaptadores) },
    };
  }

  let parcial;
  try {
    parcial = adaptador.aCanonico(cuerpo);
  } catch (e) {
    if (!(e instanceof ErrorDeFormato)) throw e;
    return {
      estado: 400,
      cuerpo: { error: `formato inválido para ${origen}: ${e.message}`, formatoEsperado: adaptador.formato },
    };
  }

  const canonico = sinVacios({ version: VERSION_CONTRATO, ...parcial, sistemaOrigen: origen });
  const errores = validar(canonico);
  if (errores.length > 0) {
    return { estado: 422, cuerpo: { error: 'no cumple el contrato Cliente canónico v1', errores } };
  }
  return { estado: 200, cuerpo: canonico };
}
