import { AuthForm } from "@/components/auth/form";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <div className="w-full h-full flex items-center justify-center">
      <AuthForm redirectTo={redirect} />
    </div>
  );
}
