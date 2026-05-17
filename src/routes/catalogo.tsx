import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";

export const Route = createFileRoute("/catalogo")({
  component: Catalogo,
  head: () => ({
    meta: [
      { title: "Tienda — Bearkits" },
      { name: "description", content: "Catálogo de camisetas réplica autorizadas." },
    ],
  }),
});

function Catalogo() {
  const [q, setQ] = useState("");
  const [league, setLeague] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(150);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const leagues = useMemo(() => Array.from(new Set(products.map((p) => p.league))).sort(), [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (league !== "all" && p.league !== league) return false;
      if (Number(p.price) > maxPrice) return false;
      if (q) {
        const t = `${p.team} ${p.player ?? ""} ${p.season} ${p.name}`.toLowerCase();
        if (!t.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [products, q, league, maxPrice]);

  return (
    <main className="mx-auto max-w-screen-2xl px-6 py-10 md:py-12">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Tienda</h1>
          <p className="mt-1 text-xs text-muted-foreground">{filtered.length} artículos</p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Buscar</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Equipo o jugador" className="h-9 pl-9" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Liga</p>
            <div className="mt-2 space-y-0.5">
              <FilterBtn active={league === "all"} onClick={() => setLeague("all")}>Todas</FilterBtn>
              {leagues.map((l) => (
                <FilterBtn key={l} active={league === l} onClick={() => setLeague(l)}>{l}</FilterBtn>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Precio máx.</p>
              <span className="text-xs">{maxPrice} EUR</span>
            </div>
            <Slider value={[maxPrice]} min={20} max={200} step={5} onValueChange={(v) => setMaxPrice(v[0])} className="mt-3" />
          </div>
        </aside>

        <section>
          {isLoading ? (
            <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-border px-6 py-20 text-center text-sm text-muted-foreground">
              No hay artículos que coincidan.
            </div>
          ) : (
            <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full px-2 py-1 text-left text-sm transition ${
        active ? "text-primary" : "text-foreground hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
