"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { RecipeWithIngredients } from "./page";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  addIngredientToRecipe,
  findIngredients,
  FindIngredientsResult,
  removeIngredientFromRecipe,
} from "./actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Cross1Icon,
  EyeClosedIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

const EditRecipeIngredientsModal = ({
  recipe,
}: {
  recipe: RecipeWithIngredients;
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [searching, setSearching] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientsFound, setIngredientsFound] = useState<
    FindIngredientsResult[]
  >([]);
  const debouncedSearch = useDebounce(ingredientSearch, 500);

  const resetSearch = () => {
    setIngredientSearch("");
    setIngredientsFound([]);
  };

  const onOpenChange = (open: boolean) => {
    resetSearch();
    setOpen(open);
  };

  const fetchIngredients = async () => {
    const response = await findIngredients(debouncedSearch, recipe.id);
    setSearching(false);

    if (response.successful && response.data) {
      setIngredientsFound(response.data);
    } else {
      toast({
        title: "Uh oh",
        description: "Something went wrong",
      });
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearching(true);
    setIngredientSearch(e.target.value);
  };

  const onClickAddIngredient = async (ingredientId: number) => {
    const result = await addIngredientToRecipe(recipe.id, ingredientId);

    if (result.successful) {
      toast({
        title: "Ingredient added",
        description: "The ingredient has been added to the recipe.",
      });

      resetSearch();
    } else {
      toast({
        title: "Uh oh",
        description: "Something went wrong",
      });
    }
  };

  const onClickRemoveIngredient = async (ingredientId: number) => {
    const result = await removeIngredientFromRecipe(recipe.id, ingredientId);

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
    fetchIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Ingredients</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl">
        <DialogHeader className="max-w-xl">
          <DialogTitle>{recipe.name} ingredients</DialogTitle>
          <DialogDescription>
            Manage ingredients in the {recipe.name} recipe.
          </DialogDescription>
        </DialogHeader>
        <div className="relative max-w-xl">
          <Input
            id="search"
            name="search"
            autoComplete="off"
            placeholder="Add an ingredient"
            onChange={onSearchChange}
            value={ingredientSearch}
          ></Input>
          {ingredientSearch ? (
            <Cross1Icon
              onClick={resetSearch}
              className="absolute cursor-pointer hover:bg-foreground/20 rounded p-1 size-7 right-1 top-1"
            ></Cross1Icon>
          ) : (
            <MagnifyingGlassIcon className="absolute size-5 text-foreground/50 right-3 top-2" />
          )}
        </div>
        {ingredientsFound.length > 0 && (
          <div className="flex flex-col gap-y-2 border border-foreground rounded-md p-4">
            <h1 className="font-semibold leading-none tracking-tight mb-2">
              Search results
            </h1>
            {ingredientsFound.map((ingredient) => (
              <div
                className="flex justify-between items-center p-3 border rounded-md hover:bg-foreground/10"
                key={ingredient.id}
              >
                <p>{ingredient.name}</p>
                <Button
                  onClick={() => onClickAddIngredient(ingredient.id)}
                  size="icon"
                >
                  <PlusIcon />
                </Button>
              </div>
            ))}
          </div>
        )}
        {!searching && ingredientSearch && ingredientsFound.length === 0 && (
          <div className="flex gap-x-2 border text-destructive border-destructive rounded-md p-4">
            <Cross1Icon />
            <h1 className="leading-none tracking-tight">No results found</h1>
          </div>
        )}
        <ScrollArea
          className="h-full overflow-y-auto"
          style={{ height: "calc(100vh - 500px)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pr-3.5">
            {recipe.ingredients.map((ingredient) => (
              <div
                className="flex justify-between items-center py-3 px-5 border rounded-md hover:bg-foreground/10"
                key={ingredient.id}
              >
                <div className="flex gap-x-3">
                  <div className="flex items-center">
                    {ingredient.is_pantry ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </div>
                  <div className="flex flex-col">
                    <p>{ingredient.name}</p>
                    <span className="text-foreground/60 text-sm">
                      {ingredient.quantity}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => onClickRemoveIngredient(ingredient.id)}
                  size="icon"
                  variant="destructive"
                >
                  <TrashIcon />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
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
      </DialogContent>
    </Dialog>
  );
};

export default EditRecipeIngredientsModal;
