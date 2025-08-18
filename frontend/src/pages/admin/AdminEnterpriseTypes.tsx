// src/pages/admin/AdminEnterpriseTypes.tsx
import { useEffect, useState, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import EnterpriseTypeEditForm from "@/components/forms/EnterpriseTypeEditForm";
import { enterpriseTypes } from "@/services/enterpriseTypes";
import type { EnterpriseType } from "@/services/enterpriseTypes";

export default function AdminEnterpriseTypes() {
  const [items, setItems] = useState<EnterpriseType[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<EnterpriseType | null>(null);
  const [creatingOpen, setCreatingOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await enterpriseTypes.list();
      setItems(res.items);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Impossible de charger les types d’entreprise");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (it: EnterpriseType) => {
    if (!confirm(`Supprimer le type "${it.sigle}" ?`)) return;
    try {
      await enterpriseTypes.remove(it.id);
      toast.success("Type supprimé");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Suppression impossible");
    }
  };

  const stats = useMemo(() => ({ total: items.length }), [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <Toaster position="top-right" richColors />

      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="ml-80 px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Types d&apos;entreprise
                </h1>
                <p className="text-red-100">
                  Gérez les formes juridiques proposées
                </p>
              </div>
              <Button
                onClick={() => {
                  setCreatingOpen(true);
                  setEditing(null);
                }}
                className="bg-white text-red-800 hover:bg-red-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Type
              </Button>
            </div>
          </div>
        </div>
        {/* Statistiques simples */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <p className="text-sm text-gray-600">Types totaux</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <div className="mb-12 pt-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Catalogue</h2>

          {loading ? (
            <div className="text-gray-500">Chargement…</div>
          ) : items.length === 0 ? (
            <div className="text-gray-500">Aucun type pour le moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((it) => (
                <Card key={it.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-red-50 text-red-900 border border-red-200">
                        <Building2 className="h-3 w-3 mr-1" />
                        {it.sigle}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {it.signification}
                    </div>
                    <p className="text-sm text-gray-600 min-h-[48px]">
                      {it.description || "—"}
                    </p>

                    <div className="flex gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setEditing(it);
                          setCreatingOpen(false);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(it)}
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
        </div>
      </div>

      {/* Modal création/édition */}
      <EnterpriseTypeEditForm
        open={creatingOpen || !!editing}
        item={editing}
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
