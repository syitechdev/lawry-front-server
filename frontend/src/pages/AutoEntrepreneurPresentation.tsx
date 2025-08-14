
import LegalFormPresentation from "@/components/LegalFormPresentation";

const AutoEntrepreneurPresentation = () => {
  const autoEntrepreneurData = {
    title: "Auto-entrepreneur",
    description: "Régime simplifié pour exercer une activité professionnelle en toute simplicité.",
    advantages: [
      "Formalités de création simplifiées",
      "Comptabilité allégée",
      "Charges sociales proportionnelles au chiffre d'affaires",
      "Pas de TVA jusqu'à certains seuils",
      "Possibilité de cumul avec un salariat"
    ],
    minCapital: "Aucun capital requis",
    responsability: "Responsabilité illimitée sur patrimoine personnel",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "Le régime de l'auto-entrepreneur (ou micro-entrepreneur) est conçu pour faciliter la création et la gestion d'une activité professionnelle individuelle. Il offre un cadre juridique simplifié avec des obligations comptables et fiscales allégées, idéal pour débuter une activité ou exercer un complément de revenus.",
    requirements: [
      "Être une personne physique",
      "Respecter les seuils de chiffre d'affaires",
      "Avoir une activité autorisée",
      "Domiciliation de l'activité",
      "Assurance professionnelle si nécessaire",
      "Compte bancaire professionnel recommandé"
    ],
    process: [
      "Déclaration d'activité en ligne",
      "Obtention du numéro SIRET",
      "Ouverture des droits et début d'activité"
    ],
    faq: [
      {
        question: "Quels sont les seuils de chiffre d'affaires à respecter ?",
        answer: "Les seuils varient selon l'activité : vente de marchandises, prestations de services commerciales ou libérales. Le dépassement entraîne une sortie du régime."
      },
      {
        question: "Peut-on embaucher des salariés en auto-entrepreneur ?",
        answer: "Non, le régime auto-entrepreneur ne permet pas d'embaucher des salariés. Il faut alors créer une société."
      },
      {
        question: "Comment fonctionne la facturation en auto-entrepreneur ?",
        answer: "Les factures doivent mentionner des informations obligatoires et respecter les règles de facturation. La TVA n'est pas applicable sous certains seuils."
      },
      {
        question: "Peut-on cumuler auto-entrepreneur et salariat ?",
        answer: "Oui, sous certaines conditions et en respectant les clauses du contrat de travail, notamment la clause de non-concurrence."
      },
      {
        question: "Comment arrêter son activité d'auto-entrepreneur ?",
        answer: "Il suffit de faire une déclaration de cessation d'activité auprès du centre de formalités des entreprises compétent."
      }
    ]
  };

  return <LegalFormPresentation formData={autoEntrepreneurData} />;
};

export default AutoEntrepreneurPresentation;
