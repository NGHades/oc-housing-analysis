import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/", destination: "/overview", permanent: false },
  ],
}

export default nextConfig
