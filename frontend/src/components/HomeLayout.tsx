import Head from "next/head";
import type { ReactNode } from "react";
import { CoachSidebarPanel, CoachSidebarProvider } from "@/contexts/CoachSidebarContext";
import { UserRole, useProfileQuery } from "@/graphql/generated/schema";
import Footer from "./Footer";
import Header from "./Header";
import UserFooterSlim from "./UserFooterSlim";

type FooterVariant = "default" | "userSlim";

interface HomeLayoutProps {
  children: ReactNode;
  pageTitle: string;
  footerVariant?: FooterVariant;
}

export default function HomeLayout({
  children,
  pageTitle,
  footerVariant = "default",
}: HomeLayoutProps) {
  const { data } = useProfileQuery({ fetchPolicy: "cache-first" });
  const isCoachOrAdmin =
    data?.me?.role === UserRole.Coach || data?.me?.role === UserRole.Admin;

  return (
    <CoachSidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Head>
          <title>{`MyDietChef - ${pageTitle}`}</title>
          <meta
            name="description"
            content="Plateforme conçue pour vous aider à atteindre vos objectifs diététiques"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/Logo_MDC.ico" />
        </Head>
        <Header />
        {isCoachOrAdmin && <CoachSidebarPanel />}
        <main
          className={`flex-1 flex flex-col min-h-0 overflow-y-auto ${isCoachOrAdmin ? "md:pl-64" : ""}`}
        >
          {children}
        </main>
        {footerVariant === "userSlim" ? <UserFooterSlim /> : <Footer />}
      </div>
    </CoachSidebarProvider>
  );
}
