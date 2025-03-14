"use client";

import { useEffect, useState } from "react";
import { isAdmin, isAuthenticated } from "@/services/auth";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { CircularProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Kiểm tra user đã đăng nhập chưa
        if (!isAuthenticated()) {
          console.log("User not authenticated, redirecting to login");
          router.push("/login?redirect=/admin");
          return;
        }

        // Kiểm tra user có quyền admin không (async)
        const adminStatus = await isAdmin();
        console.log("Admin status:", adminStatus);

        if (!adminStatus) {
          console.log("User is not admin, redirecting to unauthorized");
          router.push("/unauthorized");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/login?redirect=/admin");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  // Hiển thị loading spinner trong khi kiểm tra
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <CircularProgress size={40} />
          <p className="mt-4 text-gray-600">Đang xác thực quyền quản trị...</p>
        </div>
      </div>
    );
  }

  // Không hiển thị gì nếu không được phép
  if (!authorized) {
    return null;
  }

  // Hiển thị layout admin nếu đã xác thực quyền
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar onToggle={setIsSidebarOpen} />
        <main
          className={`flex-1 ml-64 bg-gray-100 transition-all duration-300 `}
        >
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </main>
      </div>
    </div>
  );
}