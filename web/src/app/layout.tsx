import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daabi - Student Platform",
  description: "Student platform for raising demands, discussions, and sharing campus moments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
