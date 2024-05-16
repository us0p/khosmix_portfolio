/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        return {
            ...config,
            externals: [...config.externals, "chrome-aws-lambda"]
        }
    }
};

export default nextConfig;
