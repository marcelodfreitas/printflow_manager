import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main
      className={`
        min-h-screen
        px-4
        py-6
        md:px-6
        lg:px-8
        ${className}
      `}
    >
      {children}
    </main>
  );
}