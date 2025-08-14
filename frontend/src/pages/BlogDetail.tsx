
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";

const BlogDetail = () => {
  const { id } = useParams();

  // Mock data - dans un vrai projet, cela viendrait d'une API
  const blogPosts = [
    {
      id: 1,
      title: "Les nouvelles réformes du droit du travail en Côte d'Ivoire",
      excerpt: "Découvrez les dernières modifications apportées au code du travail ivoirien et leur impact sur les entreprises.",
      content: `
        <p>Les récentes modifications du code du travail ivoirien marquent une étape importante dans l'évolution du droit social en Côte d'Ivoire. Ces réformes visent à moderniser les relations de travail et à mieux protéger les droits des travailleurs.</p>
        
        <h3>Principales modifications</h3>
        <p>Les changements les plus significatifs concernent :</p>
        <ul>
          <li>La durée légale du travail</li>
          <li>Les congés payés</li>
          <li>Les conditions de licenciement</li>
          <li>La protection de la maternité</li>
        </ul>
        
        <h3>Impact sur les entreprises</h3>
        <p>Ces modifications imposent aux entreprises de revoir leurs pratiques RH et leurs contrats de travail. Il est essentiel de se conformer rapidement à ces nouvelles dispositions pour éviter tout contentieux.</p>
        
        <h3>Conseils pratiques</h3>
        <p>Nous recommandons aux entreprises de :</p>
        <ul>
          <li>Auditer leurs contrats de travail existants</li>
          <li>Former leurs équipes RH aux nouvelles dispositions</li>
          <li>Mettre à jour leur règlement intérieur</li>
          <li>Consulter un expert juridique pour s'assurer de la conformité</li>
        </ul>
      `,
      author: "Me. Lawry",
      date: "15 Mars 2024",
      category: "Droit du travail",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Comment créer une SARL en Côte d'Ivoire : Guide complet",
      excerpt: "Toutes les étapes détaillées pour créer votre société à responsabilité limitée en conformité avec la législation ivoirienne.",
      content: `
        <p>La création d'une SARL (Société à Responsabilité Limitée) en Côte d'Ivoire nécessite de suivre plusieurs étapes précises définies par la législation OHADA.</p>
        
        <h3>Étapes préliminaires</h3>
        <p>Avant de commencer les démarches officielles :</p>
        <ul>
          <li>Choisir la dénomination sociale</li>
          <li>Définir l'objet social</li>
          <li>Déterminer le capital social minimum</li>
          <li>Identifier les associés</li>
        </ul>
        
        <h3>Démarches administratives</h3>
        <p>Les principales étapes incluent :</p>
        <ul>
          <li>Rédaction des statuts</li>
          <li>Dépôt du capital social</li>
          <li>Enregistrement au Guichet Unique</li>
          <li>Publication au Journal Officiel</li>
        </ul>
        
        <h3>Documents requis</h3>
        <p>La constitution du dossier nécessite plusieurs documents officiels que notre cabinet peut vous aider à préparer.</p>
      `,
      author: "Me. Lawry",
      date: "10 Mars 2024",
      category: "Création d'entreprise",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Protection des données personnelles : Obligations des entreprises",
      excerpt: "Les nouvelles obligations en matière de protection des données personnelles pour les entreprises ivoiriennes.",
      content: `
        <p>Avec l'évolution du numérique, la protection des données personnelles devient un enjeu majeur pour toutes les entreprises ivoiriennes.</p>
        
        <h3>Cadre juridique</h3>
        <p>La loi ivoirienne sur la protection des données personnelles impose de nouvelles obligations aux entreprises qui collectent et traitent des données personnelles.</p>
        
        <h3>Obligations principales</h3>
        <ul>
          <li>Déclaration des traitements</li>
          <li>Consentement des personnes</li>
          <li>Sécurisation des données</li>
          <li>Droit à l'effacement</li>
        </ul>
        
        <h3>Sanctions</h3>
        <p>Le non-respect de ces obligations peut entraîner des sanctions administratives et pénales importantes.</p>
      `,
      author: "Me. Lawry",
      date: "5 Mars 2024",
      category: "Droit numérique",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop"
    }
  ];

  const post = blogPosts.find(p => p.id === parseInt(id || "0"));

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
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
        {/* Navigation */}
        <div className="mb-6 sm:mb-8">
          <Button variant="outline" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-video bg-gray-200 overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 sm:p-8">
            {/* Meta info */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none text-justify"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Partager cet article
                </h3>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Besoin d'aide juridique ?
              </h3>
              <p className="text-gray-700 mb-4">
                Nos experts sont à votre disposition pour vous accompagner dans vos démarches juridiques.
              </p>
              <Button className="bg-red-900 hover:bg-red-800" asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
