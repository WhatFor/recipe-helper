"use client";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
//import { useRouter } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

import {
  CheckCircledIcon,
  HeartIcon,
  Pencil2Icon,
  RocketIcon,
} from "@radix-ui/react-icons";

interface Props {
  recipeCount: number;
  blockCount: number;
}

const StepNumber = ({ number }: { number: number }) => {
  return (
    <div className="absolute -right-20 md:right-0 top-0 flex items-center h-full font-extrabold size-10 text-[190pt] w-[200px] overflow-hidden text-foreground/5">
      {number}
    </div>
  );
};

const StepSection = ({
  children,
  completed,
}: {
  children: React.ReactNode;
  completed: boolean;
}) => {
  return (
    <div
      className={cn(
        completed
          ? "bg-foreground/5 text-foreground/40 hover:bg-foreground/10 "
          : "bg-foreground/10 text-foreground hover:bg-foreground/15",
        "flex flex-col gap-y-2 rounded-2xl border transition-colors relative overflow-clip"
      )}
    >
      {children}
    </div>
  );
};

const Step1 = ({ recipeCount }: { recipeCount: number }) => {
  const router = useRouter();

  const hasRecipes = recipeCount > 0;

  const onClickAiImport = () => {
    router.push("/recipes?ai_import=1");
  };

  const onClickView = () => {
    router.push("/recipes");
  };

  return (
    <StepSection completed={hasRecipes}>
      <StepNumber number={1} />
      <div className="px-8 py-5 h-full">
        {hasRecipes ? (
          <div className="flex flex-col justify-between gap-y-5 h-full">
            <div className="flex flex-col gap-y-2">
              <h3 className="font-semibold text-xl flex gap-x-3 items-center">
                <CheckCircledIcon className="size-6 text-green-600 hidden md:block" />
                You&apos;ve got recipes
              </h3>
              <p className="mr-24 lg:mr-52 text-sm text-foreground/70">
                You have {recipeCount} recipe{recipeCount > 1 && "s"} in your
                collection. Nice!
              </p>
            </div>
            <div>
              <Button variant="default" onClick={onClickAiImport}>
                Import more
              </Button>
              <Button variant="link" onClick={onClickView}>
                View recipes
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <h3 className="font-semibold text-xl flex gap-x-3 items-center">
                <RocketIcon className="size-6 hidden md:block" />
                Import your recipes using AI
              </h3>
              <p className="mr-24 lg:mr-52 text-sm text-foreground/70">
                Use artificial intelligence to import your recipes from any site
                on the web.
              </p>
            </div>
            <div>
              <Button onClick={onClickAiImport}>Get started</Button>
            </div>
          </div>
        )}
      </div>
    </StepSection>
  );
};

const Step2 = ({ blockCount }: { blockCount: number }) => {
  const router = useRouter();

  const hasBlocks = blockCount > 0;

  const onClickAiImport = () => {
    router.push("/blocks?ai_import=1");
  };

  const onClickView = () => {
    router.push("/blocks");
  };

  return (
    <StepSection completed={hasBlocks}>
      <StepNumber number={2} />
      <div className="px-8 py-5 h-full">
        {hasBlocks ? (
          <div className="flex flex-col justify-between gap-y-5 h-full">
            <div className="flex flex-col gap-y-2">
              <h3 className="font-semibold text-xl flex gap-x-3 items-center">
                <CheckCircledIcon className="size-6 text-green-600 hidden md:block" />
                You&apos;ve got meal plans
              </h3>
              <p className="mr-24 lg:mr-52 text-sm text-foreground/70">
                You have {blockCount} meal plan{blockCount > 1 && "s"}.
              </p>
            </div>
            <div>
              <Button variant="default" onClick={onClickView}>
                View
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-y-2">
              <h3 className="font-semibold text-xl flex gap-x-3 items-center">
                <Pencil2Icon className="size-6 hidden md:block" />
                Create your personal meal plans
              </h3>
              <p className="mr-24 lg:mr-52 text-sm text-foreground/70">
                Intelligently analyse your recipes and create meal plans that
                minimize waste and maximize variety.
              </p>
            </div>
            <div>
              <Button onClick={onClickAiImport}>Analyse</Button>
            </div>
          </div>
        )}
      </div>
    </StepSection>
  );
};

const Step3 = () => {
  const router = useRouter();

  const onClick = () => {
    // todo
    router.push("/blocks");
  };

  return (
    <StepSection completed={false}>
      <StepNumber number={3} />
      <div className="px-8 py-5 h-full">
        <div className="flex flex-col justify-between gap-y-5 h-full">
          <div className="flex flex-col gap-y-2">
            <h3 className="font-semibold text-xl flex gap-x-3 items-center">
              <HeartIcon className="size-6 hidden md:block" />
              Get cooking
            </h3>
            <p className="mr-24 lg:mr-52 text-sm text-foreground/70">
              Use your personal meal plans to get your weekly shopping list and
              start cooking. Enjoy!
            </p>
          </div>
          <div>
            <Button onClick={onClick}>View</Button>
          </div>
        </div>
      </div>
    </StepSection>
  );
};

const Onboarding = ({ recipeCount, blockCount }: Props) => {
  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 pb-24">
      <Step1 recipeCount={recipeCount} />
      <Step2 blockCount={blockCount} />
      <Step3 />
    </div>
  );
};

export default Onboarding;
