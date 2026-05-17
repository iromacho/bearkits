import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso · Bearkits" },
      {
        name: "description",
        content: "Inicia sesión con Google en Bearkits para gestionar tus pedidos.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const google = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("¡Bienvenido a Bearkits!");
      navigate({ to: "/" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesión con Google.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] bg-hero py-16">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-lg border border-border bg-card p-8 shadow-elegant">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-sm bg-primary text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="mt-3 font-display text-3xl tracking-wider">ACCESO BEARKITS</h1>
            <p className="text-sm text-muted-foreground">
              Entra de forma segura con tu cuenta de Google
            </p>
          </div>

          <Button
            variant="outline"
            className="h-12 w-full gap-3"
            onClick={google}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="grid h-5 w-5 place-items-center rounded-full border border-border text-xs font-bold text-primary">
                G
              </span>
            )}
            Continuar con Google
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Usamos Firebase Authentication para proteger el inicio de sesión.
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Volver a la tienda
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
