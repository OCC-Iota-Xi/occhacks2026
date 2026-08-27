import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  // Privacy and terms live together on /legal, anchored. These keep the
  // separate URLs working for anything already pointing at them.
  async redirects() {
    return [
      { source: "/privacy", destination: "/legal#privacy", permanent: true },
      { source: "/terms", destination: "/legal#terms", permanent: true },
    ];
  },
};

export default nextConfig;
