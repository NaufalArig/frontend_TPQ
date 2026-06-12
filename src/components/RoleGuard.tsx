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

  const isAllowed = user ? allow.includes(user.role) : false;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAllowed) {
      router.replace("/unauthorized");
    }
  }, [user, loading, isAllowed, router]);

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}