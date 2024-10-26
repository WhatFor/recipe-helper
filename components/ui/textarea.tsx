import * as React from "react";

import { cn } from "@/lib/utils";
import useKeybind from "@/hooks/use-keybind";
import { Button } from "./button";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

const EditableTextarea = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const areaRef = React.useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = React.useState(value);
  const [editing, setEditing] = React.useState(false);

  const onKeyboardSave = () => {
    if (!areaRef.current) return;
    if (areaRef.current !== document.activeElement) return;

    onChange(val);
    setEditing(false);
  };

  const onButtonSave = () => {
    onChange(val);
    setEditing(false);
  };

  useKeybind({ key: "Enter", ctrlKey: true }, onKeyboardSave);

  return editing ? (
    <div className="flex flex-col gap-y-1">
      <Textarea
        ref={areaRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="border border-foreground/50 h-24"
      />
      <Button onClick={onButtonSave}>Save</Button>
    </div>
  ) : (
    <p className="cursor-pointer" onClick={() => setEditing(true)}>
      {value}
    </p>
  );
};

export { EditableTextarea, Textarea };
