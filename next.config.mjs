
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const nextConfig = {
    // async redirects() {
    //     return [
    //       {
    //         source: "/component/account_user/register",
    //         destination: "/register",
    //         permanent: true, 
    //       },
    //       {
    //         source: "/component/account_user/login",
    //         destination: "/login",
    //         permanent: true, 
    //       },
    //     ];
    //   },
};

export default withNextIntl(nextConfig);


