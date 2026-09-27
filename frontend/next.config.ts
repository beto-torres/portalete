import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que `next build` sobrescreva os módulos usados por `next dev`.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
