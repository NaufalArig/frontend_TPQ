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
  const { user, loading, authUnavailable } = useUser();
  const router = useRouter();

  const isAllowed = user ? allow.includes(user.role) : false;

  useEffect(() => {
    if (loading) return;
    if (authUnavailable) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAllowed) {
      router.replace("/unauthorized");
    }
  }, [user, loading, authUnavailable, isAllowed, router]);

  if (loading || authUnavailable) {
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
