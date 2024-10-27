"use client";

import Header from "@/components/ui/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import NewRecipeModal from "./new-recipe-modal";
import RecipeCard from "./recipe-card";
import NewRecipeWithAiModal from "./new-recipe-with-ai-modal";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon } from "@radix-ui/react-icons";
import { RecipeWithIngredients } from "./page";
import { useState } from "react";

interface Props {
  recipes: RecipeWithIngredients[];
}

const RecipesPage = ({ recipes }: Props) => {
  const [newRecipeWithAiModalOpen, setNewRecipeWithAiModalOpen] =
    useState(false);

  return (
    <div className="flex flex-col gap-y-8">
      <Header>Recipes</Header>
      <NewRecipeModal />
      <NewRecipeWithAiModal
        open={newRecipeWithAiModalOpen}
        setOpen={setNewRecipeWithAiModalOpen}
      />
      <ScrollArea className="h-[600px] w-full rounded-xl border p-5">
        <div className=" grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
          <Card
            onClick={() => setNewRecipeWithAiModalOpen(true)}
            className="group hover:bg-foreground/10 transition-colors cursor-pointer min-h-48"
          >
            <CardContent className="flex items-center justify-center h-full p-0">
              <PlusIcon className="size-12 text-foreground/30 group-hover:text-foreground/40 transition-colors" />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecipesPage;
