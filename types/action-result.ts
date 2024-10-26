export interface FieldError {
  fieldName: string;
  message: string;
}

export type DataResult<T> = { data?: T } & ActionResult;

export type ActionResult = CommonResult & (SuccessfulResult | FailedResult);

type ToastMessage = {
  title: string;
  description: string;
};

type CommonResult = {
  state: "init" | "dirty";
  timestamp: number;
};

type SuccessfulResult = {
  successful: true;
  message?: ToastMessage;
};

type FailedResult = {
  successful: false;
  errors: FieldError[] | undefined;
  message?: ToastMessage;
};
