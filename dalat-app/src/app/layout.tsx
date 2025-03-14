'use client';

import { ProfileProvider } from '@/contexts/ProfileContext';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Provider } from 'react-redux';
import { store } from '@/store';
// import { isAdmin } from '@/services/auth';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import { redirect } from "next/navigation";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Nếu bạn đang sử dụng font
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const showNavbar = !isAdminRoute;

  if (pathname === "/") {
    redirect("/home");
  }
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <ProfileProvider>
            {showNavbar && <Navbar />}
            {children}
            <ToastContainer />
            <Footer />
          </ProfileProvider>
        </Provider>
      </body>
    </html>
  );
}