import { FieldError as T } from "@/types/action-result";
import { Alert, AlertDescription, AlertTitle } from "../alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface Props {
  error: T;
}

const FieldError = ({ error }: Props) => {
  return (
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle className="capitalize font-bold">
        {error.fieldName}
      </AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
};

export default FieldError;
