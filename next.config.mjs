/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so it can be hosted on GitHub Pages (neosmedia.github.io).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
