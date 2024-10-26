"use client";

import { DataResult } from "@/types/action-result";
import { AiRecipeResult, importRecipeUsingAi } from "./actions";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FieldErrors from "@/components/ui/form/field-errors";
import Form from "@/components/ui/form";
import useResetableActionState from "@/hooks/use-reset-action-state";
import { MagicWandIcon, StarIcon, UpdateIcon } from "@radix-ui/react-icons";
import useFormToast from "@/hooks/use-form-toast";
import AiEditorRecipe from "./ai-recipe-editor";

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
    } as DataResult<AiRecipeResult>
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

  const onCompleteImport = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <StarIcon />
          <span>Import recipe with AI</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        // Prevent closing the dialog when clicking outside when data loaded
        onInteractOutside={(e) => state.data && e.preventDefault()}
        className="max-w-xl"
      >
        {state.successful && state.data && (
          <AiEditorRecipe recipe={state.data} onComplete={onCompleteImport} />
        )}
        {!state.data && (
          <Form action={formAction}>
            <DialogHeader>
              <DialogTitle className="flex gap-x-3">
                <MagicWandIcon className="size-5" />
                Import recipe with AI
              </DialogTitle>
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
            {!state.successful && <FieldErrors errors={state.errors} />}
            <DialogFooter>
              <Button className="w-full" type="submit" disabled={pending}>
                {pending ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  <span>Import</span>
                )}
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewRecipeWithAiModal;
