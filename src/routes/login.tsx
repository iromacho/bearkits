import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso · Bearkits" },
      {
        name: "description",
        content: "Inicia sesión con Google o con un código enviado a tu correo en Bearkits.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, sendEmailVerificationCode, verifyEmailCode } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const google = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success("¡Bienvenido a Bearkits!");
      navigate({ to: "/" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesión con Google.";
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailLoading(true);
    try {
      await sendEmailVerificationCode(email);
      setCodeSent(true);
      toast.success("Te hemos enviado un código de verificación al correo.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo enviar el código.";
      toast.error(message);
    } finally {
      setEmailLoading(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setVerifyLoading(true);
    try {
      await verifyEmailCode(email, code);
      toast.success("Correo verificado. ¡Bienvenido a Bearkits!");
      navigate({ to: "/" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "El código no es válido.";
      toast.error(message);
    } finally {
      setVerifyLoading(false);
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
              Entra con Google o escribe tu correo para recibir un código
            </p>
          </div>

          <Button
            variant="outline"
            className="h-12 w-full gap-3"
            onClick={google}
            disabled={googleLoading || emailLoading || verifyLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="grid h-5 w-5 place-items-center rounded-full border border-border text-xs font-bold text-primary">
                G
              </span>
            )}
            Continuar con Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            o
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4" onSubmit={codeSent ? verifyCode : sendCode}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={emailLoading || verifyLoading}
                required
              />
            </div>

            {codeSent && (
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  disabled={verifyLoading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Revisa tu bandeja de entrada y spam. Puedes pegar aquí el código recibido.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full gap-2"
              disabled={emailLoading || verifyLoading || googleLoading}
            >
              {emailLoading || verifyLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {codeSent ? "Verificar código" : "Enviar código al correo"}
            </Button>

            {codeSent && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs"
                onClick={() => {
                  setCode("");
                  setCodeSent(false);
                }}
                disabled={emailLoading || verifyLoading}
              >
                Cambiar correo o reenviar código
              </Button>
            )}
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Usamos Firebase para Google y Supabase Auth para códigos por correo.
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
