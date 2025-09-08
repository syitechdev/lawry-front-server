import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { articlesApi, type Article } from "@/services/articles";
import { categories } from "@/services/categories";
import ShareDialog from "@/components/ShareDialog";

const iriId = (iri?: string | null) => {
  if (!iri) return null;
  const m = iri.match(/\/(\d+)(\?.*)?$/);
  return m ? parseInt(m[1], 10) : null;
};

const BlogDetail = () => {
  const { slug: slugOrId } = useParams<{ slug: string }>();
  const [shareOpen, setShareOpen] = useState(false);

  const [item, setItem] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [catName, setCatName] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      let article: Article | null = null;
      if (!slugOrId) {
        article = null;
      } else if (/^\d+$/.test(slugOrId)) {
        article = await articlesApi.showPublic(Number(slugOrId));
      } else {
        article = await articlesApi.findBySlugPublic(slugOrId);
      }

      if (!article) {
        setItem(null);
        setLoading(false);
        return;
      }

      setItem(article);

      // (catégorie identique)
      const iri = article.categoryIri;
      if (article.categoryObj?.name) {
        setCatName(article.categoryObj.name);
      } else if (iri) {
        const idMatch = iri.match(/\/(\d+)(\?.*)?$/);
        const id = idMatch ? parseInt(idMatch[1], 10) : null;
        const cat = await categories.get(id ?? iri);
        setCatName(cat.name);
      } else {
        setCatName("");
      }

      await articlesApi.trackView(article.id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugOrId]);

  const onShare = async () => {
    const url = window.location.href;
    const title = item?.title || document.title;
    const text = item?.excerpt || "";
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // ignore cancel
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        alert("Lien copié dans le presse-papiers");
      } catch {
        window.prompt("Copiez le lien :", url);
      }
    } else {
      window.prompt("Copiez le lien :", url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
          <div className="text-center text-gray-500">Chargement…</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Article non trouvé
            </h1>
            <Button asChild>
              <Link to="/blog">Retour au blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        <div className="mb-6 sm:mb-8">
          <Button variant="outline" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au blog
            </Link>
          </Button>
        </div>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-video bg-gray-200 overflow-hidden">
            <img
              src={
                item.imageUrl ||
                "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop"
              }
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              {catName && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {catName}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              {item.title}
            </h1>

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Partager cet article
                </h3>
                {/* <Button variant="outline" onClick={onShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button> */}
                <Button variant="outline" onClick={() => setShareOpen(true)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>

            <div className="mt-8 bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Besoin d&apos;aide juridique ?
              </h3>
              <p className="text-gray-700 mb-4">
                Nos experts sont à votre disposition pour vous accompagner dans
                vos démarches juridiques.
              </p>
              <Button className="bg-red-900 hover:bg-red-800" asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </article>

        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          title={item.title}
          url={typeof window !== "undefined" ? window.location.href : ""}
          text={item.excerpt || ""}
        />
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
