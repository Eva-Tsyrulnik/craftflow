import { Suspense } from "react";
import { LoginPage } from "@/components/screens/LoginPage";
import { TG_DEFAULT_AUTH_REDIRECT } from "@/lib/auth-routes";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage
        compact
        defaultRedirect={TG_DEFAULT_AUTH_REDIRECT}
        signupHref="/signup"
      />
    </Suspense>
  );
}
