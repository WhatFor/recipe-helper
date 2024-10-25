"use client";

import { TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import { deleteBlock } from "./actions";
import { useState } from "react";
import { ActionResult } from "@/types/action-result";
import useFormToast from "@/hooks/use-form-toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import EditBlockModal from "./edit-block-modal";
import { BlockWithRecipes } from "./page";
import { Badge } from "@/components/ui/badge";
import EditBlockRecipesModal from "./edit-block-recipes-modal";

const RecipeCard = ({ block }: { block: BlockWithRecipes }) => {
  const [deleting, setDeleting] = useState(false);

  const [result, setResult] = useState<ActionResult>({
    state: "init",
  } as ActionResult);

  const onDelete = async () => {
    setDeleting(true);
    const result = await deleteBlock(block.id);
    setResult(result);
    setDeleting(false);
  };

  useFormToast(result);

  return (
    <Card key={block.id} className="mb-5 relative">
      <button
        onClick={onDelete}
        disabled={deleting}
        className="border-b border-l absolute top-0 right-0 bottom-0 flex items-center rounded-r-xl p-3 cursor-pointer hover:bg-foreground/10"
      >
        {deleting ? (
          <UpdateIcon className="text-foreground/40 animate-spin size-5" />
        ) : (
          <TrashIcon className="text-destructive size-5" />
        )}
      </button>
      <CardHeader className="pr-20">
        <CardTitle className="capitalize truncate flex gap-x-3 items-center mb-1">
          <span>{block.name}</span>
        </CardTitle>
        <div className="flex gap-x-2 pb-1">
          <Badge variant="outline">
            {block.recipes.length}{" "}
            {block.recipes.length !== 1 ? "Recipes" : "Recipe"}
          </Badge>
          {/* <Badge variant="outline">
            {recipe.is_suitable_for_fridge
              ? "Fridge-suitable"
              : "Not fridge-suitable"}
          </Badge>
          <a href={recipe.link} className="flex items-center" target="_blank">
            <Link2Icon className="size-4" />
          </a> */}
        </div>
        <Separator />
        <div className="flex gap-x-3 pt-2">
          <EditBlockModal block={block} />
          <EditBlockRecipesModal block={block} />
        </div>
      </CardHeader>
    </Card>
  );
};

export default RecipeCard;
