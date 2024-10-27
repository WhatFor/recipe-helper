"use client";

import Onboarding from "./onboarding";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <motion.div
      className="max-w-3xl h-full w-full"
      initial={{ opacity: 0, scale: 0.2, translateY: -100 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ duration: 0.6, delay: 0, ease: "easeInOut" }}
    >
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
    </motion.div>
  );
};

export default Landing;
