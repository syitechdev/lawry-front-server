
import LegalFormPresentation from "@/components/LegalFormPresentation";

const SarlPresentation = () => {
  const sarlData = {
    title: "SARL",
    description: "Société à Responsabilité Limitée, forme juridique la plus répandue pour les PME en Côte d'Ivoire.",
    advantages: [
      "Responsabilité limitée aux apports",
      "Souplesse de gestion",
      "Crédibilité renforcée auprès des tiers",
      "Possibilité d'avoir plusieurs associés",
      "Transmission facilitée des parts sociales"
    ],
    minCapital: "1 000 000 FCFA minimum",
    responsability: "Responsabilité limitée aux apports",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "La SARL (Société à Responsabilité Limitée) est la forme juridique la plus populaire pour les petites et moyennes entreprises en Côte d'Ivoire. Elle offre un excellent équilibre entre protection patrimoniale et flexibilité de gestion. Les associés ne sont responsables des dettes sociales qu'à hauteur de leurs apports, ce qui protège leur patrimoine personnel.",
    requirements: [
      "Minimum 2 associés (maximum 50)",
      "Capital social minimum de 1 000 000 FCFA",
      "Statuts rédigés et signés",
      "Justificatif de domiciliation",
      "Pièces d'identité des associés",
      "Procès-verbal de nomination du gérant"
    ],
    process: [
      "Rédaction des statuts et choix du gérant",
      "Dépôt du capital social en banque",
      "Enregistrement au CEPICI et obtention des documents officiels"
    ],
    faq: [
      {
        question: "Quelle est la différence entre une SARL et une SARLU ?",
        answer: "La SARL nécessite au minimum 2 associés tandis que la SARLU (Société à Responsabilité Limitée Unipersonnelle) n'a qu'un seul associé. Les règles de fonctionnement sont similaires."
      },
      {
        question: "Comment répartir les parts sociales entre associés ?",
        answer: "La répartition des parts sociales est libre et doit être définie dans les statuts. Elle peut être proportionnelle aux apports ou selon d'autres critères convenus entre associés."
      },
      {
        question: "Qui peut être gérant d'une SARL ?",
        answer: "Le gérant peut être un associé ou une personne extérieure à la société. Il peut être une personne physique ou morale, de nationalité ivoirienne ou étrangère."
      },
      {
        question: "Quelles sont les obligations comptables d'une SARL ?",
        answer: "Une SARL doit tenir une comptabilité conforme au système OHADA, établir des comptes annuels et les déposer au greffe du tribunal de commerce."
      },
      {
        question: "Comment modifier les statuts d'une SARL ?",
        answer: "Toute modification des statuts nécessite une décision des associés en assemblée générale extraordinaire et doit être enregistrée auprès des autorités compétentes."
      }
    ]
  };

  return <LegalFormPresentation formData={sarlData} />;
};

export default SarlPresentation;
