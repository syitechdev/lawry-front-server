// src/pages/admin/AdminBlog.tsx
import { useEffect, useMemo, useState } from "react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { useAuth } from "@/context/AuthContext";
import { http } from "@/lib/http";
import { uploadImage } from "@/services/upload";
import { toast, Toaster } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  User,
  Upload,
  X,
} from "lucide-react";
import { articlesApi } from "@/services/articles";

type Category = {
  "@id": string;
  id: number;
  name: string;
};

type ArticleStatus = "draft" | "published";

type Article = {
  "@id"?: string;
  id: number;
  title: string;
  slug: string;
  status: ArticleStatus;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  categoryIri: string | null;
  categoryObj?: { id: number; name: string } | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  viewsCount?: number | null;
  authorName?: string | null;
};

const getStatutBadge = (statut: string) =>
  statut === "published"
    ? "bg-green-100 text-green-800"
    : "bg-yellow-100 text-yellow-800";

export default function AdminBlog() {
  const { user, hasRole } = useAuth();
  const isAdmin = !!hasRole("Admin");
  // listes
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  // chargement
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selected, setSelected] = useState<Article | null>(null);

  // form create
  const [cTitle, setCTitle] = useState("");
  const [cStatus, setCStatus] = useState<ArticleStatus>("draft");
  const [cExcerpt, setCExcerpt] = useState("");
  const [cContent, setCContent] = useState("");
  const [cCategoryIri, setCCategoryIri] = useState<string>("");
  const [cImageFile, setCImageFile] = useState<File | null>(null);
  const [cImagePreview, setCImagePreview] = useState("");

  // form edit
  const [eTitle, setETitle] = useState("");
  const [eStatus, setEStatus] = useState<ArticleStatus>("draft");
  const [eExcerpt, setEExcerpt] = useState("");
  const [eContent, setEContent] = useState("");
  const [eCategoryIri, setECategoryIri] = useState<string>("");
  const [eImageFile, setEImageFile] = useState<File | null>(null);
  const [eImagePreview, setEImagePreview] = useState("");

  // STATS factices
  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === "published").length;
    const drafts = articles.filter((a) => a.status === "draft").length;
    const views = articles.reduce((sum, a) => sum + (a.viewsCount ?? 0), 0);
    const comments = 156;
    return { published, drafts, views, comments };
  }, [articles]);

  // charger catégories
  useEffect(() => {
    let mounted = true;
    setLoadingCats(true);
    http
      .get("/categories", { headers: { Accept: "application/ld+json" } })
      .then(({ data }) => {
        const list: Category[] = (
          data?.member ||
          data?.["hydra:member"] ||
          []
        ).map((c: any) => ({
          "@id": c["@id"] || `/api/v1/categories/${c.id}`,
          id: c.id,
          name: c.name,
        }));
        if (mounted) setCategories(list);
      })
      .catch(() => toast.error("Impossible de charger les catégories"))
      .finally(() => {
        if (mounted) setLoadingCats(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // charger articles
  const loadArticles = () => {
    setLoadingList(true);
    articlesApi
      .list(1)
      .then(({ items }) => setArticles(items))
      .catch(() => toast.error("Impossible de charger les articles"))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // helpers
  const resetCreateForm = () => {
    setCTitle("");
    setCStatus("draft");
    setCExcerpt("");
    setCContent("");
    setCCategoryIri("");
    setCImageFile(null);
    setCImagePreview("");
  };

  const formatViews = (n: number) =>
    n < 1000 ? `${n}` : `${(n / 1000).toFixed(1)}K`;

  const resetEditForm = () => {
    setEImageFile(null);
    setEImagePreview("");
  };

  const categoryNameFromIri = (iri: string | null): string => {
    if (!iri) return "—";
    const found = categories.find((c) => c["@id"] === iri);
    if (found) return found.name;
    const m = iri.match(/\/categories\/(\d+)/);
    if (m) {
      const id = Number(m[1]);
      const byId = categories.find((c) => c.id === id);
      if (byId) return byId.name;
    }
    return "—";
  };

  // image handlers
  const onCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    if (!/image\/(jpeg|png|webp)/.test(f.type)) {
      toast.error("Image non supportée (JPEG/PNG/WebP)");
      return;
    }
    setCImageFile(f);
    const r = new FileReader();
    r.onload = (ev) => setCImagePreview(String(ev.target?.result || ""));
    r.readAsDataURL(f);
  };

  const onEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    if (!/image\/(jpeg|png|webp)/.test(f.type)) {
      toast.error("Image non supportée (JPEG/PNG/WebP)");
      return;
    }
    setEImageFile(f);
    const r = new FileReader();
    r.onload = (ev) => setEImagePreview(String(ev.target?.result || ""));
    r.readAsDataURL(f);
  };

  // create
  const onCreateSubmit = async () => {
    if (!isAdmin) return toast.error("Action non autorisée.");

    try {
      let imageUrl: string | null = null;
      if (cImageFile) {
        imageUrl = await uploadImage(cImageFile); // renvoie une URL (qu’on normalise côté service)
      }

      const created = await articlesApi.create({
        title: cTitle,
        status: cStatus,
        excerpt: cExcerpt || "",
        content: cContent,
        imageUrl,
        categoryIri: cCategoryIri || null,
      });

      created.authorName = user?.name || created.authorName || "—";

      setArticles((prev) => [created, ...prev]);
      toast.success("Article créé avec succès");
      setIsCreateOpen(false);
      resetCreateForm();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Erreur lors de la création");
    }
  };

  // edit
  const openEdit = (a: Article) => {
    setSelected(a);
    setETitle(a.title || "");
    setEStatus(a.status || "draft");
    setEExcerpt(a.excerpt || "");
    setEContent(a.content || "");
    setECategoryIri(a.categoryIri || "");
    setEImageFile(null);
    setEImagePreview("");
    setIsEditOpen(true);
  };

  const onEditSubmit = async () => {
    if (!isAdmin || !selected) return toast.error("Action non autorisée.");

    try {
      let imageUrl: string | undefined = undefined;
      if (eImageFile) {
        imageUrl = await uploadImage(eImageFile);
      }

      const updated = await articlesApi.update(selected.id, {
        title: eTitle,
        status: eStatus,
        excerpt: eExcerpt || "",
        content: eContent,
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        categoryIri: eCategoryIri || null,
      });

      updated.authorName =
        selected.authorName || user?.name || updated.authorName || "—";

      setArticles((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      toast.success("Article modifié avec succès");
      setIsEditOpen(false);
      resetEditForm();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.detail || "Erreur lors de la modification"
      );
    }
  };

  // delete
  const onDelete = async (a: Article) => {
    if (!isAdmin) return toast.error("Action non autorisée.");
    if (!confirm(`Supprimer l'article "${a.title}" ?`)) return;
    try {
      await articlesApi.remove(a.id);
      setArticles((prev) => prev.filter((p) => p.id !== a.id));
      toast.success("Article supprimé");
    } catch {
      toast.error("Suppression impossible");
    }
  };

  // view
  const onView = (a: Article) => {
    setSelected(a);
    setIsViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <Toaster richColors position="top-right" />

      <BackofficeSidebar
        userRole="admin"
        userName={user?.name || "Admin"}
        userEmail={user?.email || "admin@lawry.ci"}
      />

      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Gestion du Blog</h1>
            <p className="text-red-100">
              Créer et gérer les articles du blog juridique
            </p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {articles.filter((a) => a.status === "published").length}
              </div>
              <p className="text-sm text-blue-100">Articles Publiés</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {formatViews(stats.views)}
              </div>
              <p className="text-sm text-green-100">Vues ce mois</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {articles.filter((a) => a.status === "draft").length}
              </div>
              <p className="text-sm text-yellow-100">Brouillons</p>
            </CardContent>
          </Card>
          {/* <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">156</div>
              <p className="text-sm text-purple-100">Commentaires</p>
            </CardContent>
          </Card> */}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Articles du Blog</CardTitle>

              {isAdmin && (
                <Dialog
                  open={isCreateOpen}
                  onOpenChange={(o) => {
                    setIsCreateOpen(o);
                    if (!o) resetCreateForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-red-900 hover:bg-red-800">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvel Article
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Créer un Nouvel Article</DialogTitle>
                      <DialogDescription>
                        Créez un nouvel article pour votre blog
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="titre">Titre</Label>
                        <Input
                          id="titre"
                          value={cTitle}
                          onChange={(e) => setCTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="categorie">Catégorie</Label>
                          <select
                            id="categorie"
                            className="w-full p-2 border rounded-md bg-white"
                            value={cCategoryIri}
                            onChange={(e) => setCCategoryIri(e.target.value)}
                            disabled={loadingCats}
                          >
                            <option value="" disabled>
                              Sélectionnez une catégorie
                            </option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat["@id"]}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="statut">Statut</Label>
                          <select
                            id="statut"
                            className="w-full p-2 border rounded-md bg-white"
                            value={cStatus}
                            onChange={(e) =>
                              setCStatus(e.target.value as ArticleStatus)
                            }
                          >
                            <option value="draft">Brouillon</option>
                            <option value="published">Publié</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="extrait">Extrait</Label>
                        <Textarea
                          id="extrait"
                          value={cExcerpt}
                          onChange={(e) => setCExcerpt(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contenu">Contenu</Label>
                        <Textarea
                          id="contenu"
                          value={cContent}
                          onChange={(e) => setCContent(e.target.value)}
                          rows={10}
                        />
                      </div>

                      <div>
                        <Label>Image de l'article</Label>
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
                                  PNG/JPEG/WebP (MAX. 4MB)
                                </p>
                              </div>
                              <input
                                id="image-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={onCreateImageChange}
                              />
                            </label>
                          </div>
                          {cImagePreview && (
                            <div className="relative">
                              <img
                                src={cImagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  setCImageFile(null);
                                  setCImagePreview("");
                                }}
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
                        onClick={() => setIsCreateOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        className="bg-red-900 hover:bg-red-800"
                        onClick={onCreateSubmit}
                      >
                        Publier
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {loadingList ? (
              <p className="text-sm text-gray-500">Chargement…</p>
            ) : (
              <div className="space-y-4">
                {articles.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getStatutBadge(post.status)}>
                              {post.status === "published"
                                ? "Publié"
                                : "Brouillon"}
                            </Badge>
                            <Badge variant="secondary">
                              {post.categoryObj?.name ||
                                categoryNameFromIri(post.categoryIri)}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>
                                {post.authorName || user?.name || "—"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {post.createdAt
                                  ? new Date(
                                      post.createdAt
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(post)}
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEdit(post)}
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => onDelete(post)}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* DIALOG VIEW */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selected?.title}</DialogTitle>
              <DialogDescription>
                {selected?.createdAt &&
                  new Date(selected.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <Badge className={getStatutBadge(selected?.status || "")}>
                  {selected?.status === "published" ? "Publié" : "Brouillon"}
                </Badge>
                <Badge variant="secondary" className="ml-2">
                  {selected?.categoryObj?.name ||
                    categoryNameFromIri(selected?.categoryIri || null)}
                </Badge>
              </div>
              {selected?.imageUrl && (
                <div className="mb-4">
                  <img
                    src={selected.imageUrl}
                    alt={selected.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              {selected?.excerpt && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Extrait:</h4>
                  <p className="text-gray-600">{selected.excerpt}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Contenu:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selected?.content}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* DIALOG EDIT */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(o) => {
            setIsEditOpen(o);
            if (!o) resetEditForm();
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'article</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'article
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-titre">Titre</Label>
                <Input
                  id="edit-titre"
                  value={eTitle}
                  onChange={(e) => setETitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-categorie">Catégorie</Label>
                  <select
                    id="edit-categorie"
                    className="w-full p-2 border rounded-md bg-white"
                    value={eCategoryIri}
                    onChange={(e) => setECategoryIri(e.target.value)}
                    disabled={loadingCats}
                  >
                    <option value="" disabled>
                      Sélectionnez une catégorie
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat["@id"]}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-statut">Statut</Label>
                  <select
                    id="edit-statut"
                    className="w-full p-2 border rounded-md bg-white"
                    value={eStatus}
                    onChange={(e) =>
                      setEStatus(e.target.value as ArticleStatus)
                    }
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-extrait">Extrait</Label>
                <Textarea
                  id="edit-extrait"
                  value={eExcerpt}
                  onChange={(e) => setEExcerpt(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-contenu">Contenu</Label>
                <Textarea
                  id="edit-contenu"
                  value={eContent}
                  onChange={(e) => setEContent(e.target.value)}
                  rows={10}
                />
              </div>

              <div>
                <Label>Image</Label>
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
                            Cliquez pour télécharger
                          </span>{" "}
                          ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG/JPEG/WebP (MAX. 4MB)
                        </p>
                      </div>
                      <input
                        id="edit-image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={onEditImageChange}
                      />
                    </label>
                  </div>
                  {(eImagePreview || selected?.imageUrl) && (
                    <div className="relative">
                      <img
                        src={eImagePreview || selected?.imageUrl!}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {eImagePreview && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setEImageFile(null);
                            setEImagePreview("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Annuler
              </Button>
              <Button
                className="bg-red-900 hover:bg-red-800"
                onClick={onEditSubmit}
              >
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
