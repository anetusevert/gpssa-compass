"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ResearchPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/admin/agents");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <LoadingSpinner />
      <p className="text-sm text-gray-muted">
        Redirecting to Agent Control Center...
      </p>
    </div>
  );
}
