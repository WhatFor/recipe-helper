"use client";

import { ActionResult } from "@/types/action-result";
import { updateRecipe } from "./actions";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FieldErrors from "@/components/ui/form/field-errors";
import Form from "@/components/ui/form";
import useResetableActionState from "@/hooks/use-reset-action-state";
import useFormToast from "@/hooks/use-form-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RecipeWithIngredients } from "./page";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EditRecipeModal = ({ recipe }: { recipe: RecipeWithIngredients }) => {
  const [open, setOpen] = useState(false);

  const [recipeValues, setRecipeValues] = useState(recipe);

  const updateRecipeWithId = updateRecipe.bind(null, recipe.id);

  const [state, formAction, pending, reset] = useResetableActionState(
    updateRecipeWithId,
    {
      state: "init",
      errors: undefined,
    } as ActionResult
  );

  useFormToast(state);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      startTransition(() => {
        reset();
      });
    }
  };

  useEffect(() => {
    if (state.state === "dirty" && state.successful) {
      onOpenChange(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <ScrollArea
          className="h-full"
          style={{ height: "calc(100vh - 200px)" }}
        >
          <div className="pl-0.5 pr-3.5">
            <Form action={formAction}>
              <DialogHeader>
                <DialogTitle>Edit {recipe.name}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="recipeName">Name</Label>
                <Input
                  autoFocus={true}
                  autoComplete="off"
                  id="recipeName"
                  name="recipeName"
                  type="text"
                  value={recipeValues.name}
                  onChange={(e) =>
                    setRecipeValues((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="recipeDescription">Description</Label>
                <Textarea
                  className="h-32"
                  autoComplete="off"
                  id="recipeDescription"
                  name="recipeDescription"
                  value={recipeValues.description}
                  onChange={(e) =>
                    setRecipeValues((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="recipeLink">Link</Label>
                <Input
                  autoComplete="off"
                  id="recipeLink"
                  name="recipeLink"
                  type="text"
                  value={recipeValues.link}
                  onChange={(e) =>
                    setRecipeValues((prev) => ({
                      ...prev,
                      link: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-x-3 items-center text-center">
                <Checkbox
                  id="isFast"
                  name="isFast"
                  checked={recipeValues.is_fast}
                  onClick={() =>
                    setRecipeValues((prev) => ({
                      ...prev,
                      is_fast: !prev.is_fast,
                    }))
                  }
                />
                <Label className="w-full text-left" htmlFor="isFast">
                  Fast
                </Label>
              </div>
              <div className="flex gap-x-3 items-center text-center">
                <Checkbox
                  id="isSuitableForFridge"
                  name="isSuitableForFridge"
                  checked={recipeValues.is_suitable_for_fridge}
                  onClick={() =>
                    setRecipeValues((prev) => ({
                      ...prev,
                      is_suitable_for_fridge: !prev.is_suitable_for_fridge,
                    }))
                  }
                />
                <Label
                  className="w-full text-left"
                  htmlFor="isSuitableForFridge"
                >
                  Suitable for the fridge
                </Label>
              </div>
              {!state.successful && <FieldErrors errors={state.errors} />}
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  Save
                </Button>
              </DialogFooter>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecipeModal;
