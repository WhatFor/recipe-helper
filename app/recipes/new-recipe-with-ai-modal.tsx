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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <StarIcon />
          <span>Import recipe with AI</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        {state.successful && state.data && (
          <div className="flex flex-col gap-y-3">
            <div className="flex flex-col gap-y-1">
              <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
                Name
              </p>
              <p>{state.data.name}</p>
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
                Description
              </p>
              <p>{state.data.description}</p>
            </div>
            <div className="flex">
              <div className="flex w-1/2 flex-col gap-y-1">
                <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
                  Fast
                </p>
                <p>{state.data.is_fast ? "Yes" : "No"}</p>
              </div>
              <div className="flex w-1/2 flex-col gap-y-1">
                <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
                  Suitable for fridge
                </p>
                <p>{state.data.is_suitable_for_fridge ? "Yes" : "No"}</p>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-y-2">
              <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
                Ingredients
              </p>
              <table className="w-full">
                <tbody>
                  {state.data.ingredients.map((ingredient) => (
                    <tr
                      className="border-b border-foreground/50"
                      key={ingredient.name}
                    >
                      <td className="capitalize py-1">{ingredient.name}</td>
                      <td className="capitalize">{ingredient.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
