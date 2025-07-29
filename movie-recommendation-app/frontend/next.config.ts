import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
