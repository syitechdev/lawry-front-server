import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { articlesApi, type Article } from "@/services/articles";
import { categories } from "@/services/categories";
import NewsletterSection from "@/components/NewsletterSection";

type CatNameMap = Record<string, string>;

const Blog = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);
  const [catNames, setCatNames] = useState<CatNameMap>({});

  // (imports inchangés)

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await articlesApi.listPublic(page, pageSize); // ✅ public
        setItems(res.items); // déjà filtrés sur "published"
        setTotal(res.total ?? res.items.length);

        const iris = Array.from(
          new Set(
            res.items
              .map((a) => a.categoryIri)
              .filter((v): v is string => !!v && !(v in catNames))
          )
        );
        if (iris.length) {
          const entries = await Promise.all(
            iris.map(async (iri) => {
              try {
                const cat = await categories.get(iri);
                return [iri, cat.name] as const;
              } catch {
                return [iri, "—"] as const;
              }
            })
          );
          setCatNames((prev) => {
            const next = { ...prev };
            for (const [iri, name] of entries) next[iri] = name;
            return next;
          });
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Blog Juridique
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Restez informé des dernières actualités juridiques, conseils
            pratiques et analyses d&apos;experts pour mieux comprendre le droit
            ivoirien.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
            {items.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={
                      post.imageUrl ||
                      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&h=300&fit=crop"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mb-2 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {(post.categoryObj?.name ||
                    (post.categoryIri && catNames[post.categoryIri])) && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2 w-fit">
                      {post.categoryObj?.name ||
                        catNames[post.categoryIri!] ||
                        "—"}
                    </span>
                  )}

                  <CardTitle className="line-clamp-2 text-base sm:text-lg">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-sm">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <Button
                    variant="outline"
                    className="w-full group text-sm"
                    asChild
                  >
                    <Link to={`/blog/${post.slug || post.id}`}>
                      Lire la suite
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-700">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
        {/* 
        <div className="mt-12 sm:mt-16 bg-red-900 rounded-lg p-6 sm:p-8 text-center text-white mx-2 sm:mx-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Abonnez-vous à notre newsletter juridique
          </h2>
          <p className="mb-6 text-sm sm:text-base">
            Recevez les dernières actualités juridiques directement dans votre
            boîte mail.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-2 rounded-md text-gray-900 text-sm"
            />
           
          </div>
        </div> */}
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
