import { UserRole } from "@/graphql/generated/schema";

export const getDefaultDashboardHref = (role?: UserRole | null) => {
  switch (role) {
    case UserRole.Admin:
      return "/admin";
    case UserRole.Coach:
      return "/coach/dashboard";
    default:
      return "/dashboard_user";
  }
};

export const getSafeReturnUrl = (value: string | string[] | undefined) => {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.startsWith("/") ? value : undefined;
};
