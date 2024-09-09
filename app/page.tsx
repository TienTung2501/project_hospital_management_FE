import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
   <main className="flex h-full flex-col items-center justify-center bg-color_10">
      <div className="space-y-6">
        <h1 className="text-6xl font-semibold text-color_60 drop-shadow-sm">
           Auth
        </h1>
        <p className="text-color_60 text-paragraph">
          This is simple auth
        </p>
        <div>
          <LoginButton>
            <Button variant="secondary" size="lg" className="w-full">
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
   </main>
  );
}
