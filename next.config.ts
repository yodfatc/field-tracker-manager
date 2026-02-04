import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
console.log(
  "ENV URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "YES" : "NO"
);
console.log(
  "ENV KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "YES" : "NO"
);
