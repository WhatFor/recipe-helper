"use client";

import { createBlock } from "./actions";
import { ActionResult } from "@/types/action-result";
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

const NewBlockModal = () => {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending, reset] = useResetableActionState(
    createBlock,
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
          <PlusIcon />
          <span>New meal plan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <Form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create plan</DialogTitle>
            <DialogDescription>Create a new meal plan.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="blockName">Name</Label>
            <Input
              autoFocus={true}
              autoComplete="off"
              id="blockName"
              name="blockName"
              type="text"
            />
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

export default NewBlockModal;
