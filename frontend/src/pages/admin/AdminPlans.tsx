import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Crown, Check } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";

import { plans as plansApi } from "@/services/plans";
import type { Plan } from "@/services/plans";
import PlanEditForm from "@/components/forms/PlanEditForm";
import { http } from "@/lib/http";

/* ---------- Helpers API Platform ---------- */
function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json.member)) return json.member;
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"];
  if (Array.isArray(json.data)) return json.data;
  return Array.isArray(json) ? json : [];
}
function apiError(err: any, fallback: string) {
  const d = err?.response?.data;
  return (
    d?.detail ||
    d?.description ||
    d?.message ||
    d?.violations?.[0]?.message ||
    fallback
  );
}

/* ---------- Types locaux Tarifs ---------- */
type TarifUniqueRow = {
  id: number | string; // string => brouillon "new-...", number => item persistant
  nom: string;
  prix: number;
  description: string;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
};

const TARIFS_BASE = "/tarif_uniques"; // ✅ correspond à route:list

const AdminPlans = () => {
  /* ---------------- Plans (inchangé) ---------------- */
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [creatingOpen, setCreatingOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await plansApi.list();
      setItems(res.items);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Impossible de charger les plans");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const getPlanBadgeColor = (couleur: string) => {
    const key = (couleur || "").toLowerCase();
    const map: Record<string, string> = {
      bleu: "bg-blue-100 text-blue-800",
      vert: "bg-green-100 text-green-800",
      rouge: "bg-red-100 text-red-800",
      jaune: "bg-yellow-100 text-yellow-800",
      violet: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
      gris: "bg-gray-100 text-gray-800",
      noir: "bg-gray-800 text-white",
      blanc: "bg-white text-gray-800 border",
      cyan: "bg-cyan-100 text-cyan-800",
      rose: "bg-pink-100 text-pink-800",
    };
    return map[key] || "bg-gray-100 text-gray-800";
  };

  const onDelete = async (p: Plan) => {
    if (!confirm(`Supprimer le plan "${p.name}" ?`)) return;
    try {
      await plansApi.remove(p.id);
      toast.success("Plan supprimé");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Suppression impossible");
    }
  };

  const onToggleActive = async (p: Plan) => {
    const next = !p.isActive;
    setItems((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, isActive: next } : x))
    );
    try {
      await plansApi.setActive(p.id, next);
      toast.success(next ? "Plan activé" : "Plan désactivé");
    } catch (e: any) {
      setItems((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, isActive: !next } : x))
      );
      console.error(e);
      toast.error(e?.message || "Échec de la mise à jour");
    }
  };

  const onTogglePopular = async (p: Plan) => {
    const next = !p.isPopular;
    setItems((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, isPopular: next } : x))
    );
    try {
      await plansApi.setPopular(p.id, next);
      toast.success(next ? "Marqué populaire" : "Retiré des populaires");
    } catch (e: any) {
      setItems((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, isPopular: !next } : x))
      );
      console.error(e);
      toast.error(e?.message || "Échec de la mise à jour");
    }
  };

  /* --------------- Tarifs Uniques (branché API) --------------- */
  const [tarifsUniques, setTarifsUniques] = useState<TarifUniqueRow[]>([]);
  const [loadingTarifs, setLoadingTarifs] = useState(true);
  const [editingTarif, setEditingTarif] = useState<string | null>(null);

  const loadTarifs = async () => {
    setLoadingTarifs(true);
    try {
      const r = await http.get(TARIFS_BASE, {
        params: { "order[created_at]": "desc" },
      });
      const rows = extractMember(r.data).map((t: any) => ({
        id: t.id,
        nom: t.nom,
        prix: Number(t.prix ?? 0),
        description: t.description ?? "",
        actif: !!(t.actif ?? false),
        created_at: t.created_at ?? t.createdAt,
        updated_at: t.updated_at ?? t.updatedAt,
      })) as TarifUniqueRow[];
      setTarifsUniques(rows);
    } catch (e: any) {
      console.error(e);
      toast.error(apiError(e, "Impossible de charger les tarifs"));
    } finally {
      setLoadingTarifs(false);
    }
  };
  useEffect(() => {
    loadTarifs();
  }, []);

  // ----- mêmes handlers que ta vue, mais reliés API -----
  const updateTarif = (
    id: string,
    field: "nom" | "prix" | "description",
    value: any
  ) => {
    setTarifsUniques((prev) =>
      prev.map((t) => (String(t.id) === id ? { ...t, [field]: value } : t))
    );
  };

  const toggleTarifStatus = async (id: string) => {
    const t = tarifsUniques.find((x) => String(x.id) === id);
    if (!t) return;
    const next = !t.actif;

    // optimistic
    setTarifsUniques((prev) =>
      prev.map((x) => (String(x.id) === id ? { ...x, actif: next } : x))
    );

    try {
      // Si brouillon local, pas d’API
      if (typeof t.id === "string") {
        toast.success("Statut du tarif modifié (brouillon)");
        return;
      }
      // Toggle back-end
      await http.patch(
        `/admin/tarifs/${t.id}/active`,
        { actif: next },
        { headers: { Accept: "application/json" } }
      );
      toast.success(next ? "Tarif activé" : "Tarif désactivé");
    } catch (e: any) {
      // revert
      setTarifsUniques((prev) =>
        prev.map((x) => (String(x.id) === id ? { ...x, actif: !next } : x))
      );
      console.error(e);
      toast.error(apiError(e, "Échec de la mise à jour"));
    }
  };

  const deleteTarif = async (id: string) => {
    const t = tarifsUniques.find((x) => String(x.id) === id);
    if (!t) return;
    if (!confirm("Supprimer ce tarif ?")) return;

    try {
      if (typeof t.id === "number") {
        await http.delete(`${TARIFS_BASE}/${t.id}`);
      }
      setTarifsUniques((prev) => prev.filter((x) => String(x.id) !== id));
      toast.success("Tarif supprimé");
    } catch (e: any) {
      console.error(e);
      toast.error(apiError(e, "Suppression impossible"));
    }
  };

  const addNewTarif = () => {
    const id = `tarif${Date.now()}`;
    setTarifsUniques((prev) => [
      ...prev,
      {
        id,
        nom: "Nouveau service",
        prix: 0,
        description: "Description du service",
        actif: true,
      },
    ]);
    setEditingTarif(id);
  };

  const saveTarif = async (tarifId: string) => {
    const t = tarifsUniques.find((x) => String(x.id) === tarifId);
    if (!t) return;
    if (!t.nom.trim() || Number(t.prix) <= 0) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const payload = {
        nom: t.nom,
        prix: Number(t.prix),
        description: t.description || null,
        actif: !!t.actif,
      };

      if (typeof t.id === "string") {
        // CREATE
        await http.post(TARIFS_BASE, payload, {
          headers: { "Content-Type": "application/ld+json" },
        });
        toast.success("Tarif créé");
      } else {
        // UPDATE
        await http.patch(`${TARIFS_BASE}/${t.id}`, payload, {
          headers: { "Content-Type": "application/merge-patch+json" },
        });
        toast.success("Tarif sauvegardé");
      }
      setEditingTarif(null);
      await loadTarifs();
    } catch (e: any) {
      console.error(e);
      toast.error(apiError(e, "Erreur lors de la sauvegarde"));
    }
  };

  /* ---------------- Stats (inchangé) ---------------- */
  const stats = useMemo(() => {
    const total = items.length;
    const actifs = items.filter((p) => p.isActive).length;
    const populaires = items.filter((p) => p.isPopular).length;
    const nbTarifsActifs = tarifsUniques.filter((t) => t.actif).length;
    return { total, actifs, populaires, nbTarifsActifs };
  }, [items, tarifsUniques]);

  /* ---------------- Render (même design) ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      {/* Toaster pour SONNER (toasts) */}
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
                  Plans d&apos;Abonnement & Tarifs
                </h1>
                <p className="text-red-100">
                  Gérez vos offres et tarifications
                </p>
              </div>
              <Button
                onClick={() => {
                  setCreatingOpen(true);
                  setEditingPlan(null);
                }}
                className="bg-white text-red-800 hover:bg-red-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Plans d'abonnement */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Plans d&apos;Abonnement
          </h2>

          {loading ? (
            <div className="text-gray-500">Chargement…</div>
          ) : items.length === 0 ? (
            <div className="text-gray-500">Aucun plan pour le moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.isPopular ? "ring-2 ring-red-500" : ""
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-red-500 text-white px-3 py-1">
                        <Crown className="h-3 w-3 mr-1" />
                        Populaire
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getPlanBadgeColor(plan.color)}>
                        {plan.name}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!!plan.isActive}
                          onCheckedChange={() => onToggleActive(plan)}
                          className="scale-75"
                        />
                        <span className="text-xs text-gray-500">
                          {plan.isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </div>

                    {/* <div className="text-3xl font-bold text-gray-900">
                      {Number(plan.priceCfa ?? 0).toLocaleString()} FCFA
                      <span className="text-lg font-normal text-gray-500">
                        /{plan.period}
                      </span>
                    </div> */}
                    <div className="text-center space-y-1 mt-1">
                      {plan.monthlyPriceCfa > 0 || plan.yearlyPriceCfa > 0 ? (
                        <>
                          {plan.monthlyPriceCfa > 0 && (
                            <div className="text-2xl font-bold text-gray-900">
                              {plan.monthlyPriceCfa.toLocaleString()} FCFA
                              <span className="text-sm font-normal text-gray-500">
                                /Mois
                              </span>
                            </div>
                          )}
                          {plan.yearlyPriceCfa > 0 && (
                            <div className="text-xl font-semibold text-gray-800">
                              {plan.yearlyPriceCfa.toLocaleString()} FCFA
                              <span className="text-sm font-normal text-gray-500">
                                /Année
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-gray-900">
                          0 FCFA
                          {plan.period ? (
                            <span className="text-sm font-normal text-gray-500">
                              /{plan.period}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {plan.description ? (
                      <p className="text-gray-600 text-sm mt-2">
                        {plan.description}
                      </p>
                    ) : null}
                  </CardHeader>

                  <CardContent>
                    {Array.isArray(plan.features) &&
                    plan.features.length > 0 ? (
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start space-x-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 mb-6">—</p>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setEditingPlan(plan);
                          setCreatingOpen(false);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTogglePopular(plan)}
                        className={
                          plan.isPopular ? "bg-yellow-50 text-yellow-700" : ""
                        }
                        title={
                          plan.isPopular
                            ? "Retirer des populaires"
                            : "Marquer populaire"
                        }
                      >
                        <Crown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(plan)}
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

        {/* Tarifs uniques (même vue, branché API) */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tarifs Uniques</h2>
            <Button
              onClick={addNewTarif}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Tarif
            </Button>
          </div>

          {loadingTarifs ? (
            <div className="text-gray-500">Chargement…</div>
          ) : tarifsUniques.length === 0 ? (
            <div className="text-gray-500">Aucun tarif pour le moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tarifsUniques.map((tarif) => (
                <Card key={String(tarif.id)} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        {editingTarif === String(tarif.id) ? (
                          <Input
                            value={tarif.nom}
                            onChange={(e) =>
                              updateTarif(
                                tarif.id.toString(),
                                "nom",
                                e.target.value
                              )
                            }
                            className="font-semibold mb-2"
                          />
                        ) : (
                          <h3 className="font-semibold text-gray-900">
                            {tarif.nom}
                          </h3>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={tarif.actif}
                          onCheckedChange={() =>
                            toggleTarifStatus(tarif.id.toString())
                          }
                          className="scale-75"
                        />
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-red-600">
                      {editingTarif === String(tarif.id) ? (
                        <Input
                          type="number"
                          value={tarif.prix}
                          onChange={(e) =>
                            updateTarif(
                              tarif.id.toString(),
                              "prix",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="text-2xl font-bold"
                        />
                      ) : (
                        `${Number(tarif.prix ?? 0).toLocaleString()} FCFA`
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {editingTarif === String(tarif.id) ? (
                      <textarea
                        value={tarif.description}
                        onChange={(e) =>
                          updateTarif(
                            tarif.id.toString(),
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded text-sm mb-4"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-600 text-sm mb-4">
                        {tarif.description}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      {editingTarif === String(tarif.id) ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => saveTarif(tarif.id.toString())}
                            className="flex-1"
                          >
                            Sauver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTarif(null)}
                          >
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setEditingTarif(tarif.id.toString())}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTarif(tarif.id.toString())}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <p className="text-sm text-gray-600">Plans totaux</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.actifs}
              </div>
              <p className="text-sm text-gray-600">Plans actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.populaires}
              </div>
              <p className="text-sm text-gray-600">Plans populaires</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {stats.nbTarifsActifs}
              </div>
              <p className="text-sm text-gray-600">Tarifs uniques actifs</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal création/édition */}
      <PlanEditForm
        open={creatingOpen || !!editingPlan}
        plan={editingPlan}
        onClose={() => {
          setCreatingOpen(false);
          setEditingPlan(null);
        }}
        onSubmitted={async () => {
          await load();
        }}
      />
    </div>
  );
};

export default AdminPlans;
