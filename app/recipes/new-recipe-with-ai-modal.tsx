"use client";

import { ActionResult } from "@/types/action-result";
import { importRecipeUsingAi } from "./actions";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FieldErrors from "@/components/ui/form/field-errors";
import Form from "@/components/ui/form";
import useResetableActionState from "@/hooks/use-reset-action-state";
import { StarIcon } from "@radix-ui/react-icons";
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

const NewRecipeWithAiModal = () => {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending, reset] = useResetableActionState(
    importRecipeUsingAi,
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
          <StarIcon />
          <span>Import recipe with AI</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <Form action={formAction}>
          <DialogHeader>
            <DialogTitle>Import recipe with AI</DialogTitle>
            <DialogDescription>
              Import a new recipe using AI magic.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <Input
              autoComplete="off"
              placeholder="Recipe link"
              id="recipeLink"
              name="recipeLink"
              type="text"
            />
          </div>
          {/* <div className="flex gap-x-3 items-center text-center">
            <Checkbox id="isSuitableForFridge" name="isSuitableForFridge" />
            <Label className="w-full text-left" htmlFor="isSuitableForFridge">
              Suitable for the fridge
            </Label>
          </div> */}
          {!state.successful && <FieldErrors errors={state.errors} />}
          <DialogFooter>
            <Button className="w-full" type="submit" disabled={pending}>
              Import
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewRecipeWithAiModal;
