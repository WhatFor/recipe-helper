import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import RequireAuth from "@/components/require-auth";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: "Recipes",
  description: "Track recipes",
};

const NavItem = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      className="px-3 py-1 w-1/3 border rounded-md bg-foreground/20 hover:bg-foreground/30 transition-all"
      href={href}
    >
      {children}
    </a>
  );
};

const NavBar = () => {
  return (
    <menu className="flex p-2 gap-x-3 w-full justify-stretch">
      <NavItem href="/ingredients">Ingredients</NavItem>
      <NavItem href="/recipes">Recipes</NavItem>
      <NavItem href="/blocks">Blocks</NavItem>
    </menu>
  );
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html className="dark bg-background" lang="en">
        <body>
          <RequireAuth>
            <div className="flex flex-col justify-center items-center">
              <NavBar />
              <div className="w-full max-w-2xl flex flex-col gap-y-12 pb-8 pt-4">
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
