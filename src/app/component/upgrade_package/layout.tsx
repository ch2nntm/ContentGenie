
export const metadata = {
    title: "Upgrade",
    description: "Upgrade Page",
  };
   
  export default async function UpgradeLayout({
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