
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Les nouvelles réformes du droit du travail en Côte d'Ivoire",
      excerpt: "Découvrez les dernières modifications apportées au code du travail ivoirien et leur impact sur les entreprises.",
      author: "Me. Lawry",
      date: "15 Mars 2024",
      category: "Droit du travail",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Comment créer une SARL en Côte d'Ivoire : Guide complet",
      excerpt: "Toutes les étapes détaillées pour créer votre société à responsabilité limitée en conformité avec la législation ivoirienne.",
      author: "Me. Lawry",
      date: "10 Mars 2024",
      category: "Création d'entreprise",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Protection des données personnelles : Obligations des entreprises",
      excerpt: "Les nouvelles obligations en matière de protection des données personnelles pour les entreprises ivoiriennes.",
      author: "Me. Lawry",
      date: "5 Mars 2024",
      category: "Droit numérique",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Blog Juridique
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Restez informé des dernières actualités juridiques, conseils pratiques 
            et analyses d'experts pour mieux comprendre le droit ivoirien.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mb-2 space-y-1 sm:space-y-0">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{post.author}</span>
                  </div>
                </div>
                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2 w-fit">
                  {post.category}
                </span>
                <CardTitle className="line-clamp-2 text-base sm:text-lg">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3 text-sm">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button variant="outline" className="w-full group text-sm" asChild>
                  <Link to={`/blog/${post.id}`}>
                    Lire la suite
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 sm:mt-16 bg-red-900 rounded-lg p-6 sm:p-8 text-center text-white mx-2 sm:mx-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Abonnez-vous à notre newsletter juridique
          </h2>
          <p className="mb-6 text-sm sm:text-base">
            Recevez les dernières actualités juridiques directement dans votre boîte mail.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-2 rounded-md text-gray-900 text-sm"
            />
            <Button className="bg-white text-red-900 hover:bg-gray-100 text-sm px-6">
              S'abonner
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
