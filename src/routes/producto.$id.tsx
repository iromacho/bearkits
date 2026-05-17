import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { SIZES, ADULT_SIZES, KID_SIZES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { ImageOff, ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/producto/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  const [idx, setIdx] = useState(0);
  const [size, setSize] = useState<string>("");

  useEffect(() => {
    const avail = product?.sizes?.length ? product.sizes : (SIZES as readonly string[]);
    if (avail.length && !avail.includes(size)) setSize(avail[0]);
  }, [product, size]);

  if (isLoading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (error || !product) {
    return (
      <main className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-display text-2xl">Producto no encontrado</h1>
        <Button asChild className="mt-4"><Link to="/catalogo">Volver al catálogo</Link></Button>
      </main>
    );
  }

  const gallery = (product.images?.length ? product.images : product.image_url ? [product.image_url] : []).filter(Boolean);
  const current = gallery[idx];
  const sizes = product.sizes?.length ? product.sizes : (SIZES as readonly string[]);
  const adultSizes = sizes.filter((s) => (ADULT_SIZES as readonly string[]).includes(s));
  const kidSizes = sizes.filter((s) => (KID_SIZES as readonly string[]).includes(s));
  const discount = product.old_price && product.old_price > product.price
    ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  return (
    <main className="mx-auto max-w-screen-2xl px-6 py-6 md:py-10">
      <button onClick={() => navigate({ to: "/catalogo" })} className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver
      </button>

      <div className="grid gap-10 md:grid-cols-[1fr_380px]">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {current ? (
              <img src={current} alt={`${product.team} ${product.kit}`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-muted-foreground"><ImageOff className="h-10 w-10" /></div>
            )}
            {gallery.length > 1 && (
              <>
                <button onClick={() => setIdx((i) => (i - 1 + gallery.length) % gallery.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90 p-2 hover:bg-background"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setIdx((i) => (i + 1) % gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90 p-2 hover:bg-background"><ChevronRight className="h-4 w-4" /></button>
              </>
            )}
            {discount > 0 && (
              <span className="absolute left-3 top-3 bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">-{discount}%</span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {gallery.map((src, i) => (
                <button key={src + i} onClick={() => setIdx(i)} className={`aspect-[3/4] overflow-hidden border transition ${i === idx ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:sticky md:top-20 md:self-start">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{product.league} · {product.season}</p>
          <h1 className="mt-2 font-display text-2xl md:text-3xl">{product.team}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.kit}{product.player ? ` · ${product.player}` : ""}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-lg">{Number(product.price).toFixed(2)} EUR</span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">{Number(product.old_price).toFixed(2)} EUR</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Impuestos incluidos.</p>

          {adultSizes.length > 0 && (
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Talla adulto</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {adultSizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`h-11 min-w-11 border px-3 text-sm transition ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/60"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {kidSizes.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Talla niño</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {kidSizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`h-11 min-w-11 border px-3 text-sm transition ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/60"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <Button
            size="lg"
            disabled={product.stock <= 0 || !size}
            onClick={() => add({ id: product.id, name: product.name, team: product.team, season: product.season, kit: product.kit, price: Number(product.price), image_url: current ?? product.image_url }, size)}
            className="mt-8 w-full"
          >
            {product.stock <= 0 ? "Agotado" : "Añadir"}
          </Button>

          <div className="mt-8 space-y-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>Envío 24/72h en España.</p>
            <p>Devoluciones gratuitas en 30 días.</p>
            <p>{product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
