import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

interface Props {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
};

export default RequireAuth;
