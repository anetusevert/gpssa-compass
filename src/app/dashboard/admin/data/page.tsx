"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDataRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/data");
  }, [router]);
  return null;
}
