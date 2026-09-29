// Datos de ejemplo ficticios (dominios example.com) en el formato propio de cada sistema.
export const ejemplos = {
  ventas: JSON.stringify(
    {
      cliente_id: 7781,
      tipo_doc: 'CC',
      num_doc: '1.020.304.050',
      nombre: 'ANA MARIA ROJAS PEREZ',
      email: 'Ana.Rojas@example.com',
      tel: '300 123 4567',
      fecha_alta: '15/09/2026',
    },
    null,
    2,
  ),
  crm: [
    '<cliente>',
    '  <id>CRM-0042</id>',
    '  <documento tipo="cedula">1020304050</documento>',
    '  <nombres>Ana María</nombres>',
    '  <apellidos>Rojas Pérez</apellidos>',
    '  <email>ana.rojas@example.com</email>',
    '  <celular>+57 300 123 4567</celular>',
    '  <creado>2026-09-15T10:20:00-05:00</creado>',
    '</cliente>',
  ].join('\n'),
  facturacion: JSON.stringify(
    {
      customerId: 'FAC-9001',
      document: { type: 'NIT', number: '900123456-7' },
      legalName: 'Comercial Andina S.A.S.',
      contactEmail: 'facturacion@example.com',
      phone: '601 555 0000',
      registeredAt: '2026-09-01',
    },
    null,
    2,
  ),
  conErrores: JSON.stringify(
    {
      cliente_id: 7782,
      tipo_doc: 'CC',
      nombre: 'Luis Gómez',
      email: 'luis.gomez-sin-arroba.example.com',
      fecha_alta: '31/02/2026',
    },
    null,
    2,
  ),
};
