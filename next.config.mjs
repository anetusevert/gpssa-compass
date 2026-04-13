/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gpssa.gov.ae" },
    ],
  },
  async redirects() {
    return [
      { source: "/dashboard/discover", destination: "/dashboard/atlas", permanent: true },
      { source: "/dashboard/discover/atlas", destination: "/dashboard/atlas", permanent: true },
      { source: "/dashboard/discover/benchmarking", destination: "/dashboard/atlas/benchmarking", permanent: true },
      { source: "/dashboard/discover/services", destination: "/dashboard/services/catalog", permanent: true },
      { source: "/dashboard/discover/systems", destination: "/dashboard/delivery/channels", permanent: true },
      { source: "/dashboard/discover/design", destination: "/dashboard/services/analysis", permanent: true },
      { source: "/dashboard/requirements", destination: "/dashboard", permanent: true },
      { source: "/dashboard/requirements/:path*", destination: "/dashboard", permanent: true },
      { source: "/dashboard/roadmap", destination: "/dashboard", permanent: true },
      { source: "/dashboard/roadmap/:path*", destination: "/dashboard", permanent: true },
    ];
  },
};

export default nextConfig;
