"use client";

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
import DeleteButton from "@/components/ui/delete-button";
import BlockShoppingListModal from "./block-shopping-list-modal";

const BlockCard = ({ block }: { block: BlockWithRecipes }) => {
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
    <Card key={block.id} className="relative">
      <DeleteButton deleting={deleting} onDelete={onDelete} />
      <CardHeader>
        <CardTitle className="capitalize truncate flex gap-x-3 items-center mb-1">
          <span>{block.name}</span>
        </CardTitle>
        <div className="flex gap-x-2 pb-1">
          <Badge variant="outline">
            {block.recipes.length}{" "}
            {block.recipes.length !== 1 ? "Recipes" : "Recipe"}
          </Badge>
        </div>
        <Separator />
        <div className="flex gap-x-3 pt-2">
          <EditBlockModal block={block} />
          <EditBlockRecipesModal block={block} />
          <BlockShoppingListModal block={block} />
        </div>
      </CardHeader>
    </Card>
  );
};

export default BlockCard;
