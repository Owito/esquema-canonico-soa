// Registro de servicios: qué servicios existen, quién los provee, en qué versión y cómo se usan.
import { adaptadores } from './adaptadores.js';
import { VERSION_CONTRATO } from './servicio.js';

export const registro = {
  actualizado: '2026-10-10',
  servicios: [
    {
      nombre: 'transformacion-cliente',
      proposito: 'Convertir datos de clientes de cada sistema al esquema canónico Cliente v1',
      proveedor: 'Equipo de integración',
      version: '1.0.0',
      contrato: { nombre: 'Cliente canónico v1', version: VERSION_CONTRATO, ubicacion: '/api/contrato' },
      interfaz: { formato: 'OpenAPI 3.1', ubicacion: '/api/openapi' },
      ubicacion: '/api/transformar',
      operaciones: [
        {
          metodo: 'POST',
          ruta: '/api/transformar?origen={origen}',
          entrada: Object.fromEntries(
            Object.entries(adaptadores).map(([k, a]) => [k, { formato: a.formato, descripcion: a.descripcion }]),
          ),
          salida: 'application/json (Cliente canónico v1)',
          respuestas: {
            200: 'cliente en el esquema canónico',
            400: 'origen desconocido o cuerpo ilegible',
            422: 'no cumple el contrato; trae la lista de errores',
          },
        },
      ],
    },
    {
      nombre: 'contrato-cliente',
      proposito: 'Publicar el contrato canónico, separado de la implementación',
      proveedor: 'Equipo de integración',
      version: VERSION_CONTRATO,
      ubicacion: '/api/contrato',
      operaciones: [{ metodo: 'GET', ruta: '/api/contrato', salida: 'application/schema+json' }],
    },
    {
      nombre: 'contrato-interfaz',
      proposito: 'Publicar el contrato de la interfaz REST (OpenAPI 3.1), separado de la implementación',
      proveedor: 'Equipo de integración',
      version: '1.0.0',
      ubicacion: '/api/openapi',
      operaciones: [{ metodo: 'GET', ruta: '/api/openapi', salida: 'application/yaml' }],
    },
    {
      nombre: 'salud',
      proposito: 'Verificar la disponibilidad del proveedor',
      proveedor: 'Equipo de integración',
      version: '1.0.0',
      ubicacion: '/api/salud',
      operaciones: [{ metodo: 'GET', ruta: '/api/salud', salida: 'application/json' }],
    },
  ],
};
