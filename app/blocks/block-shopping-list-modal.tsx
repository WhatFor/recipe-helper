"use client";

import { BlockWithRecipes } from "./page";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CopyIcon, UpdateIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  generateBlockShoppingList,
  getShoppingList,
  ShoppingListItem,
} from "./actions";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const BlockShoppingListModal = ({ block }: { block: BlockWithRecipes }) => {
  const [generating, setGenerating] = useState(false);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [listCopied, setListCopied] = useState(false);
  const { toast } = useToast();

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const fetchShoppingList = async () => {
    const response = await getShoppingList(block.id);

    if (response.successful && response.data) {
      if (
        response.data.exists &&
        response.data.list &&
        response.data.list.length > 0
      ) {
        setShoppingList(response.data.list);
      } else {
        setGenerating(true);
        generateShoppingList();
      }
    }
  };

  const generateShoppingList = async () => {
    try {
      const response = await generateBlockShoppingList(block.id);

      if (response.successful && response.data) {
        if (
          response.data.exists &&
          response.data.list &&
          response.data.list.length > 0
        ) {
          setShoppingList(response.data.list);
        }
      } else {
        toast({
          title: response.message?.title ?? "Something went wrong",
          description:
            response.message?.description ?? "Please try again later",
        });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later",
      });
    }

    setGenerating(false);
  };

  const onClickCopy = () => {
    const text = shoppingList
      .map((item) => `${item.name} - ${item.amount}`)
      .join("\n");

    navigator.clipboard.writeText(text);

    setListCopied(true);

    setTimeout(() => {
      setListCopied(false);
    }, 3000);
  };

  useEffect(() => {
    if (open) {
      if (shoppingList.length === 0) {
        fetchShoppingList();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Shopping list</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{block.name} shopping list</DialogTitle>
        </DialogHeader>
        {generating && (
          <div className="rounded-lg bg-foreground/10 flex flex-col px-3 py-8 items-center justify-center gap-y-4">
            <UpdateIcon className="size-6 text-foreground animate-spin" />
            <p className="text-sm text-foreground/70">
              Creating your shopping list...
            </p>
          </div>
        )}
        {shoppingList.length > 0 && (
          <>
            <Button onClick={onClickCopy}>
              <CopyIcon className="size-4" />
              <span>{listCopied ? "Copied!" : "Copy"}</span>
            </Button>
            <ScrollArea
              className="h-full overflow-y-auto"
              style={{ height: "calc(100vh - 500px)" }}
            >
              <div className="px-4 pt-2 pb-5">
                <table className="w-full">
                  <tbody className="gap-x-2">
                    {shoppingList.map((item) => (
                      <tr
                        className="border-y border-foreground/10"
                        key={item.name}
                      >
                        <td className="px-3 py-1 w-1/2">{item.name}</td>
                        <td className="px-3 text-foreground/50 w-1/2">
                          {item.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BlockShoppingListModal;
