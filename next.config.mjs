
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const nextConfig = {
    images: {
      domains: ['i.scdn.co', 'res.cloudinary.com'],
    },
};

export default withNextIntl(nextConfig);
  