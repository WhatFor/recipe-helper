import { FieldError as T } from "@/types/action-result";
import FieldError from "./field-error";

interface Props {
  errors: T[] | undefined;
}

const FieldErrors = ({ errors }: Props) => {
  if (!errors) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3">
      {errors &&
        errors.map((error) => (
          <FieldError key={error.fieldName} error={error} />
        ))}
    </div>
  );
};

export default FieldErrors;
