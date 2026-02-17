import Head from "next/head";
import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

interface HomeLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function HomeLayout({ children, pageTitle }: HomeLayoutProps) {
  return (
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
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">{children}</main>
      <Footer />
    </div>
  );
}
