import React from "react";

const Header = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-2xl">{children}</h1>;
};

export default Header;
