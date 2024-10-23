import { useRouter } from "next/navigation";
import { Button } from "./button";
import { buttonVariants } from "@/components/ui/button";

const BackButton = () => {
  const router = useRouter();

  const goBack = () => router.back();

  return (
    <Button
      className={buttonVariants({ variant: "secondary" })}
      onClick={goBack}
      type="button"
    >
      Back
    </Button>
  );
};

export default BackButton;
