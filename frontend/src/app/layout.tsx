import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AI Deal Brief Machine",
  description: "Enterprise-grade AI workflow for generating investment deal briefs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="flex min-h-screen bg-[#0f172a]">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
