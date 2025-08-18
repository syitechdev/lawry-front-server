import * as React from "react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { Toaster, toast } from "sonner";
import { categories, type Category } from "@/services/categories";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Trash2, Tag } from "lucide-react";

import CategoryEditForm from "@/components/forms/CategoryEditForm";

export default function AdminCategories() {
  const [items, setItems] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [creatingOpen, setCreatingOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);

  const [q, setQ] = React.useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await categories.list({ "order[name]": "asc" });
      setItems(res.items);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Impossible de charger les catégories");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(s) ||
        (c.slug ?? "").toLowerCase().includes(s) ||
        (c.description ?? "").toLowerCase().includes(s)
    );
  }, [q, items]);

  const onDelete = async (c: Category) => {
    if (!confirm(`Supprimer la catégorie "${c.name}" ?`)) return;
    try {
      await categories.remove(c.id);
      toast.success("Catégorie supprimée");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Suppression impossible");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <Toaster position="top-right" richColors />
      <BackofficeSidebar userRole="admin" />

      <div className="ml-80 px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Catégories</h1>
                <p className="text-red-100">
                  Gérez les catégories (blog, services, etc.)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Rechercher une catégorie…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="bg-white/90 text-gray-900 placeholder:text-gray-500 w-64"
                />
                <Button
                  onClick={() => {
                    setCreatingOpen(true);
                    setEditing(null);
                  }}
                  className="bg-white text-red-800 hover:bg-red-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Catégorie
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-gray-500">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500">Aucune catégorie pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filtered.map((cat) => (
              <Card key={cat.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-50 text-red-900 border">
                        <Tag className="h-3 w-3 mr-1" />
                        {cat.name}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[55%]">
                      {cat.slug ? (
                        `/${cat.slug}`
                      ) : (
                        <span className="italic text-gray-400">slug auto</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 min-h-[48px]">
                    {cat.description || (
                      <span className="text-gray-400">—</span>
                    )}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditing(cat);
                        setCreatingOpen(false);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(cat)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stat */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {items.length}
              </div>
              <p className="text-sm text-gray-600">Catégories au total</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal création/édition */}
      <CategoryEditForm
        open={creatingOpen || !!editing}
        category={editing}
        onClose={() => {
          setCreatingOpen(false);
          setEditing(null);
        }}
        onSubmitted={async () => {
          await load();
        }}
      />
    </div>
  );
}
