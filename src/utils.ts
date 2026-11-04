const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
/** Ruta interna respetando el base de GitHub Pages. */
export const url = (p = '') => base + p.replace(/^\//, '');
