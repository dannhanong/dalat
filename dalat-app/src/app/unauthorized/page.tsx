"use client";

import { Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        py: 8,
      }}
    >
      <Typography variant="h3" gutterBottom color="error">
        Truy cập bị từ chối
      </Typography>
      <Typography variant="h6" paragraph>
        Bạn không có quyền truy cập vào trang này
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là sự nhầm lẫn.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push("/home")}
        sx={{ mt: 2 }}
      >
        Trở về trang chủ
      </Button>
    </Container>
  );
}