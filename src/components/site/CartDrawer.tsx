import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { Minus, Plus, Trash2, ShieldCheck, ImageOff } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CartDrawer() {
  const { items, open, setOpen, remove, setQty, total, clear } = useCart();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Tu carrito</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <p className="font-display text-xl text-foreground">Carrito vacío</p>
                <p className="mt-1">Añade tu camiseta favorita y vístete de leyenda.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((it) => (
                <li key={it.product.id + it.size} className="flex gap-3 rounded-md border border-border p-3">
                  <div className="h-20 w-16 overflow-hidden rounded bg-muted">
                    {it.product.image_url ? (
                      <img src={it.product.image_url} alt={it.product.team} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-muted-foreground"><ImageOff className="h-5 w-5" /></div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="font-medium leading-tight">{it.product.team}</p>
                    <p className="text-xs text-muted-foreground">{it.product.kit} · {it.product.season} · Talla {it.size}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(it.product.id, it.size, it.qty - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-6 text-center text-sm">{it.qty}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(it.product.id, it.size, it.qty + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg">{(it.product.price * it.qty).toFixed(2)}€</span>
                        <button onClick={() => remove(it.product.id, it.size)} className="text-muted-foreground hover:text-destructive" aria-label="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-2xl">{total.toFixed(2)}€</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Impuestos incluidos. Envío calculado en el checkout.</p>
            <Button asChild className="mt-4 h-12 w-full text-base" onClick={() => setOpen(false)}>
              <Link to="/checkout">Pagar de forma segura</Link>
            </Button>
            <button onClick={clear} className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground">Vaciar carrito</button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Pago cifrado · Visa · Mastercard · PayPal
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
