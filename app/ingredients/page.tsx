import { drizzle } from "drizzle-orm/vercel-postgres";
import { ingredientsTable } from "@/db/schema";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const IngredientsPage = async () => {
  const db = drizzle();
  const result = await db.select().from(ingredientsTable);

  return (
    <div className="flex flex-col gap-y-8">
      <Header>Ingredients</Header>
      <Button asChild>
        <Link href="/ingredients/new">New Ingredient</Link>
      </Button>
      <Button asChild>
        <Link href="/">Home</Link>
      </Button>
      <ul>
        {result.map((ingredient) => (
          <li key={ingredient.id}>{ingredient.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientsPage;
