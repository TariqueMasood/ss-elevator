/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Required to activate the instrumentation.ts startup hook.
  experimental: { instrumentationHook: true },
};
