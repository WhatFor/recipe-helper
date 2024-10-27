"use client";

import Header from "@/components/ui/header";
import BlockCard from "./block-card";
import CreateBlocksWithAiModal from "./create-blocks-with-ai-modal";
import NewBlockModal from "./new-block-modal";
import { BlockWithRecipes } from "./page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

interface Props {
  blocks: BlockWithRecipes[];
}

const BlocksPage = ({ blocks }: Props) => {
  const params = useSearchParams();
  const aiImport = params.get("ai_import");

  const [newBlocksWithAiModalOpen, setNewBlocksWithAiModalOpen] = useState(
    aiImport === "1"
  );

  return (
    <div className="flex flex-col gap-y-3">
      <Header>Meal plans</Header>
      <div className="flex flex-col-reverse md:flex-row gap-3 justify-between">
        <NewBlockModal />
        <CreateBlocksWithAiModal
          open={newBlocksWithAiModalOpen}
          setOpen={setNewBlocksWithAiModalOpen}
        />
      </div>
      <ScrollArea className="h-[600px] w-full rounded-xl border p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {blocks.map((b) => (
            <BlockCard key={b.id} block={b} />
          ))}
          <Card
            onClick={() => setNewBlocksWithAiModalOpen(true)}
            className="group hover:bg-foreground/10 transition-colors cursor-pointer min-h-40"
          >
            <CardContent className="flex items-center justify-center h-full p-0">
              <PlusIcon className="size-12 text-foreground/30 group-hover:text-foreground/40 transition-colors" />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default BlocksPage;
