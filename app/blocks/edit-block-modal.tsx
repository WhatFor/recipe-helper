"use client";

import { ActionResult } from "@/types/action-result";
import { updateBlock } from "./actions";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FieldErrors from "@/components/ui/form/field-errors";
import Form from "@/components/ui/form";
import useResetableActionState from "@/hooks/use-reset-action-state";
import useFormToast from "@/hooks/use-form-toast";
import { blocksTable } from "@/db/schema";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Block = typeof blocksTable.$inferSelect;

const EditBlockModal = ({ block }: { block: Block }) => {
  const [open, setOpen] = useState(false);

  const [blockValues, setBlockValues] = useState(block);

  const updateBlockWithId = updateBlock.bind(null, block.id);

  const [state, formAction, pending, reset] = useResetableActionState(
    updateBlockWithId,
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
      <DialogContent className="max-w-xl">
        <Form action={formAction}>
          <DialogHeader>
            <DialogTitle>Edit {block.name} block</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="blockName">Name</Label>
            <Input
              autoFocus={true}
              autoComplete="off"
              id="blockName"
              name="blockName"
              type="text"
              value={blockValues.name}
              onChange={(e) =>
                setBlockValues((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          {!state.successful && <FieldErrors errors={state.errors} />}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              Save
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBlockModal;
