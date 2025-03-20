export const metadata = {
    title: "Forgot Password",
    description: "Forgot Password Page",
  };
   
  export default async function ForgotPasswordLayout({
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