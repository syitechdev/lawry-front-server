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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Eye, Trash2, Upload, X, Star } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast, Toaster } from "sonner";
import { boutique, PLACEHOLDER, Produit } from "@/services/boutiques";
import { http } from "@/lib/http";
import { uploadImage } from "@/services/upload";

type Category = { id: number; name: string };

const AdminBoutique = () => {
  // -------- State list ----------
  const [products, setProducts] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  // -------- Categories (table) ----------
  const [cats, setCats] = useState<Category[]>([]);
  const catById = useMemo(() => {
    const map = new Map<number, string>();
    cats.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [cats]);

  // -------- Dialogs ----------
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produit | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Produit | null>(null);

  // -------- Image upload (créa/édition) ----------
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // -------- Form Création ----------
  const [newNom, setNewNom] = useState("");
  const [newPrix, setNewPrix] = useState<number | "">("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategorieId, setNewCategorieId] = useState<number | "">(""); // ID !
  const [newFichiers, setNewFichiers] = useState("");
  const [newActif, setNewActif] = useState(true);

  // ---------- Helpers ----------
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

  // ---------- Loaders ----------
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

  // ---------- CRUD ----------
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

      // 1) si image choisie → upload vers /api/v1/upload (services/upload.ts)
      let imageUrl: string | undefined = undefined;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      // 2) payload UI
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
        categorieId: Number(newCategorieId), // ID envoyé
      };

      // 3) create en JSON-LD (imageUrl passée à l’API)
      const created = await boutique.create(payload, undefined, imageUrl);

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
        categorieId: editingProduct.categorieId ?? null, // PATCH id
      };

      // update supporte un File : il uploade puis PATCH l’URL côté service
      const updated = await boutique.update(
        editingProduct.id,
        patch,
        selectedImage || undefined
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success("Produit modifié avec succès");
      setEditingProduct(null);
      resetImage();
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

  // ---------- UI ----------
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
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Description du produit..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fichiers">
                        Fichiers inclus (séparés par des virgules)
                      </Label>
                      <Input
                        id="fichiers"
                        placeholder="Contrat CDI, Contrat CDD..."
                        value={newFichiers}
                        onChange={(e) => setNewFichiers(e.target.value)}
                      />
                    </div>

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
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-sm text-blue-100">Produits totaux</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {products.filter((p) => p.actif).length}
              </div>
              <p className="text-sm text-green-100">Produits actifs</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {products.reduce((sum, p) => sum + p.telecharges, 0)}
              </div>
              <p className="text-sm text-purple-100">Téléchargements</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {products
                  .reduce((sum, p) => sum + p.prix * p.telecharges, 0)
                  .toLocaleString()}
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
                  <Badge className="w-fit mb-2">{catLabel}</Badge>
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
                      {product.fichiers.slice(0, 2).map((fichier, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {fichier}
                        </Badge>
                      ))}
                      {product.fichiers.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{product.fichiers.length - 2}
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
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct((p) =>
                      p ? { ...p, description: e.target.value } : p
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-fichiers">
                  Fichiers inclus (séparés par des virgules)
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
              </div>

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
