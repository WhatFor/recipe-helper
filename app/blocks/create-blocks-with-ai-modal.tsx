"use client";

import { AiBlocksResult, createBlocksWithAi } from "./actions";
import { DataResult } from "@/types/action-result";
import { startTransition } from "react";
import { Button } from "@/components/ui/button";
import Form from "@/components/ui/form";
import useResetableActionState from "@/hooks/use-reset-action-state";
import { MagicWandIcon, StarIcon, UpdateIcon } from "@radix-ui/react-icons";
import useFormToast from "@/hooks/use-form-toast";
import AiBlocksEditor from "./ai-blocks-editor";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateBlocksWithAiModal = ({ open, setOpen }: Props) => {
  const [state, formAction, pending, reset] = useResetableActionState(
    createBlocksWithAi,
    {
      state: "init",
      errors: undefined,
    } as DataResult<AiBlocksResult>
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
          <span>Create plans with Artificial Intelligence</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        // Prevent closing the dialog when clicking outside when data loaded
        onInteractOutside={(e) => state.data && e.preventDefault()}
        className="max-w-xl"
      >
        {state.successful && state.data && (
          <AiBlocksEditor result={state.data} onComplete={onCompleteImport} />
        )}
        {!state.data && (
          <Form action={formAction}>
            <DialogHeader>
              <DialogTitle className="flex gap-x-3">
                <MagicWandIcon className="size-5" />
                Create meal plans using Artificial Intelligence
              </DialogTitle>
              <DialogDescription>
                Use AI magic to transform your recipes into efficient, fresh
                meal plans.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="w-full" type="submit" disabled={pending}>
                {pending ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  <span>Start</span>
                )}
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateBlocksWithAiModal;
