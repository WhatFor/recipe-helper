"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BlockWithRecipes } from "./page";
import { Input } from "@/components/ui/input";
import {
  Cross1Icon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import useDebounce from "@/hooks/use-debounce";
import {
  addRecipeToBlock,
  findRecipe,
  FindRecipeResult,
  removeRecipeFromBlock,
} from "./actions";
import { useToast } from "@/hooks/use-toast";

const EditBlockRecipesModal = ({ block }: { block: BlockWithRecipes }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [searching, setSearching] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipesFound, setRecipesFound] = useState<FindRecipeResult[]>([]);
  const debouncedSearch = useDebounce(recipeSearch, 500);

  const resetRecipeSearch = () => {
    setRecipeSearch("");
    setRecipesFound([]);
  };

  const onOpenChange = (open: boolean) => {
    resetRecipeSearch();
    setOpen(open);
  };

  const fetchRecipes = async () => {
    const response = await findRecipe(debouncedSearch, block.id);
    setSearching(false);

    if (response.successful && response.data) {
      setRecipesFound(response.data);
    } else {
      toast({
        title: "Uh oh",
        description: "Something went wrong",
      });
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearching(true);
    setRecipeSearch(e.target.value);
  };

  const onClickAddRecipe = async (recipeId: number) => {
    const result = await addRecipeToBlock(block.id, recipeId);

    if (result.successful) {
      toast({
        title: "Recipe added",
        description: "The recipe has been added to the block.",
      });

      resetRecipeSearch();
    } else {
      toast({
        title: "Uh oh",
        description: "Something went wrong",
      });
    }
  };

  const onClickRemoveRecipe = async (recipeId: number) => {
    const result = await removeRecipeFromBlock(block.id, recipeId);

    if (result.successful) {
      toast({
        title: result.message?.title,
        description: result.message?.description,
      });
    } else {
      toast({
        title: "Uh oh",
        description: "Something went wrong",
      });
    }
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Recipes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        {/* <Form action={formAction}> */}
        <DialogHeader>
          <DialogTitle>{block.name} recipes</DialogTitle>
          <DialogDescription>
            Manage recipes in the {block.name} block.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Input
            id="recipe-search"
            name="recipe-search"
            autoComplete="off"
            placeholder="Add a recipe"
            onChange={onSearchChange}
            value={recipeSearch}
          ></Input>
          {recipeSearch ? (
            <Cross1Icon
              onClick={resetRecipeSearch}
              className="absolute cursor-pointer hover:bg-foreground/20 rounded p-1 size-7 right-1 top-1"
            ></Cross1Icon>
          ) : (
            <MagnifyingGlassIcon className="absolute size-5 text-foreground/50 right-3 top-2" />
          )}
        </div>
        {recipesFound.length > 0 && (
          <div className="flex flex-col gap-y-2 border border-foreground rounded-md p-4">
            <h1 className="font-semibold leading-none tracking-tight mb-2">
              Search results
            </h1>
            {recipesFound.map((recipe) => (
              <div
                className="flex justify-between items-center p-3 border rounded-md hover:bg-foreground/10"
                key={recipe.id}
              >
                <p>{recipe.name}</p>
                <Button onClick={() => onClickAddRecipe(recipe.id)} size="icon">
                  <PlusIcon />
                </Button>
              </div>
            ))}
          </div>
        )}
        {!searching && recipeSearch && recipesFound.length === 0 && (
          <div className="flex gap-x-2 border text-destructive border-destructive rounded-md p-4">
            <Cross1Icon />
            <h1 className="leading-none tracking-tight">No results found</h1>
          </div>
        )}
        <div className="flex flex-col gap-y-2">
          {block.recipes.map((recipe) => (
            <div
              className="flex justify-between items-center p-3 border rounded-md hover:bg-foreground/10"
              key={recipe.id}
            >
              <p>
                <span className="text-foreground/50 text-sm mr-3">
                  {recipe.id}
                </span>
                {recipe.name}
              </p>
              <Button
                onClick={() => onClickRemoveRecipe(recipe.id)}
                size="icon"
              >
                <TrashIcon />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBlockRecipesModal;
