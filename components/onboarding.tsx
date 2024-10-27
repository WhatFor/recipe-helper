"use client";

interface Props {
  recipeCount: number;
  blockCount: number;
}

const Step1 = ({ recipeCount }: { recipeCount: number }) => {
  const hasRecipes = recipeCount > 0;

  return hasRecipes ? (
    <p>You have recipes</p>
  ) : (
    <p>Step 1. Import all the recipes you like using AI</p>
  );
};

const Step2 = ({ blockCount }: { blockCount: number }) => {
  const hasBlocks = blockCount > 0;

  return hasBlocks ? (
    <>
      <p>You have blocks</p>
    </>
  ) : (
    <>
      <p>Step 2. Generate a plan.</p>
    </>
  );
};

const Step3 = () => {
  return <p>Step 3. Get your shopping lists.</p>;
};

const Onboarding = ({ recipeCount, blockCount }: Props) => {
  return (
    <>
      <Step1 recipeCount={recipeCount} />
      <Step2 blockCount={blockCount} />
      <Step3 />
    </>
  );
};

export default Onboarding;
