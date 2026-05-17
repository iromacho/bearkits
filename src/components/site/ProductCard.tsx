import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/types";
import { ImageOff } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const gallery = (product.images?.length ? product.images : product.image_url ? [product.image_url] : []).filter(Boolean);
  const cover = gallery[0];
  const hover = gallery[1] ?? cover;

  return (
    <Link to="/producto/$id" params={{ id: product.id }} className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {cover ? (
          <>
            <img
              src={cover}
              alt={`${product.team} ${product.kit} ${product.season}`}
              loading="lazy"
              className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
            <img
              src={hover}
              alt=""
              loading="lazy"
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          </>
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {product.old_price && product.old_price > product.price && (
          <span className="absolute left-3 top-3 bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
            Rebajado
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-0.5">
        <p className="text-sm font-normal text-foreground">{product.team}</p>
        <p className="text-xs text-muted-foreground">{product.kit} · {product.season}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm">{Number(product.price).toFixed(2)} EUR</span>
          {product.old_price && product.old_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">{Number(product.old_price).toFixed(2)} EUR</span>
          )}
        </div>
      </div>
    </Link>
  );
}
