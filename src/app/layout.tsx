import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IronSuhba — Augusta 70.3",
  description: "AI-adaptive triathlon training for Augusta 70.3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
