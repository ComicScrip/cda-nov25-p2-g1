import { type ReactNode } from "react";
import HomeLayout from "../HomeLayout";

interface CoachLayoutProps {
  children: ReactNode;
  pageTitle: string;
  footerVariant?: "default" | "userSlim";
}

export default function CoachLayout({
  children,
  pageTitle,
  footerVariant = "default",
}: CoachLayoutProps) {
  return (
    <HomeLayout pageTitle={pageTitle} footerVariant={footerVariant}>
      <div className="flex flex-1 min-h-0 flex-col bg-light-bg">
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pt-2">
          {children}
        </main>
      </div>
    </HomeLayout>
  );
}
