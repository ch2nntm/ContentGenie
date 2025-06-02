
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
const nextConfig = {
    images: {
      domains: ['i.scdn.co', 'res.cloudinary.com', 'lh3.googleusercontent.com'],
    },
    experimental: {
    turbopack: false,
  },
};

export default withNextIntl(nextConfig);
  