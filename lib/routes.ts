// Rutas con query param: los ids viven en el navegador, así que no se pueden
// pre-generar páginas por negocio (requisito de `output: "export"`).
export const businessHref = (id: string) => `/negocios/ver?id=${encodeURIComponent(id)}`;
export const businessEditHref = (id: string) => `/negocios/editar?id=${encodeURIComponent(id)}`;
