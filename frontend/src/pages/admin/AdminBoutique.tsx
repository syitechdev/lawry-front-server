// src/pages/admin/AdminBoutique.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Upload,
  X,
  Star,
  Image as ImgIcon,
  File as FileIcon,
  FileText,
  FileArchive,
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast, Toaster } from "sonner";
import { boutique, PLACEHOLDER, Produit } from "@/services/boutiques";
import { http } from "@/lib/http";
import { uploadImage } from "@/services/upload";
import ProductPurchasesModal from "@/components/modals/ProductPurchasesModal";
import { getAdminBoutiqueMetrics } from "@/services/adminPurchases";

/* -------------------------------- File UI helpers -------------------------------- */
function prettySize(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}
function fileIconByName(name: string) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif", "avif", "svg"].includes(ext))
    return <ImgIcon className="w-4 h-4" />;
  if (["zip", "rar", "7z"].includes(ext))
    return <FileArchive className="w-4 h-4" />;
  if (
    ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md"].includes(
      ext
    )
  )
    return <FileText className="w-4 h-4" />;
  return <FileIcon className="w-4 h-4" />;
}

function FileDropzone({
  files,
  onChange,
  accept,
  label = "Glissez-déposez ou cliquez pour sélectionner",
}: {
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  label?: string;
}) {
  const [isOver, setIsOver] = useState(false);
  const inputId = useMemo(
    () => "files-" + Math.random().toString(36).slice(2),
    []
  );

  const addFiles = (incoming: File[]) => {
    const map = new Map<string, File>();
    [...files, ...incoming].forEach((f) => map.set(`${f.name}-${f.size}`, f));
    onChange(Array.from(map.values()));
  };
  const removeAt = (idx: number) => {
    const clone = [...files];
    clone.splice(idx, 1);
    onChange(clone);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          const dropped = Array.from(e.dataTransfer.files || []);
          if (dropped.length) {
            addFiles(dropped);
            toast.success(`${dropped.length} fichier(s) sélectionné(s)`);
          }
        }}
        className={`rounded-xl border-2 border-dashed p-5 text-center transition ${
          isOver
            ? "border-red-500 bg-red-50/60"
            : "border-gray-300 bg-white hover:bg-gray-50"
        }`}
      >
        <input
          id={inputId}
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={(e) => {
            const picked = Array.from(e.target.files || []);
            addFiles(picked);
            if (picked.length)
              toast.success(`${picked.length} fichier(s) sélectionné(s)`);
          }}
        />
        <label htmlFor={inputId} className="cursor-pointer block">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-gray-500" />
            <span className="text-sm text-gray-700 font-medium">{label}</span>
            <span className="text-xs text-gray-500">
              {accept ? `Types acceptés : ${accept}` : "Tous types autorisés"}
            </span>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {files.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="shrink-0 text-gray-600">
                  {fileIconByName(f.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-gray-500">
                    {prettySize(f.size)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="inline-flex items-center rounded-md border px-2 py-1 text-xs hover:bg-red-50 hover:text-red-700"
                title="Retirer"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilePill({
  text,
  onClick,
  title,
}: {
  text: string;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className="group inline-flex items-center max-w-full rounded-full border px-3 py-1 text-xs 
                       bg-white hover:bg-red-50 hover:border-red-200 transition"
            title={title || text}
          >
            <span className="truncate max-w-[200px]">{text}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[420px] break-all">
          {title || text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PillsList({
  items,
  onPillClick, // optionnel (ex: ajouter à la suppression)
  limit, // optionnel (ex: 2 sur la carte)
}: {
  items: string[];
  onPillClick?: (v: string) => void;
  limit?: number;
}) {
  const show = typeof limit === "number" ? items.slice(0, limit) : items;
  const extra =
    typeof limit === "number" ? Math.max(items.length - limit, 0) : 0;
  return (
    <div className="flex flex-wrap gap-2">
      {show.map((v, i) => (
        <FilePill
          key={`${v}-${i}`}
          text={v}
          title={v}
          onClick={
            onPillClick
              ? () => onPillClick(v)
              : () => {
                  navigator.clipboard.writeText(v);
                  // @ts-ignore kkkk
                  window?.toast?.success?.("Lien copié") || null;
                }
          }
        />
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center rounded-full bg-gray-100 border px-3 py-1 text-xs">
          +{extra}
        </span>
      )}
    </div>
  );
}

type Category = { id: number; name: string };

const AdminBoutique = () => {
  /* -------- State list ---------- */
  const [products, setProducts] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------- Categories ---------- */
  const [cats, setCats] = useState<Category[]>([]);
  const catById = useMemo(() => {
    const map = new Map<number, string>();
    cats.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [cats]);

  /* -------- Dialogs ---------- */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produit | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Produit | null>(null);

  /* -------- Image upload (preview) ---------- */
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  /* -------- Form Création ---------- */
  const [newNom, setNewNom] = useState("");
  const [newPrix, setNewPrix] = useState<number | "">("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategorieId, setNewCategorieId] = useState<number | "">("");
  const [newFichiers, setNewFichiers] = useState(""); // CSV/URLs/chemins (optionnel)
  const [newActif, setNewActif] = useState(true);
  const [newType, setNewType] = useState<"service" | "file">("service");
  const [newFilesToUpload, setNewFilesToUpload] = useState<File[]>([]);

  // Stat
  const [metrics, setMetrics] = useState<{
    total_products: number;
    active_products: number;
    downloads_count: number;
    revenue_cfa: number;
  } | null>(null);

  useEffect(() => {
    getAdminBoutiqueMetrics()
      .then(setMetrics)
      .catch(() => {});
  }, []);

  /* -------- Form Édition ---------- */
  const [editFilesToUpload, setEditFilesToUpload] = useState<File[]>([]);
  const [filesToRemoveInput, setFilesToRemoveInput] = useState("");

  //stat
  const [openPurchasesFor, setOpenPurchasesFor] = useState<number | null>(null);

  /* -------- Helpers ---------- */
  const resetImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };
  const resetCreateForm = () => {
    setNewNom("");
    setNewPrix("");
    setNewDescription("");
    setNewCategorieId("");
    setNewFichiers("");
    setNewActif(true);
    setNewType("service");
    setNewFilesToUpload([]);
    resetImage();
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/gif",
        "image/svg+xml",
      ].includes(file.type)
    ) {
      toast.error(
        "Veuillez sélectionner une image (PNG, JPEG, WEBP, AVIF, GIF, SVG)"
      );
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview((e.target?.result as string) || "");
    reader.readAsDataURL(file);
    toast.success("Image sélectionnée");
  };

  /* -------- Loaders ---------- */
  const load = async () => {
    try {
      setLoading(true);
      const { items } = await boutique.list();
      setProducts(items);
    } catch (e: any) {
      toast.error(e.message || "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };
  const loadCats = async () => {
    try {
      const { data } = await http.get(`/categories?pagination=false`, {
        headers: { Accept: "application/ld+json" },
      });
      const arr =
        (Array.isArray(data?.member)
          ? data.member
          : Array.isArray(data?.["hydra:member"])
          ? data["hydra:member"]
          : []) || [];
      setCats(arr.map((c: any) => ({ id: c.id, name: c.name })));
    } catch {
      toast.error("Impossible de charger les catégories");
    }
  };

  useEffect(() => {
    loadCats();
    load();
  }, []);

  /* -------- CRUD ---------- */
  const createProduct = async () => {
    try {
      if (!newNom.trim() || newPrix === "" || Number(newPrix) <= 0) {
        toast.error("Nom et prix sont requis");
        return;
      }
      if (newCategorieId === "") {
        toast.error("Veuillez choisir une catégorie");
        return;
      }

      // image -> URL
      let imageUrl: string | undefined = undefined;
      if (selectedImage) imageUrl = await uploadImage(selectedImage);

      // payload UI
      const payload: Partial<Produit> = {
        nom: newNom.trim(),
        prix: Number(newPrix),
        description: newDescription.trim(),
        fichiers: newFichiers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        actif: newActif,
        note: 0,
        telecharges: 0,
        categorieId: Number(newCategorieId),
        type: newType,
      };

      // create (multi-files gérés côté service si type=file)
      const created = await boutique.create(
        payload,
        undefined,
        imageUrl,
        newType === "file" ? newFilesToUpload : undefined
      );

      setProducts((prev) => [created, ...prev]);
      toast.success("Produit créé avec succès");
      setIsDialogOpen(false);
      resetCreateForm();
    } catch (e: any) {
      toast.error(e.message || "Création impossible");
    }
  };

  const startEdit = (p: Produit) => {
    setEditingProduct({
      ...p,
      categorieId: p.categorieId ?? undefined,
    } as Produit);
    resetImage();
    setEditFilesToUpload([]);
    setFilesToRemoveInput("");
  };

  const saveEdit = async () => {
    if (!editingProduct) return;
    try {
      const patch: Partial<Produit> = {
        nom: editingProduct.nom,
        prix: editingProduct.prix,
        description: editingProduct.description,
        fichiers: editingProduct.fichiers,
        actif: editingProduct.actif,
        categorieId: editingProduct.categorieId ?? null,
        type: editingProduct.type,
      };

      const filesRemove = filesToRemoveInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await boutique.update(
        editingProduct.id,
        patch,
        selectedImage || undefined,
        editingProduct.type === "file" ? editFilesToUpload : undefined,
        filesRemove.length ? filesRemove : undefined
      );

      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success("Produit modifié avec succès");
      setEditingProduct(null);
      resetImage();
      setEditFilesToUpload([]);
      setFilesToRemoveInput("");
    } catch (e: any) {
      toast.error(e.message || "Mise à jour impossible");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    try {
      await boutique.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produit supprimé");
    } catch (e: any) {
      toast.error(e.message || "Suppression impossible");
    }
  };

  const toggleProductStatus = async (p: Produit) => {
    const next = !p.actif;
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, actif: next } : x))
    );
    try {
      await boutique.setActive(p.id, next);
      toast.success("Statut mis à jour");
    } catch (e: any) {
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, actif: !next } : x))
      );
      toast.error(e.message || "Échec de la mise à jour du statut");
    }
  };

  /* -------- UI ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <Toaster richColors position="top-right" />
        <BackofficeSidebar
          userRole="admin"
          userName="Admin Lawry"
          userEmail="admin@lawry.ci"
        />
        <div className="ml-80 px-8 py-8">
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <Toaster richColors position="top-right" />
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Gestion de la Boutique
                </h1>
                <p className="text-red-100">
                  Gérez vos produits et modèles de contrats
                </p>
              </div>

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetCreateForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-white text-red-800 hover:bg-red-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Produit
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un Nouveau Produit</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nom">Nom du produit</Label>
                        <Input
                          id="nom"
                          placeholder="Ex: Pack Création..."
                          value={newNom}
                          onChange={(e) => setNewNom(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="prix">Prix (FCFA)</Label>
                        <Input
                          id="prix"
                          type="number"
                          placeholder="50000"
                          value={newPrix}
                          onChange={(e) =>
                            setNewPrix(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categorie">Catégorie</Label>
                        <select
                          id="categorie"
                          className="w-full p-2 border rounded-md bg-white"
                          value={newCategorieId}
                          onChange={(e) =>
                            setNewCategorieId(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                        >
                          <option value="">— Choisir —</option>
                          {cats.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="type">Type de produit</Label>
                        <select
                          id="type"
                          className="w-full p-2 border rounded-md bg-white"
                          value={newType}
                          onChange={(e) =>
                            setNewType(e.target.value as "service" | "file")
                          }
                        >
                          <option value="service">Service</option>
                          <option value="file">Fichier(s)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Description du produit..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>

                    {/* Champs fichiers visibles seulement si type=file */}
                    {newType === "file" && (
                      <>
                        <div>
                          <Label htmlFor="fichiers">
                            Fichiers (URLs/chemins) — optionnel
                          </Label>
                          <Input
                            id="fichiers"
                            placeholder="https://…/modele1.pdf, /storage/boutique/files/modele2.docx"
                            value={newFichiers}
                            onChange={(e) => setNewFichiers(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Vous pouvez mixer des URLs/chemins avec des fichiers
                            uploadés ci-dessous.
                          </p>
                        </div>

                        <div>
                          <Label>Ajouter des fichiers (upload)</Label>
                          <FileDropzone
                            files={newFilesToUpload}
                            onChange={setNewFilesToUpload}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,image/*"
                            label="Glissez-déposez vos fichiers ou cliquez"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newActif}
                        onCheckedChange={setNewActif}
                      />
                      <span className="text-sm text-gray-600">
                        {newActif ? "Actif" : "Inactif"}
                      </span>
                    </div>

                    {/* Upload image */}
                    <div>
                      <Label>Image du produit</Label>
                      <div className="mt-2 space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Cliquez pour télécharger
                                </span>{" "}
                                ou glissez-déposez
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPEG, WEBP, AVIF, GIF, SVG (MAX. 5MB)
                              </p>
                            </div>
                            <input
                              id="image-upload"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>

                        {imagePreview && (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Prévisualisation"
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  PLACEHOLDER;
                              }}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={resetImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="bg-red-900 hover:bg-red-800"
                      onClick={createProduct}
                    >
                      Créer le Produit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {metrics?.total_products ?? 0}
              </div>
              <p className="text-sm text-blue-100">Produits totaux</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {metrics?.active_products ?? 0}
              </div>
              <p className="text-sm text-green-100">Produits actifs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {metrics?.downloads_count ?? 0}
              </div>
              <p className="text-sm text-purple-100">vente(s)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {(metrics?.revenue_cfa ?? 0).toLocaleString()}
              </div>
              <p className="text-sm text-yellow-100">CA (FCFA)</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const catLabel = product.categorieId
              ? catById.get(product.categorieId) || product.categorie
              : product.categorie;
            return (
              <Card
                key={product.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={product.image || PLACEHOLDER}
                    alt={product.nom}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-lg">{product.nom}</CardTitle>
                      <p className="text-sm font-mono text-gray-500">
                        {product.code ? product.code : `#${product.id}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={product.actif}
                        onCheckedChange={() => toggleProductStatus(product)}
                        className="scale-75"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="w-fit">{catLabel}</Badge>
                    <Badge variant="secondary">{product.type}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{product.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Prix</p>
                      <p className="font-bold text-lg text-red-800">
                        {product.prix.toLocaleString()} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Note</p>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{product.note}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Téléchargements: {product.telecharges}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {/* {product.fichiers.slice(0, 2).map((fichier, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {fichier}
                        </Badge>
                      ))} */}
                      {product.fichiers.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{product.fichiers.length} fichier
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingProduct(product)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => startEdit(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setOpenPurchasesFor(product.id)}
                    >
                      Achats
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {openPurchasesFor && (
                      <ProductPurchasesModal
                        productId={openPurchasesFor}
                        open={!!openPurchasesFor}
                        onClose={() => setOpenPurchasesFor(null)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* View Product Dialog */}
      {viewingProduct && (
        <Dialog
          open={!!viewingProduct}
          onOpenChange={(open) => {
            if (!open) setViewingProduct(null);
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails Produit - {viewingProduct.nom}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="mb-4">
                <img
                  src={viewingProduct.image || PLACEHOLDER}
                  alt={viewingProduct.nom}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID Produit</Label>
                  <p className="font-mono">
                    {viewingProduct.code ?? `#${viewingProduct.id}`}
                  </p>
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Badge>
                    {viewingProduct.categorieId
                      ? catById.get(viewingProduct.categorieId) || "—"
                      : "—"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p>{viewingProduct.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix</Label>
                  <p className="font-bold text-red-800">
                    {viewingProduct.prix.toLocaleString()} FCFA
                  </p>
                </div>
                <div>
                  <Label>Note</Label>
                  <p>{viewingProduct.note}/5 ⭐</p>
                </div>
              </div>

              <div>
                <Label>Téléchargements</Label>
                <p className="font-medium">{viewingProduct.telecharges}</p>
              </div>

              <div>
                <Label>Type</Label>
                <Badge variant="secondary">{viewingProduct.type}</Badge>
              </div>

              <div>
                <Label>Fichiers inclus</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {viewingProduct.fichiers.map((fichier, index) => (
                    <Badge key={index} variant="secondary">
                      {fichier}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) {
              setEditingProduct(null);
              resetImage();
              setEditFilesToUpload([]);
              setFilesToRemoveInput("");
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le Produit</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nom">Nom du produit</Label>
                  <Input
                    id="edit-nom"
                    value={editingProduct.nom}
                    onChange={(e) =>
                      setEditingProduct((p) =>
                        p ? { ...p, nom: e.target.value } : p
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prix">Prix (FCFA)</Label>
                  <Input
                    id="edit-prix"
                    type="number"
                    value={editingProduct.prix}
                    onChange={(e) =>
                      setEditingProduct((p) =>
                        p
                          ? {
                              ...p,
                              prix:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            }
                          : p
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-categorie">Catégorie</Label>
                  <select
                    id="edit-categorie"
                    className="w-full p-2 border rounded-md bg-white"
                    value={editingProduct.categorieId ?? ""}
                    onChange={(e) =>
                      setEditingProduct((p) =>
                        p
                          ? {
                              ...p,
                              categorieId: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            }
                          : p
                      )
                    }
                  >
                    <option value="">— Choisir —</option>
                    {cats.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="edit-type">Type de produit</Label>
                  <select
                    id="edit-type"
                    className="w-full p-2 border rounded-md bg-white"
                    value={editingProduct.type}
                    onChange={(e) =>
                      setEditingProduct((p) =>
                        p
                          ? {
                              ...p,
                              type: e.target.value as "service" | "file",
                            }
                          : p
                      )
                    }
                  >
                    <option value="service">Service</option>
                    <option value="file">Fichier(s)</option>
                  </select>
                </div>
              </div>

              {/* Zone fichiers visible seulement si type=file */}
              {editingProduct.type === "file" && (
                <>
                  <div>
                    <Label htmlFor="edit-fichiers">
                      Fichiers (URLs/chemins)
                    </Label>
                    <Input
                      id="edit-fichiers"
                      value={editingProduct.fichiers.join(", ")}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p
                            ? {
                                ...p,
                                fichiers: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              }
                            : p
                        )
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ces chemins/URLs s’ajoutent aux uploads ci-dessous.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Uploads (ajout)</Label>
                    <FileDropzone
                      files={editFilesToUpload}
                      onChange={setEditFilesToUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,image/*"
                      label="Glissez-déposez pour ajouter"
                    />

                    {/* Suppression ciblée */}
                    <div>
                      <Label htmlFor="edit-remove">
                        Supprimer (chemins/URLs)
                      </Label>
                      <Input
                        id="edit-remove"
                        placeholder="ex: boutique/files/a.pdf, https://…/b.docx"
                        value={filesToRemoveInput}
                        onChange={(e) => setFilesToRemoveInput(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Clique un fichier existant pour copier son chemin ici.
                      </p>
                    </div>

                    {/* Liste des fichiers existants cliquables */}
                    {editingProduct.fichiers.length > 0 && (
                      <div className="rounded-lg border bg-white p-3">
                        <p className="text-xs text-gray-500 mb-2">
                          Fichiers existants :
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {editingProduct.fichiers.map((f, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => {
                                const next = filesToRemoveInput
                                  ? `${filesToRemoveInput}, ${f}`
                                  : f;
                                setFilesToRemoveInput(next);
                                toast.success(
                                  "Chemin ajouté à la liste de suppression"
                                );
                              }}
                              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs hover:bg-red-50"
                              title="Cliquer pour ajouter à la suppression"
                            >
                              {fileIconByName(f)}
                              <span className="truncate max-w-[200px]">
                                {f}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingProduct.actif}
                  onCheckedChange={(v) =>
                    setEditingProduct((p) => (p ? { ...p, actif: v } : p))
                  }
                />
                <span className="text-sm text-gray-600">
                  {editingProduct.actif ? "Actif" : "Inactif"}
                </span>
              </div>

              {/* Upload image (édition) */}
              <div>
                <Label>Image du produit</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="edit-image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Cliquez pour changer l'image
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPEG, WEBP, AVIF, GIF, SVG (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        id="edit-image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <img
                      src={imagePreview || editingProduct.image || PLACEHOLDER}
                      alt="Image du produit"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingProduct(null);
                  resetImage();
                  setEditFilesToUpload([]);
                  setFilesToRemoveInput("");
                }}
              >
                Annuler
              </Button>
              <Button
                className="bg-red-900 hover:bg-red-800"
                onClick={saveEdit}
              >
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminBoutique;
