"use client";

import Onboarding from "./onboarding";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

interface Props {
  recipeCount: number;
  blockCount: number;
}

const Landing = ({ recipeCount, blockCount }: Props) => {
  return (
    <div className="max-w-3xl h-full w-full">
      <div className="flex flex-col gap-y-12">
        <div className="">
          <h3
            className={cn(
              "text-center text-xl lg:text-2xl text-foreground font-extralight",
              outfit.className
            )}
          >
            Welcome to
          </h3>
          <h1
            className={cn(
              "text-[80pt] lg:text-[100pt] text-center text-foreground header-gradient font-semibold leading-[100px] lg:leading-[120px]",
              outfit.className
            )}
          >
            Cuisino
          </h1>
        </div>
        <div>
          <Onboarding recipeCount={recipeCount} blockCount={blockCount} />
        </div>
      </div>
    </div>
  );
};

export default Landing;
