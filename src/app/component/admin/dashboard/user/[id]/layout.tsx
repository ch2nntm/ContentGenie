export const metadata = {
    title: "View Detail User",
    description: "View Detail User Page",
  };
   
  export default async function ViewDetailLayout({
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