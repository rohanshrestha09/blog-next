/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ['placeimg.com', 'firebasestorage.googleapis.com'],
	},
};

module.exports = nextConfig;
