import { cn } from "@/lib/utils";
import { useState } from "react";

import {
  UpdateIcon,
  QuestionMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

const DeleteButton = ({
  deleting,
  onDelete,
}: {
  deleting: boolean;
  onDelete: () => void;
}) => {
  const [firstClick, setFirstClick] = useState(false);

  const onClick = () => {
    if (!firstClick) {
      setFirstClick(true);

      setTimeout(() => {
        setFirstClick(false);
      }, 2000);

      return;
    }

    onDelete();
  };

  return (
    <button
      onClick={onClick}
      disabled={deleting}
      className={cn(
        firstClick
          ? "bg-destructive/20 hover:bg-destructive/30"
          : "hover:bg-foreground/10",
        "border-b border-l absolute top-0 right-0 bottom-0 flex items-center rounded-r-xl p-3 cursor-pointer"
      )}
    >
      {deleting ? (
        <UpdateIcon className="text-foreground/40 animate-spin size-5" />
      ) : (
        <>
          {firstClick ? (
            <>
              <QuestionMarkIcon className="text-destructive size-5" />
              <div className="absolute flex items-center gap-x-2 right-[85%] top-[43%] text-nowrap text-sm z-10 rounded-lg border border-destructive bg-background text-destructive px-5 py-1">
                <ExclamationTriangleIcon className="text-destructive" />
                Click again to confirm...
              </div>
            </>
          ) : (
            <TrashIcon className="text-destructive size-5" />
          )}
        </>
      )}
    </button>
  );
};

export default DeleteButton;
