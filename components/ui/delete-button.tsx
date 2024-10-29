import { UpdateIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DeleteButton = ({
  deleting,
  onDelete,
}: {
  deleting: boolean;
  onDelete: () => void;
}) => {
  if (deleting) {
    return (
      <div className="absolute top-3 right-5">
        <UpdateIcon className="text-foreground/40 animate-spin size-5" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="absolute top-3 right-5">
        <DotsHorizontalIcon className="text-foreground size-5 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" onSelect={onDelete}>
          <p className="text-destructive">Delete</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DeleteButton;
