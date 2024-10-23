import { FieldError as T } from "@/types/formResult";

interface Props {
  error: T;
}

const FieldError = ({ error }: Props) => {
  return (
    <div
      className="text-red-600 flex gap-x-2 text-sm"
      key={error.fieldName}
      aria-live="polite"
    >
      <span className="uppercase">{error.fieldName}:</span>
      <span>{error.message}</span>
    </div>
  );
};

export default FieldError;
