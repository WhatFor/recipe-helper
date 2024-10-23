import { FieldError as T } from "@/types/formResult";
import FieldError from "./field-error";

interface Props {
  errors: T[] | undefined;
}

const FieldErrors = ({ errors }: Props) => {
  return (
    <>
      {errors &&
        errors.map((error) => (
          <FieldError key={error.fieldName} error={error} />
        ))}
    </>
  );
};

export default FieldErrors;
