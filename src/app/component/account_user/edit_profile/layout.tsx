export const metadata = {
    title: "Edit Profile",
    description: "Edit Profile Page",
  };
   
  // export default async function EditProfileLayout({
  //   children
  // }: {
  //   children: React.ReactNode;
  // }) {
  //   return (
  //       <div>
  //           {children}
  //       </div>
  //   );
  // }

  import { AuthProvider } from "../../authProvider"; 
  
  export default function EditProfileLayout({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }