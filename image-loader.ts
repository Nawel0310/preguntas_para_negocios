export default function imageLoader({ src }: { src: string }) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const basePath = "/preguntas_para_negocios"; //Nombre del repo
  return `${basePath}${src}`;
}