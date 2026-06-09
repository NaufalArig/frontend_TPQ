"use client";

import { useUser } from "@/context/UserContext";
import { UserRole } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  allow: UserRole[];
  children: React.ReactNode;
};

export default function RoleGuard({ allow, children }: Props) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!allow.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [user, loading, allow, router]);

  if (loading) return <p>Loading...</p>;

  if (!user) return null;

  if (!allow.includes(user.role)) return null;

  return <>{children}</>;
}