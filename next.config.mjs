/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gpssa.gov.ae" },
    ],
  },
};

export default nextConfig;
