import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, User, Shield, X, Search } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const { count, setOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6">
        <Link to="/" className="font-display text-lg tracking-tight">
          BEARKITS
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/" className="hover:text-primary" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>Inicio</Link>
          <Link to="/catalogo" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Tienda</Link>
          <Link to="/contacto" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Ayuda</Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Buscar" className="hidden md:inline-flex"><Search className="h-4 w-4" /></Button>
          {isAdmin && (
            <Button asChild variant="ghost" size="icon" aria-label="Panel admin" className="hidden md:inline-flex">
              <Link to="/admin"><Shield className="h-4 w-4 text-primary" /></Link>
            </Button>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="hidden md:inline-flex text-xs">
              Salir
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" aria-label="Cuenta" className="hidden md:inline-flex">
              <Link to="/login"><User className="h-4 w-4" /></Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative" aria-label="Carrito" onClick={() => setOpen(true)}>
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menú" onClick={() => setMobile(true)}><Menu className="h-4 w-4" /></Button>
        </div>
      </div>

      {mobile && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-border px-6">
            <span className="font-display text-lg">Menú</span>
            <Button variant="ghost" size="icon" onClick={() => setMobile(false)} aria-label="Cerrar"><X className="h-4 w-4" /></Button>
          </div>
          <nav className="flex flex-col p-6 text-base">
            <Link to="/" onClick={() => setMobile(false)} className="border-b border-border py-4">Inicio</Link>
            <Link to="/catalogo" onClick={() => setMobile(false)} className="border-b border-border py-4">Tienda</Link>
            <Link to="/contacto" onClick={() => setMobile(false)} className="border-b border-border py-4">Ayuda</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobile(false)} className="border-b border-border py-4 text-primary">Panel admin</Link>
            )}
            {user ? (
              <button onClick={() => { signOut(); setMobile(false); }} className="border-b border-border py-4 text-left">Cerrar sesión</button>
            ) : (
              <Link to="/login" onClick={() => setMobile(false)} className="border-b border-border py-4">Iniciar sesión</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
