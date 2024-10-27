import { CaretRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

const Header = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex gap-1 items-center text-2xl md:text-3xl">
      <Link href="/" className="text-foreground/60">
        Home
      </Link>
      <CaretRightIcon className="size-8" />
      <h1>{children}</h1>
    </div>
  );
};

export default Header;
