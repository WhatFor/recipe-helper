"use client";

import Header from "@/components/ui/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import NewRecipeModal from "./new-recipe-modal";
import RecipeCard from "./recipe-card";
import NewRecipeWithAiModal from "./new-recipe-with-ai-modal";
import { Card, CardContent } from "@/components/ui/card";
import {
  Cross1Icon,
  EyeClosedIcon,
  EyeOpenIcon,
  MixerHorizontalIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { RecipeWithIngredients } from "./page";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Props {
  recipes: RecipeWithIngredients[];
}

const RecipesPage = ({ recipes }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState("");
  const aiImport = params.get("ai_import");

  const fast = (params.get("fast") ?? "1") === "1";
  const slow = (params.get("slow") ?? "1") === "1";
  const fridge = (params.get("fridge") ?? "1") === "1";
  const nonFridge = (params.get("non_fridge") ?? "1") === "1";

  const debouncedSearch = useDebounce(search, 300);

  const [newRecipeWithAiModalOpen, setNewRecipeWithAiModalOpen] = useState(
    aiImport === "1"
  );

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const setParams = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    p.set(key, value);
    router.push(pathname + "?" + p.toString());
  };

  const onToggleFast = () => {
    setParams("fast", fast ? "0" : "1");
  };

  const onToggleSlow = () => {
    setParams("slow", slow ? "0" : "1");
  };

  const onToggleFridge = () => {
    setParams("fridge", fridge ? "0" : "1");
  };

  const onToggleNonFridge = () => {
    setParams("non_fridge", nonFridge ? "0" : "1");
  };

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      const p = new URLSearchParams(params.toString());
      p.set("search", debouncedSearch);
      router.push(pathname + "?" + p.toString());
    } else {
      const p = new URLSearchParams(params.toString());
      p.delete("search");
      router.push(pathname + "?" + p.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-y-3">
      <Header>Your recipes</Header>
      <div className="flex gap-3 flex-col md:flex-row md:justify-between">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Input
              value={search}
              onChange={onSearch}
              placeholder="Search..."
              className="md:max-w-64"
            />
            {search.length > 0 && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center justify-center p-2"
              >
                <Cross1Icon className="size-5 text-foreground/50" />
              </button>
            )}
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-full" variant="outline">
                  <MixerHorizontalIcon className="size-5" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-foreground/60">
                    Speed
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <Button
                      onClick={onToggleFast}
                      className="w-1/2"
                      variant={fast ? "default" : "outline"}
                    >
                      {fast ? (
                        <EyeOpenIcon className="size-5" />
                      ) : (
                        <EyeClosedIcon className="size-5" />
                      )}
                      Fast
                    </Button>
                    <Button
                      onClick={onToggleSlow}
                      className="w-1/2"
                      variant={slow ? "default" : "outline"}
                    >
                      {slow ? (
                        <EyeOpenIcon className="size-5" />
                      ) : (
                        <EyeClosedIcon className="size-5" />
                      )}
                      Slow
                    </Button>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground/60">
                    Fridge suitable?
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={onToggleFridge}
                      className="w-1/2"
                      variant={fridge ? "default" : "outline"}
                    >
                      {fridge ? (
                        <EyeOpenIcon className="size-5" />
                      ) : (
                        <EyeClosedIcon className="size-5" />
                      )}
                      Yes
                    </Button>
                    <Button
                      onClick={onToggleNonFridge}
                      className="w-1/2"
                      variant={nonFridge ? "default" : "outline"}
                    >
                      {nonFridge ? (
                        <EyeOpenIcon className="size-5" />
                      ) : (
                        <EyeClosedIcon className="size-5" />
                      )}
                      No
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <NewRecipeModal />
          <NewRecipeWithAiModal
            open={newRecipeWithAiModalOpen}
            setOpen={setNewRecipeWithAiModalOpen}
          />
        </div>
      </div>
      <ScrollArea
        className="h-full w-full rounded-xl border p-3 mb-3"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
          <Card
            onClick={() => setNewRecipeWithAiModalOpen(true)}
            className="group hover:bg-foreground/10 transition-colors cursor-pointer min-h-48"
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

export default RecipesPage;
