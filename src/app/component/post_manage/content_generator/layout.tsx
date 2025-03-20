export const metadata = {
    title: "Content Generator",
    description: "Content Generator Page",
  };
   
  export default async function ContentGeneratorLayout({
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