/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three/drei são publicados como ESM; transpilar evita problemas no build.
  transpilePackages: ["three"],
  async headers() {
    return [
      {
        // Modelos anatômicos: imutáveis por versão de arquivo (hash no nome
        // é gerado pelo pipeline), podem ficar em cache longo.
        source: "/anatomy/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/estudio/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
          // Câmera e microfone só são permitidos no estúdio, por esta origem.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self)" },
        ],
      },
      {
        source: "/((?!estudio).*)",
        headers: [{ key: "Permissions-Policy", value: "camera=(), microphone=()" }],
      },
    ];
  },
};

module.exports = nextConfig;
