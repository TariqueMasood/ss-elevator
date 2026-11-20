/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/catalog/download": ["./private/ss-elevator-components.pdf"],
  },
};
