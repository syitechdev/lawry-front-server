import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { http } from "@/lib/http";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ArrowLeft, CreditCard, User, Building, Save } from "lucide-react";

type Detail = {
  id: number;
  created_at: string;
  read_at?: string | null;
  status: "pending" | "confirmed" | "cancelled" | string;
  experience?: "debutant" | "intermediaire" | "avance" | null;
  session_format?: "presentiel" | "distanciel" | null;
  amount_cfa?: number | null;
  price_type?: "fixed" | "quote" | string | null;

  user: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    created_at?: string | null;
  };

  formation: {
    id: number;
    title: string;
    code: string;
    date?: string | null;
    type?: string | null;
    level?: string | null;
    duration?: string | null;
    price_type?: "fixed" | "quote" | string | null;
    price_cfa?: number | null;
  };
};

const statusLabel = (s: string) =>
  s === "confirmed"
    ? "Confirmé"
    : s === "pending"
    ? "En attente"
    : s === "cancelled"
    ? "Annulé"
    : s;

const statusBadge = (s: string) =>
  s === "confirmed"
    ? "bg-green-100 text-green-800"
    : s === "pending"
    ? "bg-yellow-100 text-yellow-800"
    : s === "cancelled"
    ? "bg-gray-200 text-gray-700"
    : "bg-gray-100 text-gray-800";

export default function AdminRegistrationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // champs éditables
  const [status, setStatus] = useState<Detail["status"]>("confirmed");
  const [format, setFormat] = useState<Detail["session_format"]>(null);
  const [xp, setXp] = useState<Detail["experience"]>(null);

  const editCardRef = useRef<HTMLDivElement>(null);

  const priceText = (f?: Detail["formation"]) => {
    if (!f) return "—";
    if (f.price_type === "quote" || !f.price_cfa || f.price_cfa <= 0)
      return "Sur devis";
    return `${(f.price_cfa || 0).toLocaleString()} FCFA`;
  };

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await http.get(`/admin/registrations/${id}`);
      setData(data);
      setStatus((data?.status ?? "confirmed") as any);
      setFormat((data?.session_format ?? null) as any);
      setXp((data?.experience ?? null) as any);

      // marquer lu (non bloquant)
      http.post(`/admin/registrations/${id}/mark-read`).catch(() => {});
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Impossible de charger l'inscription."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // activer édition si on arrive via #edit
    if (window.location.hash === "#edit") {
      setEditMode(true);
      setTimeout(
        () =>
          editCardRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        50
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await http.patch(`/admin/registrations/${id}`, {
        status,
        session_format: format,
        experience: xp,
      });
      toast.success("Inscription mise à jour");
      setEditMode(false);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar
          userRole="admin"
          userName="Admin Lawry"
          userEmail="admin@lawry.ci"
        />
        <div className="ml-80 px-8 py-8">Chargement…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar
          userRole="admin"
          userName="Admin Lawry"
          userEmail="admin@lawry.ci"
        />
        <div className="ml-80 px-8 py-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Card>
            <CardContent className="p-6">Inscription introuvable.</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="ml-80 px-8 py-8">
        {/* En-tête style AdminDemandeDetail */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux inscriptions
          </Button>

          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Détails de l’inscription
                </h1>
                <p className="text-red-100">
                  Code: {data.formation.code} • Formation:{" "}
                  {data.formation.title}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={statusBadge(data.status)}>
                  {statusLabel(data.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Grille 3 colonnes comme le design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche (2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations du participant (comme "Informations du client") */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations du participant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{data.user.name || "—"}</p>
                        <p className="text-sm text-gray-500">Nom complet</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{data.user.phone || "—"}</p>
                        <p className="text-sm text-gray-500">Téléphone</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{data.user.email || "—"}</p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {data.user.created_at
                            ? new Date(
                                data.user.created_at
                              ).toLocaleDateString()
                            : "—"}
                        </p>
                        <p className="text-sm text-gray-500">Client depuis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Détails de l’inscription (comme "Détails de la commande") */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Détails de l’inscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm text-gray-500">
                        Statut
                      </p>
                      <Badge className={statusBadge(data.status)}>
                        {statusLabel(data.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-500">
                        Format
                      </p>
                      <p className="font-semibold">
                        {data.session_format === "presentiel"
                          ? "Présentiel"
                          : data.session_format === "distanciel"
                          ? "En ligne"
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-sm text-gray-500">
                        Niveau
                      </p>
                      <p className="font-semibold">
                        {data.experience === "debutant"
                          ? "Débutant"
                          : data.experience === "intermediaire"
                          ? "Intermédiaire"
                          : data.experience === "avance"
                          ? "Avancé"
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-500">
                        Créée le
                      </p>
                      <p className="font-semibold">
                        {new Date(data.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formation (section info) */}
            <Card>
              <CardHeader>
                <CardTitle>Formation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-sm text-gray-500">Code</p>
                    <p className="font-semibold">{data.formation.code}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">Titre</p>
                    <p className="font-semibold">{data.formation.title}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">Date</p>
                    <p className="font-semibold">
                      {data.formation.date
                        ? new Date(data.formation.date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">
                      Niveau / Durée
                    </p>
                    <p className="font-semibold">
                      {(data.formation.level || "—") +
                        " • " +
                        (data.formation.duration || "—")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite (1) */}
          <div className="space-y-6">
            {/* Paiement (visuel comme ta carte “Informations de paiement”) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Informations de paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-gray-500">Montant</p>
                  <p className="font-semibold text-lg">
                    {priceText(data.formation)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-500">
                    Type de prix
                  </p>
                  <p className="font-semibold">
                    {data.formation.price_type === "fixed"
                      ? "Fixe"
                      : "Sur devis"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-500">Statut</p>
                  <Badge className={statusBadge(data.status)}>
                    {statusLabel(data.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions (édition) */}
            <Card id="edit" ref={editCardRef}>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)} className="w-full">
                    Activer l’édition
                  </Button>
                ) : (
                  <>
                    <div>
                      <p className="text-sm mb-1">Statut</p>
                      <Select
                        value={status}
                        onValueChange={(v) => setStatus(v as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="confirmed">Confirmé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm mb-1">Format</p>
                      <Select
                        value={format ?? ""}
                        onValueChange={(v) => setFormat((v || null) as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">—</SelectItem>
                          <SelectItem value="presentiel">Présentiel</SelectItem>
                          <SelectItem value="distanciel">En ligne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm mb-1">Niveau</p>
                      <Select
                        value={xp ?? ""}
                        onValueChange={(v) => setXp((v || null) as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">—</SelectItem>
                          <SelectItem value="debutant">Débutant</SelectItem>
                          <SelectItem value="intermediaire">
                            Intermédiaire
                          </SelectItem>
                          <SelectItem value="avance">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={onSave}
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" /> Enregistrer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditMode(false);
                          // reset
                          setStatus((data?.status ?? "confirmed") as any);
                          setFormat((data?.session_format ?? null) as any);
                          setXp((data?.experience ?? null) as any);
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Résumé (comme ta carte Résumé) */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Date d’inscription:</span>
                  <span>{new Date(data.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Statut:</span>
                  <Badge className={statusBadge(data.status)}>
                    {statusLabel(data.status)}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lu:</span>
                  <span>{data.read_at ? "Oui" : "Non"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
