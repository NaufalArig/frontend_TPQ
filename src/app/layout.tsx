import "./globals.css";

import { UserProvider } from "@/context/UserContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sistem TPQ",
    template: "%s | Sistem TPQ",
  },
  description: "Sistem manajemen TPQ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
