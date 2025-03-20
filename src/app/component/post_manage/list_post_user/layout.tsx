import { AuthProvider } from "../../authProvider";


export const metadata = {
    title: "List Post Of User",
    description: "List Post Of User Page",
  };
   
  export default async function ListPostUserLayout({
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