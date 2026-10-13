import type { NextConfig } from "next";

const basePath = "/preguntas_para_negocios";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath,
  assetPrefix: basePath,
  // Genera carpeta/index.html por ruta: GitHub Pages resuelve /ruta/ sin redirecciones raras
  trailingSlash: true,
  // Para fetch() en el cliente (next/link agrega el basePath solo, fetch no)
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
  // cacheComponents / partialPrefetching habilitan PPR, que no es compatible con `output: "export"`
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
