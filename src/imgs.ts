const imgs = import.meta.glob<{ default: ImageMetadata }>('./assets/img/*.webp', { eager: true });
/** Devuelve undefined si la imagen no existe: los componentes muestran un fondo de marca en vez de romper. */
export const getImg = (name: string): ImageMetadata | undefined => imgs[`./assets/img/${name}.webp`]?.default;
