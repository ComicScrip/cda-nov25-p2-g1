import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/coach/dashboard_coach_test",
      permanent: false,
    },
  };
};

export default function DashboardCoachTestLegacyRedirect() {
  return null;
}
