/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en", "vi"], // Các ngôn ngữ được hỗ trợ
    defaultLocale: "en", // Ngôn ngữ mặc định
    localeDetection: false, // Không tự động phát hiện locale
  },
};

module.exports = nextConfig;

