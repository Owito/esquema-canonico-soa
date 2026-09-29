// Un adaptador por sistema de origen. Cada uno sabe leer SU formato y entregarlo en el modelo
// canónico; ningún sistema necesita conocer el formato interno de los demás.
import * as n from './normalizar.js';

export class ErrorDeFormato extends Error {}

function leerJson(texto) {
  try {
    const valor = JSON.parse(texto);
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
      throw new ErrorDeFormato('se esperaba un objeto JSON');
    }
    return valor;
  } catch (e) {
    if (e instanceof ErrorDeFormato) throw e;
    throw new ErrorDeFormato('el cuerpo no es JSON válido');
  }
}

const ENTIDADES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };

function textoXml(valor) {
  return valor.replace(/&(amp|lt|gt|quot|apos);/g, (e) => ENTIDADES[e]).trim();
}

// Lector mínimo para un documento XML plano de un nivel: <raiz><campo attr="x">valor</campo>...</raiz>
function leerXmlPlano(texto, raiz) {
  const cuerpo = String(texto).trim().replace(/^<\?xml[^>]*\?>\s*/, '');
  const envoltura = cuerpo.match(new RegExp(`^<${raiz}>([\\s\\S]*)</${raiz}>$`));
  if (!envoltura) throw new ErrorDeFormato(`se esperaba un documento XML <${raiz}>…</${raiz}>`);
  const campos = {};
  const etiqueta = /<([a-zA-Z][\w-]*)((?:\s+[\w-]+="[^"]*")*)\s*>([^<]*)<\/\1>/g;
  let resto = envoltura[1];
  for (const m of envoltura[1].matchAll(etiqueta)) {
    const atributos = Object.fromEntries(
      [...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((a) => [a[1], textoXml(a[2])]),
    );
    campos[m[1]] = { valor: textoXml(m[3]), atributos };
    resto = resto.replace(m[0], '');
  }
  if (resto.trim() !== '') throw new ErrorDeFormato('el XML está mal formado');
  return campos;
}

export const adaptadores = {
  ventas: {
    descripcion: 'Sistema de Ventas: JSON con nombres en snake_case y fecha DD/MM/AAAA',
    formato: 'application/json',
    aCanonico(texto) {
      const v = leerJson(texto);
      return {
        idCliente: v.cliente_id !== undefined ? `VEN-${v.cliente_id}` : undefined,
        tipoDocumento: n.tipoDocumento(v.tipo_doc),
        numeroDocumento: n.numeroDocumento(v.num_doc),
        nombreCompleto: n.nombre(v.nombre),
        correo: n.correo(v.email),
        telefono: n.telefono(v.tel),
        fechaRegistro: n.fecha(v.fecha_alta),
      };
    },
  },
  crm: {
    descripcion: 'CRM: documento XML <cliente> con nombres y apellidos separados',
    formato: 'application/xml',
    aCanonico(texto) {
      const c = leerXmlPlano(texto, 'cliente');
      const val = (k) => c[k]?.valor;
      return {
        idCliente: val('id'),
        tipoDocumento: n.tipoDocumento(c.documento?.atributos.tipo),
        numeroDocumento: n.numeroDocumento(val('documento')),
        nombreCompleto: n.nombre(val('nombres'), val('apellidos')),
        correo: n.correo(val('email')),
        telefono: n.telefono(val('celular')),
        fechaRegistro: n.fecha(val('creado')),
      };
    },
  },
  facturacion: {
    descripcion: 'Facturación: JSON en inglés con el documento anidado',
    formato: 'application/json',
    aCanonico(texto) {
      const f = leerJson(texto);
      return {
        idCliente: f.customerId,
        tipoDocumento: n.tipoDocumento(f.document?.type),
        numeroDocumento: n.numeroDocumento(f.document?.number),
        nombreCompleto: n.nombre(f.legalName),
        correo: n.correo(f.contactEmail),
        telefono: n.telefono(f.phone),
        fechaRegistro: n.fecha(f.registeredAt),
      };
    },
  },
};
