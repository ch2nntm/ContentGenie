export const metadata = {
    title: "Change Password",
    description: "Change Password Page",
  };
   
  export default async function ChangePasswordLayout({
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