"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, isAuthenticated } from "@/services/auth";
import { CircularProgress } from "@mui/material";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!isAuthenticated()) {
          router.replace("/login?redirect=/admin");
          return;
        }

        // Kiểm tra xem người dùng có quyền admin không
        const adminStatus = await isAdmin();
        if (!adminStatus) {
          router.replace("/unauthorized");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.replace("/login?redirect=/admin");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}