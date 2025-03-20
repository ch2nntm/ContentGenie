export const metadata = {
    title: "Register",
    description: "Register Page",
  };
   
  export default async function RegisterLayout({
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