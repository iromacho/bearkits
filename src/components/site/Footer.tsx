import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto max-w-screen-2xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-display text-base tracking-tight">BEARKITS</p>
            <p className="mt-3 text-xs text-muted-foreground max-w-xs">
              Camisetas de fútbol réplica. Calidad oficial, precios honestos.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Tienda</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/catalogo" className="hover:text-primary">Catálogo</Link></li>
              <li><Link to="/catalogo" className="hover:text-primary">Novedades</Link></li>
              <li><Link to="/catalogo" className="hover:text-primary">Niño</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Ayuda</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/contacto" className="hover:text-primary">Contacto</Link></li>
              <li className="text-muted-foreground">Envíos y devoluciones</li>
              <li className="text-muted-foreground">Guía de tallas</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Aviso legal</li>
              <li>Privacidad</li>
              <li>Cookies</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Bearkits</p>
          <p>España</p>
        </div>
      </div>
    </footer>
  );
}
