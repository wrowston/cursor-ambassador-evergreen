/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: ['firebase-admin'],
	turbopack: {
		root: __dirname,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'g3ik3pexma.ufs.sh',
			},
		],
	},
};

module.exports = nextConfig;
