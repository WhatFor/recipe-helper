"use client";

import { ActionResult } from "@/types/action-result";
import { createIngredient } from "./actions";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FieldErrors from "@/components/ui/form/field-errors";
import Form from "@/components/ui/form";
import useResetableActionState from "@/hooks/use-reset-action-state";
import { PlusIcon } from "@radix-ui/react-icons";
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

const NewIngredientModal = () => {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending, reset] = useResetableActionState(
    createIngredient,
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
        <Button>
          <PlusIcon />
          <span>New ingredient</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <Form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create ingredient</DialogTitle>
            <DialogDescription>
              Create a new ingredient for recipes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="ingredientName">Name</Label>
            <Input
              autoFocus={true}
              autoComplete="off"
              id="ingredientName"
              name="ingredientName"
              type="text"
            />
          </div>
          <div className="flex gap-x-3 items-center text-center">
            <Checkbox id="isPantry" name="isPantry" />
            <Label className="w-full text-left" htmlFor="isPantry">
              Pantry
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

export default NewIngredientModal;
