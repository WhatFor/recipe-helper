import { RedirectToSignIn, SignedOut } from "@clerk/nextjs";

interface Props {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      {children}
    </>
  );
};

export default RequireAuth;
