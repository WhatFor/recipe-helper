"use client";

import { FormResult } from "@/types/formResult";
import { create } from "./actions";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/ui/back-button";
import Header from "@/components/ui/header";
import FieldErrors from "@/components/ui/form/field-errors";
import Form from "@/components/ui/form";

const NewIngredientPage = () => {
  const [state, formAction, pending] = useActionState(create, {
    errors: undefined,
  } as FormResult);

  return (
    <>
      <Header>New Ingredient</Header>
      <Form action={formAction}>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="ingredientName">Name</Label>
          <Input id="ingredientName" name="ingredientName" type="text" />
        </div>
        <FieldErrors errors={state.errors} />
        <div className="flex flex-col gap-y-3">
          <Button type="submit" disabled={pending}>
            Save
          </Button>
          <BackButton />
        </div>
      </Form>
    </>
  );
};

export default NewIngredientPage;
