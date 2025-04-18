import { AuthProvider } from "../../authProvider";


export const metadata = {
    title: "Preview",
    description: "Preview Page",
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