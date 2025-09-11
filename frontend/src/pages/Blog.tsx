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
import { publicBlog as articlesApi } from "@/services/publicBlog";
import type { Article } from "@/services/publicBlog";
import NewsletterSection from "@/components/NewsletterSection";

const Blog = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await articlesApi.listPublic(page, pageSize);
        setItems(res.items);
        setTotal(res.total ?? res.items.length);
      } finally {
        setLoading(false);
      }
    };
    void load();
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

                  {(post.categoryName || post.categoryObj?.name) && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2 w-fit">
                      {post.categoryName || post.categoryObj?.name}
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

        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
