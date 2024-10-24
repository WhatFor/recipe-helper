import { useRef, useEffect } from "react";
import { useToast } from "./use-toast";
import { ActionResult } from "@/types/action-result";

const useFormToast = (formState: ActionResult) => {
  const { toast } = useToast();
  const prevTimestamp = useRef(formState.timestamp);

  const shouldDisplayToast =
    formState.state == "dirty" && formState.timestamp !== prevTimestamp.current;

  useEffect(() => {
    if (shouldDisplayToast) {
      if (formState.successful) {
        toast({
          title: formState.message.title,
          description: formState.message.description,
        });
      } else if (formState.errors) {
        console.log("Errors", formState.errors);
        toast({
          variant: "destructive",
          title: "Uh oh",
          description: formState.errors
            .map((error) => error.message)
            .join("\n"),
        });
      } else {
        console.log("Something went wrong");
        toast({
          variant: "destructive",
          title: "Uh oh",
          description: "Something went wrong",
        });
      }
    }
    prevTimestamp.current = formState.timestamp;
  }, [formState, shouldDisplayToast, toast]);
};

export default useFormToast;