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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Scale, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";
import type { AxiosError } from "axios";

const PolitiqueDeConfidentialitee = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      <Header />

      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-6xl gap-8 items-start">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>
                Politique de Confidentialité & Mentions Légales – LegalTech
                LAWRY
              </CardTitle>
              <CardDescription>
                Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm sm:prose base prose-headings:scroll-mt-24 max-w-none">
                <p>
                  Bienvenue sur la plateforme LegalTech LAWRY. La protection de
                  vos données personnelles est une priorité. Cette page vous
                  explique en toute transparence :
                </p>
                <ul className="list-disc pl-6">
                  <li>Quelles données nous collectons,</li>
                  <li>Comment elles sont utilisées,</li>
                  <li>Vos droits et la manière de les exercer.</li>
                </ul>

                <h2 id="qui-sommes-nous">1. Qui sommes-nous ?</h2>
                <p>
                  Cabinet LAWRY Conseils – LegalTech, SARLU, Siège social :
                  Abidjan, Cocody Faya, rond-point de la cité SIR ; RCCM :
                  CI-ABJ-03-2022-B13-05509 ; (NCC) : —<br />
                  Téléphone : 0101987580 / 0709122074
                  <br />
                  Email : {/* Non fourni dans le contenu source */} —
                </p>

                <h2 id="donnees-collectees">
                  2. Quelles données collectons-nous ?
                </h2>
                <p>
                  Lorsque vous utilisez notre site ou nos services, nous
                  collectons :
                </p>
                <ul className="list-disc pl-6">
                  <li>
                    Vos informations d’identification : nom, prénom, email,
                    téléphone, entreprise.
                  </li>
                  <li>
                    Vos informations de connexion : identifiant, mot de passe
                    (chiffré), adresse IP.
                  </li>
                  <li>
                    Vos documents juridiques : contrats, pièces partagées sur la
                    plateforme.
                  </li>
                  <li>Vos informations de paiement (sécurisées).</li>
                </ul>

                <h2 id="pourquoi">3. Pourquoi collectons-nous vos données ?</h2>
                <ul className="list-disc pl-6">
                  <li>
                    Gérer votre compte et vous donner accès à nos services.
                  </li>
                  <li>Traiter vos demandes juridiques et assurer un suivi.</li>
                  <li>Améliorer nos services.</li>
                  <li>Assurer la sécurité du site.</li>
                  <li>Respecter nos obligations légales.</li>
                </ul>

                <h2 id="base-legale">4. Base légale</h2>
                <ul className="list-disc pl-6">
                  <li>RGPD (si vous êtes situé dans l’UE).</li>
                  <li>
                    Loi ivoirienne n°2013-450 du 19 juin 2013 relative à la
                    protection des données à caractère personnel.
                  </li>
                </ul>

                <h2 id="partage">5. Avec qui partageons-nous vos données ?</h2>
                <p>
                  Vos données restent confidentielles. Elles peuvent être
                  partagées uniquement avec :
                </p>
                <ul className="list-disc pl-6">
                  <li>Nos collaborateurs internes habilités,</li>
                  <li>
                    Nos prestataires techniques (hébergement, paiement
                    sécurisé),
                  </li>
                  <li>Les autorités si la loi l’exige.</li>
                </ul>
                <p>Nous ne vendons jamais vos données.</p>

                <h2 id="durees">
                  6. Combien de temps conservons-nous vos données ?
                </h2>
                <ul className="list-disc pl-6">
                  <li>Compte utilisateur : tant que vous êtes actif.</li>
                  <li>Facturation : 10 ans (obligation légale).</li>
                  <li>Données de navigation : 13 mois maximum.</li>
                </ul>

                <h2 id="securite">7. Sécurité</h2>
                <p>
                  Nous utilisons des mesures avancées (chiffrement, serveurs
                  sécurisés, audits réguliers) pour protéger vos données contre
                  tout accès non autorisé.
                </p>

                <h2 id="droits">8. Vos droits</h2>
                <ul className="list-disc pl-6">
                  <li>Accéder à vos données</li>
                  <li>Les corriger ou les supprimer</li>
                  <li>Limiter ou refuser leur traitement</li>
                  <li>Retirer votre consentement</li>
                  <li>Demander la portabilité</li>
                </ul>
                <p>
                  📩 Pour exercer vos droits :{" "}
                  <a
                    className="underline"
                    href="https://lawry-conseilsci.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://lawry-conseilsci.com
                  </a>
                </p>

                <h2 id="cookies">9. Cookies 🍪</h2>
                <p>
                  Notre site utilise des cookies pour améliorer votre
                  expérience. Vous pouvez accepter tous les cookies, refuser ou
                  personnaliser vos choix depuis le bandeau prévu à cet effet.
                </p>

                <h2 id="pi">10. Propriété intellectuelle</h2>
                <p>
                  Tous les contenus de la plateforme (textes, logos, visuels,
                  documents) sont protégés et appartiennent au Cabinet LAWRY,
                  sauf mention contraire.
                </p>

                <h2 id="maj">11. Mise à jour de cette politique</h2>
                <p>
                  Cette politique peut être modifiée à tout moment pour refléter
                  nos pratiques ou des obligations légales. La version la plus
                  récente sera toujours disponible ici.
                </p>

                <h2 id="contact">12. Contact</h2>
                <p>
                  Cabinet LAWRY – LegalTech
                  <br />
                  📍 Adresse : Cocody Faya, rond-point de la cité SIR
                  <br />
                  📞 Téléphone : 0101987580 / 0709122074
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PolitiqueDeConfidentialitee;
