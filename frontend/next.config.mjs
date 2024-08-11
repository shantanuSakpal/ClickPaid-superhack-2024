/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push('pino-pretty', /* add any other modules that might be causing the error */);
        return config;
    },
    images: {
        domains: ['firebasestorage.googleapis.com'],
    },
};

export default nextConfig;