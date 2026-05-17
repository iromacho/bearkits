import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Shield, Loader2, Package, ShoppingBag, Users, ImageOff } from "lucide-react";
import { SIZES } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel Admin · Bearkits" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <Shield className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-3xl">PANEL RESTRINGIDO</h1>
        <p className="mt-2 text-sm text-muted-foreground">Debes iniciar sesión.</p>
        <Button asChild className="mt-4"><Link to="/login">Iniciar sesión</Link></Button>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <Shield className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 font-display text-3xl">ACCESO DENEGADO</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu cuenta ({user.email}) no tiene permisos de administrador.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Para activar admin: ejecuta en la base de datos<br />
          <code className="rounded bg-muted px-1.5 py-0.5">INSERT INTO user_roles(user_id, role) VALUES ('{user.id}', 'admin');</code>
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-wider">PANEL ADMIN</h1>
          <p className="text-sm text-muted-foreground">Gestión completa de la tienda</p>
        </div>
        <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products"><Package className="mr-1.5 h-4 w-4" /> Productos</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingBag className="mr-1.5 h-4 w-4" /> Pedidos</TabsTrigger>
          <TabsTrigger value="customers"><Users className="mr-1.5 h-4 w-4" /> Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6"><ProductsAdmin /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersAdmin /></TabsContent>
        <TabsContent value="customers" className="mt-6"><CustomersAdmin /></TabsContent>
      </Tabs>
    </main>
  );
}

/* ---------------- Products ---------------- */

const empty: Partial<Product> = {
  name: "", team: "", league: "LaLiga", season: "2025/26", kit: "Local",
  price: 0, old_price: null, stock: 10, player: null, year: null,
  image_url: null, images: [], sizes: [...SIZES], badge: null, is_featured: false, is_published: true,
};

function ProductsAdmin() {
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, price: Number(editing.price), stock: Number(editing.stock ?? 0) };
    if (editing.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { id: _omit, ...insert } = payload as any;
      const { error } = await supabase.from("products").insert(insert);
      if (error) return toast.error(error.message);
    }
    toast.success("Guardado");
    setOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado"); load();
  };

  const upload = async (files: FileList) => {
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600" });
      if (error) { toast.error(`${file.name}: ${error.message}`); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    if (uploaded.length === 0) return;
    setEditing((e) => {
      const base = e ?? empty;
      const existing = base.images ?? [];
      const merged = [...existing, ...uploaded];
      return { ...base, images: merged, image_url: base.image_url ?? merged[0] };
    });
    toast.success(`${uploaded.length} imagen(es) subida(s)`);
  };

  const removeImage = (url: string) => {
    setEditing((e) => {
      if (!e) return e;
      const images = (e.images ?? []).filter((u) => u !== url);
      const image_url = e.image_url === url ? images[0] ?? null : e.image_url;
      return { ...e, images, image_url };
    });
  };

  const setCover = (url: string) => setEditing((e) => e ? { ...e, image_url: url } : e);

  return (
    <div>
      <div className="mb-4 flex justify-between gap-3">
        <p className="text-sm text-muted-foreground">{list.length} productos</p>
        <Button onClick={() => { setEditing(empty); setOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" /> Nuevo producto
        </Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Aún no hay productos. Pulsa "Nuevo producto".
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3">Imagen</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Liga</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Estado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="h-12 w-10 overflow-hidden rounded bg-muted">
                      {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center"><ImageOff className="h-4 w-4 text-muted-foreground" /></div>}
                    </div>
                  </td>
                  <td className="p-3"><div className="font-medium">{p.team}</div><div className="text-xs text-muted-foreground">{p.kit} · {p.season}</div></td>
                  <td className="p-3">{p.league}</td>
                  <td className="p-3 font-semibold">{Number(p.price).toFixed(2)}€</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    {p.is_published ? <Badge>Publicado</Badge> : <Badge variant="secondary">Borrador</Badge>}
                    {p.is_featured && <Badge variant="outline" className="ml-1">★</Badge>}
                  </td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">{editing?.id ? "Editar producto" : "Nuevo producto"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label>Nombre</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Equipo</Label><Input value={editing.team ?? ""} onChange={(e) => setEditing({ ...editing, team: e.target.value })} /></div>
              <div className="space-y-2"><Label>Liga</Label><Input value={editing.league ?? ""} onChange={(e) => setEditing({ ...editing, league: e.target.value })} /></div>
              <div className="space-y-2"><Label>Temporada</Label><Input placeholder="2025/26" value={editing.season ?? ""} onChange={(e) => setEditing({ ...editing, season: e.target.value })} /></div>
              <div className="space-y-2"><Label>Kit</Label><Input placeholder="Local / Visitante" value={editing.kit ?? ""} onChange={(e) => setEditing({ ...editing, kit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Precio €</Label><Input type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Precio anterior</Label><Input type="number" step="0.01" value={editing.old_price ?? ""} onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })} /></div>
              <div className="space-y-2"><Label>Stock</Label><Input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Año</Label><Input type="number" value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: e.target.value ? Number(e.target.value) : null })} /></div>
              <div className="space-y-2"><Label>Jugador</Label><Input value={editing.player ?? ""} onChange={(e) => setEditing({ ...editing, player: e.target.value || null })} /></div>
              <div className="space-y-2"><Label>Etiqueta</Label><Input placeholder="Nuevo, Oferta..." value={editing.badge ?? ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value || null })} /></div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Galería de imágenes</Label>
                <div className="flex flex-wrap gap-2">
                  {(editing.images ?? []).map((url) => (
                    <div key={url} className="group relative h-24 w-20 overflow-hidden rounded border border-border bg-muted">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      {editing.image_url === url && (
                        <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">Portada</span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/80 p-1 opacity-0 transition group-hover:opacity-100">
                        <button type="button" onClick={() => setCover(url)} className="text-[10px] font-semibold hover:text-primary" title="Marcar como portada">★</button>
                        <button type="button" onClick={() => removeImage(url)} className="text-[10px] font-semibold text-destructive" title="Eliminar"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                  {(!editing.images || editing.images.length === 0) && (
                    <div className="grid h-24 w-20 place-items-center rounded border border-dashed border-border bg-muted">
                      <ImageOff className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
                  <Upload className="h-4 w-4" /> Subir imágenes (puedes seleccionar varias)
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && e.target.files.length > 0 && upload(e.target.files)} />
                </label>
                <p className="text-xs text-muted-foreground">Pulsa ★ sobre una imagen para marcarla como portada.</p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Tallas disponibles</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => {
                    const active = (editing.sizes ?? []).includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const cur = editing.sizes ?? [];
                          const next = active ? cur.filter((x) => x !== s) : [...cur, s];
                          setEditing({ ...editing, sizes: next });
                        }}
                        className={`h-9 min-w-12 rounded border px-3 text-sm font-semibold transition ${
                          active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Marca solo las tallas que tengas en stock para este producto.</p>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <Label>Publicado</Label>
                <Switch checked={!!editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <Label>Destacado</Label>
                <Switch checked={!!editing.is_featured} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Orders ---------------- */

function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setOrders(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Actualizado"); load();
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (orders.length === 0) return <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">Sin pedidos todavía.</div>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-md border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                <Badge>{o.status}</Badge>
              </div>
              <p className="mt-1 font-medium">{o.customer_name} · {o.customer_email}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl">{Number(o.total).toFixed(2)}€</div>
              <select className="mt-1 rounded border border-border bg-background p-1 text-xs" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-muted-foreground">Ver detalles ({Array.isArray(o.items) ? o.items.length : 0} items)</summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify({ items: o.items, shipping: o.shipping_address }, null, 2)}</pre>
          </details>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Customers ---------------- */

function CustomersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) toast.error(error.message); else setUsers(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (users.length === 0) return <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">Sin clientes registrados.</div>;

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left"><tr><th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">Registro</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-3 font-medium">{u.display_name ?? "—"}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
