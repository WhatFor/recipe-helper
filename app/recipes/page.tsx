import { drizzle } from "drizzle-orm/vercel-postgres";
import { recipesTable } from "@/db/schema";
import Header from "@/components/ui/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { desc } from "drizzle-orm";
import NewRecipeModal from "./new-recipe-modal";
import RecipeCard from "./recipe-card";

const IngredientsPage = async () => {
  const db = drizzle();

  const result = await db
    .select()
    .from(recipesTable)
    .orderBy(desc(recipesTable.id));

  return (
    <div className="flex flex-col gap-y-8">
      <Header>Recipes</Header>
      <NewRecipeModal />
      <ScrollArea className="h-[600px] w-full rounded-xl border p-5">
        {result.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </ScrollArea>
    </div>
  );
};

export default IngredientsPage;
