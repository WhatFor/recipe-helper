interface Props extends React.HTMLProps<HTMLFormElement> {
  children: React.ReactNode;
}

const Form = ({ children, ...props }: Props) => {
  return (
    <form className="flex flex-col gap-y-8" {...props}>
      {children}
    </form>
  );
};

export default Form;
