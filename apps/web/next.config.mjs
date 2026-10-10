import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@syncsketch/db"],
  experimental: {
    // Trace server files from the monorepo root so the Prisma engine, which
    // pnpm keeps outside apps/web, is bundled into the Vercel functions.
    outputFileTracingRoot: path.join(here, "../../"),
    serverComponentsExternalPackages: ["@prisma/client"],
    // Force the generated client and its query engines into every function.
    outputFileTracingIncludes: {
      "/**": [
        "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**",
        "../../packages/db/node_modules/.prisma/client/**",
      ],
    },
  },
};

export default nextConfig;
