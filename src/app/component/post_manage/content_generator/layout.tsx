import { AuthProvider } from "../../authProvider";


export const metadata = {
    title: "Content Genie",
    description: "Content Genie Page",
  };
   
  export default async function ContentGenieLayout({
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