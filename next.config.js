/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.roomily.tech',
                port: '',
                pathname: '/api/v1/images/**',
            },
        ],
    },
}

module.exports = nextConfig
