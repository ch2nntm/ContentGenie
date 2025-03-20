export const metadata = {
    title: "Dashboard",
    description: "Dashboard Page",
  };
   
  export default async function DashboardLayout({
    children
  }: {
    children: React.ReactNode;
  }) {
    return (
        <div>
            {children}
        </div>
    );
  }