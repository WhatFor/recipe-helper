"use client";

import { ActionResult } from "@/types/action-result";
import { createRecipe } from "./actions";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FieldErrors from "@/components/ui/form/field-errors";
import Form from "@/components/ui/form";
import useResetableActionState from "@/hooks/use-reset-action-state";
import useFormToast from "@/hooks/use-form-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const EditRecipeIngredientsModal = () => {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending, reset] = useResetableActionState(
    createRecipe,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Ingredients</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create Recipe</DialogTitle>
            <DialogDescription>Create a new recipe.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="recipeName">Name</Label>
            <Input
              autoFocus={true}
              autoComplete="off"
              id="recipeName"
              name="recipeName"
              type="text"
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="recipeDescription">Description</Label>
            <Input
              autoComplete="off"
              id="recipeDescription"
              name="recipeDescription"
              type="text"
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="recipeLink">Link</Label>
            <Input
              autoComplete="off"
              id="recipeLink"
              name="recipeLink"
              type="text"
            />
          </div>
          <div className="flex gap-x-3 items-center text-center">
            <Checkbox id="isFast" />
            <Label className="w-full text-left" htmlFor="isFast">
              Fast
            </Label>
          </div>
          <div className="flex gap-x-3 items-center text-center">
            <Checkbox id="isSuitableForFridge" />
            <Label className="w-full text-left" htmlFor="isSuitableForFridge">
              Suitable for the fridge?
            </Label>
          </div>
          {!state.successful && <FieldErrors errors={state.errors} />}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              Add
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecipeIngredientsModal;
