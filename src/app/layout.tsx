import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitaz Gym | Complimentary PT Session",
  description: "Book your complimentary PT consultation and starter session at Fitaz Gym.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
