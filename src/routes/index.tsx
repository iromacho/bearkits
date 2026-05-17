import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import hero from "@/assets/hero-stadium.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Bearkits — Camisetas de fútbol" },
      { name: "description", content: "Camisetas de fútbol réplica. Adulto y niño. Envío 24/72h." },
    ],
  }),
});

function useFeatured() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}

function Index() {
  const { data: featured = [], isLoading } = useFeatured();

  return (
    <main>
      {/* HERO */}
      <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex h-full items-end">
          <div className="mx-auto w-full max-w-screen-2xl px-6 pb-16">
            <h1 className="max-w-xl font-display text-4xl text-white md:text-6xl">
              Temporada 25/26
            </h1>
            <p className="mt-3 max-w-md text-sm text-white/90 md:text-base">
              Nueva colección. Camisetas réplica de los mejores equipos.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/catalogo" className="bg-white px-6 py-3 text-sm text-foreground hover:bg-white/90">
                Comprar
              </Link>
              <Link to="/catalogo" className="border border-white px-6 py-3 text-sm text-white hover:bg-white/10">
                Niño
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="mx-auto max-w-screen-2xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl md:text-3xl">Destacados</h2>
          <Link to="/catalogo" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">
            Ver todo
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse bg-muted" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-20 text-center text-sm text-muted-foreground">
            Catálogo en preparación
          </div>
        ) : (
          <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA NIÑO */}
      <section className="mx-auto max-w-screen-2xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/catalogo" className="group relative block aspect-[16/10] overflow-hidden bg-muted">
            <img src={hero} alt="Adulto" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="font-display text-2xl">Adulto</p>
              <p className="mt-1 text-xs uppercase tracking-wider">Ver colección →</p>
            </div>
          </Link>
          <Link to="/catalogo" className="group relative block aspect-[16/10] overflow-hidden bg-muted">
            <img src={hero} alt="Niño" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="font-display text-2xl">Niño</p>
              <p className="mt-1 text-xs uppercase tracking-wider">Ver colección →</p>
            </div>
          </Link>
        </div>
      </section>

      {/* INFO BAR */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-6 px-6 py-10 text-center text-xs uppercase tracking-wider text-muted-foreground md:grid-cols-3">
          <div>Envío 24/72h</div>
          <div>Devoluciones gratuitas</div>
          <div>Pago seguro</div>
        </div>
      </section>
    </main>
  );
}
