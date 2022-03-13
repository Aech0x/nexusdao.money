/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en"
  },
  env: {
    USE_LOCAL_TESTNET: false
  },
  eslint: {
    dirs: [
      "components",
      "constants",
      "helpers",
      "middlewares",
      "pages",
      "slices",
      "store"
    ]
  }
}

module.exports = nextConfig
