import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contacto")({
  component: Contacto,
  head: () => ({
    meta: [
      { title: "Contacto y soporte — Bearkits" },
      { name: "description", content: "Contacta con el equipo de Bearkits. Soporte rápido por email, teléfono o WhatsApp." },
    ],
  }),
});

function Contacto() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <header className="max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-primary">Contacto</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Estamos para ayudarte</h1>
        <p className="mt-3 text-muted-foreground">¿Dudas con tu pedido, tallas o un equipo concreto? Te respondemos en menos de 24h.</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Mensaje enviado", { description: "Te responderemos en menos de 24h." });
            (e.target as HTMLFormElement).reset();
          }}
          className="rounded-xl border border-border bg-card p-6 md:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" required maxLength={80} placeholder="Tu nombre" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required maxLength={120} placeholder="tu@email.com" />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" required maxLength={120} placeholder="Sobre qué nos escribes" />
          </div>
          <div className="mt-4">
            <Label htmlFor="msg">Mensaje</Label>
            <Textarea id="msg" required maxLength={1000} rows={6} placeholder="Cuéntanos en qué podemos ayudarte" />
          </div>
          <Button type="submit" size="lg" className="mt-6 h-12 px-7">Enviar mensaje</Button>
        </form>

        <aside className="space-y-4">
          <Info icon={<Mail className="h-4 w-4" />} title="Email" value="hola@bearkits.com" />
          <Info icon={<Phone className="h-4 w-4" />} title="Teléfono" value="+34 900 000 000" />
          <Info icon={<MessageCircle className="h-4 w-4" />} title="WhatsApp" value="Lun–Sáb, 10:00–20:00" />
          <Info icon={<MapPin className="h-4 w-4" />} title="Sede" value="Madrid, España" />
        </aside>
      </div>
    </main>
  );
}

function Info({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
