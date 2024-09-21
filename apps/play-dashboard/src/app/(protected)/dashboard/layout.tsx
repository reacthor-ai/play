import {guardDashboardInternals} from "@/utils/guard";

export default async function DashboardLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  await guardDashboardInternals()

  return (
    <>
      {children}
    </>
  );
}
