import { drizzle } from "drizzle-orm/vercel-postgres";
import { ingredientsTable } from "@/db/schema";

const IngredientsPage = async () => {
  const db = drizzle();
  const result = await db.select().from(ingredientsTable);

  return (
    <div>
      <h1>Ingredients</h1>
      <a href="/ingredients/new">New Ingredient</a>
      <ul>
        {result.map((ingredient) => (
          <li key={ingredient.id}>{ingredient.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientsPage;
