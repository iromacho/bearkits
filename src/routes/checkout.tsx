import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldCheck, Loader2, ImageOff } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · Bearkits" },
      { name: "description", content: "Finaliza tu pedido de forma segura en Bearkits." },
    ],
  }),
  component: CheckoutPage,
});

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: user?.email ?? "", phone: "",
    address: "", city: "", postal: "", country: "España",
    notes: "",
  });

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Tu carrito está vacío");
    setLoading(true);
    const payload = {
      user_id: user?.id && uuidPattern.test(user.id) ? user.id : null,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone || null,
      shipping_address: {
        address: form.address, city: form.city, postal: form.postal, country: form.country,
      },
      items: items.map((it) => ({
        product_id: it.product.id, name: it.product.name, team: it.product.team,
        size: it.size, qty: it.qty, price: it.product.price,
      })),
      total,
      notes: form.notes || null,
    };
    const { error } = await supabase.from("orders").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("¡Pedido recibido! Te contactaremos por email.");
    clear();
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-[80vh] bg-background py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1fr_420px]">
        <section>
          <h1 className="font-display text-4xl tracking-wider">CHECKOUT</h1>
          <p className="text-sm text-muted-foreground">Pago cifrado · envío 24/72h</p>

          <form onSubmit={submit} className="mt-6 space-y-6">
            <div className="rounded-md border border-border bg-card p-5">
              <h2 className="font-display text-xl">Datos de contacto</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Nombre completo</Label><Input required value={form.name} onChange={onChange("name")} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" required value={form.email} onChange={onChange("email")} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Teléfono</Label><Input value={form.phone} onChange={onChange("phone")} /></div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-5">
              <h2 className="font-display text-xl">Dirección de envío</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label>Dirección</Label><Input required value={form.address} onChange={onChange("address")} /></div>
                <div className="space-y-2"><Label>Ciudad</Label><Input required value={form.city} onChange={onChange("city")} /></div>
                <div className="space-y-2"><Label>Código postal</Label><Input required value={form.postal} onChange={onChange("postal")} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>País</Label><Input required value={form.country} onChange={onChange("country")} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Notas (opcional)</Label><Textarea value={form.notes} onChange={onChange("notes")} /></div>
              </div>
            </div>

            <Button type="submit" className="h-12 w-full text-base" disabled={loading || items.length === 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pagar ${total.toFixed(2)}€`}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Conexión segura SSL · Visa · Mastercard · PayPal
            </p>
          </form>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-md border border-border bg-card p-5">
            <h3 className="font-display text-xl">Tu pedido</h3>
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Tu carrito está vacío. <Link to="/catalogo" className="text-primary">Ir a la tienda</Link>
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-3">
                  {items.map((it) => (
                    <li key={it.product.id + it.size} className="flex gap-3">
                      <div className="h-14 w-12 overflow-hidden rounded bg-muted">
                        {it.product.image_url ? <img src={it.product.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-muted-foreground"><ImageOff className="h-4 w-4" /></div>}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{it.product.team}</p>
                        <p className="text-xs text-muted-foreground">{it.product.kit} · T-{it.size} · x{it.qty}</p>
                      </div>
                      <span className="text-sm font-semibold">{(it.product.price * it.qty).toFixed(2)}€</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{total.toFixed(2)}€</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span>Gratis</span></div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 font-display text-2xl"><span>Total</span><span>{total.toFixed(2)}€</span></div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
