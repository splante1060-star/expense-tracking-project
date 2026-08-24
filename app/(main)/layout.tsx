import type { ReactNode } from "react";

type MainLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: MainLayoutProps) {
  return <div className="container mx-auto my-auto">{children}</div>;
}
