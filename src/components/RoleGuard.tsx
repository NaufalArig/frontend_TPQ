"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  allow: string[];
  children: React.ReactNode;
};

export default function RoleGuard({ allow, children }: Props) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      if (!allow.includes(user.role || "")) {
        router.replace("/unauthorized");
      }
    }
  }, [user, loading, allow, router]);

  if (loading) return <p>Loading...</p>;

  if (!user) return null;

  if (!allow.includes(user.role || "")) return null;

  return <>{children}</>;
}