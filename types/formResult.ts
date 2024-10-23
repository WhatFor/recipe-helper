export interface FieldError {
  fieldName: string;
  message: string;
}

export interface FormResult {
  errors: FieldError[] | undefined;
}
