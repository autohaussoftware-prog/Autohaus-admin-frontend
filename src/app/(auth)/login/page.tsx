import Image from "next/image";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo-full.jpg"
            alt="Autohaus"
            width={320}
            height={160}
            className="h-44 w-auto object-contain"
            priority
          />
          <p className="mt-1 text-xs uppercase tracking-[0.28em] text-zinc-500">Admin Control</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
