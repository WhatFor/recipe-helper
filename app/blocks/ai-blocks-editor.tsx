import { Button } from "@/components/ui/button";
import { AiBlocksResult, completeAiBlocksImport } from "./actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditableInput } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UpdateIcon } from "@radix-ui/react-icons";

interface Props {
  result: AiBlocksResult;
  onComplete: () => void;
}

const AiBlocksEditor = ({ result, onComplete }: Props) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [state, setState] = useState<AiBlocksResult>(result);

  const onChange = (key: string, value: unknown) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const onClickSave = async () => {
    setSaving(true);
    const result = await completeAiBlocksImport(state);
    setSaving(false);

    toast({
      title: result.message?.title,
      description: result.message?.description,
      variant: result.successful ? "default" : "destructive",
    });

    if (result.successful) {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col gap-y-3 p-3">
      <h1 className="font-semibold leading-none tracking-tight text-lg text-foreground">
        Your meal plan
      </h1>
      <div className="leading-none tracking-tight text-sm text-yellow-200 border rounded p-3 bg-yellow-950 flex flex-col gap-y-1">
        <p>The AI does it&apos;s best, but sometimes it makes mistakes.</p>
        <p>Rename the sections below by clicking on the name.</p>
      </div>
      <ScrollArea
        className="h-full overflow-y-auto"
        style={{ height: "calc(100vh - 500px)" }}
      >
        <div className="flex flex-col gap-y-3">
          {state.blocks.map((block, index) => (
            <div
              key={index}
              className="flex flex-col border px-3 py-5 rounded-lg bg-foreground/10"
            >
              <EditableInput
                value={block.name}
                slim
                className="text-lg mb-3"
                onChange={(v) =>
                  onChange(
                    "blocks",
                    state.blocks.map((block, ix) =>
                      ix === index ? { ...block, name: v } : block
                    )
                  )
                }
              />
              <div className="mb-3">
                {block.recipes.map((recipe, fieldIndex) => (
                  <ul
                    key={fieldIndex}
                    className="flex flex-col gap-y-1 list-disc ml-6"
                  >
                    <li className="text-foreground/70">
                      <p className="truncate text-sm text-foreground/70">
                        {recipe.name}
                      </p>
                    </li>
                  </ul>
                ))}
              </div>
              <div className="border border-teal-600 rounded-lg px-5 py-3 mx-3">
                <h3 className="text-foreground/70 text-sm mb-2 font-semibold">
                  About
                </h3>
                <p className="text-sm text-foreground/70">
                  This group was created because these ingredients are common:
                </p>
                <p className="text-sm">{block.common_ingredients.join(", ")}</p>
                <p className="text-sm text-foreground/70 mt-2">
                  The total similarity score is
                  <span className="text-foreground text-sm ml-1">
                    {block.similarity * 100}%
                  </span>
                  .
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button disabled={saving} onClick={onClickSave}>
        {saving ? <UpdateIcon className="animate-spin" /> : "Complete"}
      </Button>
    </div>
  );
};

export default AiBlocksEditor;
