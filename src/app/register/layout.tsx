import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (user) {
    redirect("/account");
  }

  return <>{children}</>;
}
