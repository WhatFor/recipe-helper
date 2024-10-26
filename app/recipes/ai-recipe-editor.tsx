import { AiRecipeResult, completeAiRecipeImport } from "./actions";
import { useState } from "react";
import { EditableTextarea } from "@/components/ui/textarea";
import { EditableInput } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

import {
  EyeClosedIcon,
  EyeOpenIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";

interface Props {
  recipe: AiRecipeResult;
  onComplete: () => void;
}

const AiEditorRecipe = ({ recipe, onComplete }: Props) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const [state, setState] = useState(recipe);

  const onChange = (key: string, value: unknown) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const onDeleteIngredient = (index: number) => {
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, ix) => ix !== index),
    }));
  };

  const togglePantry = (index: number) => {
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((i, ix) =>
        ix === index ? { ...i, is_pantry: !i.is_pantry } : i
      ),
    }));
  };

  const onClickSave = async () => {
    setSaving(true);
    const result = await completeAiRecipeImport(state);
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
    <div className="flex flex-col gap-y-5">
      <h1 className="font-semibold leading-none tracking-tight text-lg text-foreground">
        Recipe
      </h1>
      <div className="leading-none tracking-tight text-sm text-yellow-200 border rounded p-3 bg-yellow-950 flex flex-col gap-y-1">
        <p>The AI does it&apos;s best, but sometimes it makes mistakes.</p>
        <p>
          Click on any of the information below to edit the recipe before
          saving!
        </p>
      </div>
      <div className="flex flex-col gap-y-1">
        <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
          Name
        </p>
        <EditableInput
          value={state.name}
          onChange={(v) => onChange("name", v)}
        />
      </div>
      <div className="flex flex-col gap-y-1">
        <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
          Description
        </p>
        <EditableTextarea
          value={state.description}
          onChange={(v) => onChange("description", v)}
        />
      </div>
      <div className="flex">
        <div className="flex w-1/2 flex-col gap-y-2">
          <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
            Fast
          </p>
          <Checkbox
            id="isFast"
            name="isFast"
            checked={state.is_fast}
            onClick={() =>
              setState((prev) => ({
                ...prev,
                is_fast: !prev.is_fast,
              }))
            }
          />
        </div>
        <div className="flex w-1/2 flex-col gap-y-2">
          <p className="font-semibold leading-none tracking-tight text-sm text-foreground/70">
            Suitable for fridge
          </p>
          <Checkbox
            id="isSuitableForFridge"
            name="isSuitableForFridge"
            checked={state.is_suitable_for_fridge}
            onClick={() =>
              setState((prev) => ({
                ...prev,
                is_suitable_for_fridge: !prev.is_suitable_for_fridge,
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <ScrollArea
          className="h-full overflow-y-auto"
          style={{ height: "calc(100vh - 500px)" }}
        >
          <table className="w-full table-fixed">
            <tbody>
              {state.ingredients.map((ingredient, index) => (
                <tr
                  className="border-b border-foreground/50 h-10 cursor-pointer"
                  key={ingredient.name}
                >
                  <td onClick={() => togglePantry(index)}>
                    {ingredient.is_pantry ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </td>
                  <td className="capitalize py-1 w-6/12 truncate">
                    <EditableInput
                      slim
                      value={ingredient.name}
                      onChange={(v) =>
                        onChange(
                          "ingredients",
                          state.ingredients.map((i, ix) =>
                            ix === index ? { ...i, name: v } : i
                          )
                        )
                      }
                    />
                  </td>
                  <td className="w-4/12">
                    <EditableInput
                      slim
                      value={ingredient.quantity}
                      onChange={(v) =>
                        onChange(
                          "ingredients",
                          state.ingredients.map((i, ix) =>
                            ix === index ? { ...i, quantity: v } : i
                          )
                        )
                      }
                    />
                  </td>
                  <td className="w-1/12">
                    <div
                      title="Delete ingredient"
                      className="flex items-center justify-center rounded-lg cursor-pointer size-8 hover:bg-red-950"
                      onClick={() => onDeleteIngredient(index)}
                    >
                      <TrashIcon className="size-5 text-destructive" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>
      <div className="flex gap-x-4">
        <p className="flex gap-x-1 items-center">
          <EyeClosedIcon />{" "}
          <span className="text-sm text-foreground/70">Pantry</span>
        </p>
        <p className="flex gap-x-1 items-center">
          <EyeOpenIcon />{" "}
          <span className="text-sm text-foreground/70">Non-pantry</span>
        </p>
      </div>
      <Button disabled={saving} onClick={onClickSave}>
        {saving ? <UpdateIcon className="animate-spin" /> : "Save"}
      </Button>
    </div>
  );
};
export default AiEditorRecipe;
