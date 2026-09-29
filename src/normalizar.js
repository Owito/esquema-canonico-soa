// Reglas de representación comunes: cada adaptador las usa para llegar al mismo formato.

const TIPOS_DOCUMENTO = {
  cc: 'CC', cedula: 'CC', 'cedula de ciudadania': 'CC',
  ce: 'CE', 'cedula de extranjeria': 'CE',
  nit: 'NIT',
  pa: 'PA', pasaporte: 'PA',
  ti: 'TI', 'tarjeta de identidad': 'TI',
};

function sinTildes(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function tipoDocumento(valor) {
  if (valor === undefined || valor === null) return undefined;
  const clave = sinTildes(String(valor)).trim().toLowerCase();
  return TIPOS_DOCUMENTO[clave] ?? String(valor).trim().toUpperCase();
}

export function numeroDocumento(valor) {
  if (valor === undefined || valor === null) return undefined;
  return String(valor).replace(/[\s.]/g, '').toUpperCase();
}

export function nombre(...partes) {
  const texto = partes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  if (!texto) return undefined;
  const menores = new Set(['de', 'del', 'la', 'las', 'los', 'y']);
  return texto
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && menores.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
}

export function correo(valor) {
  if (valor === undefined || valor === null) return undefined;
  return String(valor).trim().toLowerCase();
}

// Deja el teléfono colombiano en formato internacional +57 seguido de 10 dígitos.
export function telefono(valor) {
  if (valor === undefined || valor === null || valor === '') return undefined;
  let digitos = String(valor).replace(/\D/g, '');
  if (digitos.length === 12 && digitos.startsWith('57')) digitos = digitos.slice(2);
  return digitos.length === 10 ? `+57${digitos}` : String(valor).trim();
}

// Acepta DD/MM/AAAA, AAAA-MM-DD y fechas ISO con hora; conserva el día tal como se escribió.
export function fecha(valor) {
  if (valor === undefined || valor === null) return undefined;
  const texto = String(valor).trim();
  const dma = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dma) return `${dma[3]}-${dma[2].padStart(2, '0')}-${dma[1].padStart(2, '0')}`;
  const iso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
  return iso ? iso[1] : texto;
}
