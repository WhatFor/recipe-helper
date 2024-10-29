"use client";

import { deleteRecipe } from "./actions";
import { useState } from "react";
import { ActionResult } from "@/types/action-result";
import DeleteButton from "@/components/ui/delete-button";
import useFormToast from "@/hooks/use-form-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EditRecipeModal from "./edit-recipe-modal";
import EditRecipeIngredientsModal from "./edit-ingredients-modal";
import { RecipeWithIngredients } from "./page";

import {
  CheckCircledIcon,
  CrossCircledIcon,
  LightningBoltIcon,
  Link2Icon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const RecipeCard = ({ recipe }: { recipe: RecipeWithIngredients }) => {
  const [deleting, setDeleting] = useState(false);

  const [result, setResult] = useState<ActionResult>({
    state: "init",
  } as ActionResult);

  const onDelete = async () => {
    setDeleting(true);
    const result = await deleteRecipe(recipe.id);
    setResult(result);
    setDeleting(false);
  };

  useFormToast(result);

  return (
    <Card key={recipe.id} className="relative">
      <DeleteButton deleting={deleting} onDelete={onDelete} />
      <CardHeader className="pb-5 h-full">
        <CardTitle className="capitalize truncate flex gap-x-3 items-center mb-1">
          <span>{recipe.name}</span>
        </CardTitle>
        <div className="flex flex-col justify-between h-full gap-y-3">
          <div className="flex flex-col gap-y-2">
            <div className="flex gap-x-2 pb-1">
              <Badge variant="outline" className="flex items-center gap-x-1.5">
                {recipe.is_fast ? (
                  <LightningBoltIcon className="size-3" />
                ) : (
                  <StopwatchIcon className="size-3" />
                )}
                {recipe.is_fast ? "Fast" : "Slow"}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-x-1.5">
                {recipe.is_suitable_for_fridge ? (
                  <CheckCircledIcon className="size-3.5 text-teal-400" />
                ) : (
                  <CrossCircledIcon className="size-3.5 text-orange-400" />
                )}
                {recipe.is_suitable_for_fridge
                  ? "Fridge suitable"
                  : "Not fridge suitable"}
              </Badge>
              <a
                href={recipe.link}
                className="flex items-center"
                target="_blank"
              >
                <Link2Icon className="size-6 hover:bg-foreground/10 hover:text-teal-400 transition-colors p-1 rounded-lg" />
              </a>
            </div>
            <Separator />
            <CardDescription
              className="text-foreground/70 text-ellipsis text-pretty"
              title={recipe.description}
            >
              {recipe.description}
            </CardDescription>
          </div>
          <div className="flex gap-x-3">
            <EditRecipeModal recipe={recipe} />
            <EditRecipeIngredientsModal recipe={recipe} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default RecipeCard;
