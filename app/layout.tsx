import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import RequireAuth from "@/components/require-auth";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Track recipes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html className="dark bg-background h-full" lang="en">
        <body className="h-full">
          <NextTopLoader color="#fff" />
          <RequireAuth>
            <div className="flex flex-col justify-center items-center h-full">
              <div className="w-full h-full max-w-7xl flex flex-col gap-y-12 pb-8 pt-4 px-4">
                {children}
              </div>
            </div>
            <Toaster />
          </RequireAuth>
        </body>
      </html>
    </ClerkProvider>
  );
}
