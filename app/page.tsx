import LoginForm from "@/components/auth/login-form";

export default function Home() {
  return (
   <main className="flex h-full flex-col items-center justify-center bg-color_10">
      <div className="space-y-6">
        <div>
          <LoginForm/>
        </div>
      </div>
   </main>
  );
}
