"use client";

import { TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import { deleteIngredient } from "./actions";
import { ingredientsTable } from "@/db/schema";
import { useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ActionResult } from "@/types/action-result";
import useFormToast from "@/hooks/use-form-toast";
import { Badge } from "@/components/ui/badge";

type Ingredient = typeof ingredientsTable.$inferSelect;

const IngredientCard = ({ ingredient }: { ingredient: Ingredient }) => {
  const [deleting, setDeleting] = useState(false);

  const [result, setResult] = useState<ActionResult>({
    state: "init",
  } as ActionResult);

  const onDelete = async () => {
    setDeleting(true);
    const result = await deleteIngredient(ingredient.id);
    setResult(result);
    setDeleting(false);
  };

  useFormToast(result);

  return (
    <Card key={ingredient.id} className="mb-5 relative">
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
      <CardHeader>
        <CardTitle className="capitalize flex gap-x-3 items-center">
          <span>{ingredient.name}</span>
          {ingredient.is_pantry && <Badge variant="outline">Pantry</Badge>}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default IngredientCard;
