export interface FieldError {
  fieldName: string;
  message: string;
}

export type DataResult<T> = { data: T } & ActionResult;

export type ActionResult = CommonResult & (SuccessfulResult | FailedResult);

type CommonResult = {
  state: "init" | "dirty";
  timestamp: number;
};

type SuccessfulResult = {
  successful: true;
  message?: {
    title: string;
    description: string;
  };
};

type FailedResult = {
  successful: false;
  errors: FieldError[] | undefined;
};
