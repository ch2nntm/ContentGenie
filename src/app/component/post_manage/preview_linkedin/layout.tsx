import { AuthProvider } from "../../authProvider";


export const metadata = {
    title: "Preview LinkedIn",
    description: "Preview LinkedIn Page",
  };
   
  export default async function PreviewLayout({
    children
  }: {
    children: React.ReactNode;
  }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
  }