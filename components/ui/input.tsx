import * as React from "react";

import { cn } from "@/lib/utils";
import useKeybind from "@/hooks/use-keybind";
import { Button } from "./button";
import { CheckIcon } from "@radix-ui/react-icons";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const EditableInput = ({
  value,
  onChange,
  slim,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  slim?: boolean;
  className?: string;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [val, setVal] = React.useState(value);
  const [editing, setEditing] = React.useState(false);

  const onClickEdit = () => {
    setEditing(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const onKeyboardSave = () => {
    if (!inputRef.current) return;
    if (inputRef.current !== document.activeElement) return;

    onChange(val);
    setEditing(false);
  };

  const onButtonSave = () => {
    onChange(val);
    setEditing(false);
  };

  useKeybind({ key: "Enter" }, onKeyboardSave);

  return (
    <>
      <div className={cn("flex", slim ? "gap-x-1" : "flex-col gap-y-1")}>
        <Input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className={cn(
            "border border-foreground/50 text-base",
            slim && "py-0 h-8",
            !editing && "hidden",
            className
          )}
        />
        <Button
          className={cn("mr-2", slim && "size-8", !editing && "hidden")}
          onClick={onButtonSave}
        >
          {slim ? <CheckIcon /> : "Save"}
        </Button>
      </div>
      <p
        className={cn(
          "cursor-pointer pl-3 w-full h-6",
          editing && "hidden",
          className
        )}
        onClick={onClickEdit}
      >
        {value}
      </p>
    </>
  );
};

export { Input, EditableInput };
