import { AuthProvider } from "../authProvider"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
