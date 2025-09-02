import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import RequireAuth from "@/components/auth/RequireAuth";

// Pages publiques
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Formation from "./pages/Formation";
import Blog from "./pages/Blog";
import AdminCategories from "./pages/admin/AdminCategories";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Conseil from "./pages/Conseil";
import ConseilGratuit from "./pages/ConseilGratuit";
import Boutique from "./pages/Boutique";
import Cart from "./pages/Cart";
import ChatBot from "./pages/ChatBot";
import DossierTracking from "./pages/DossierTracking";
import CreerEntreprise from "./pages/CreerEntreprise";
import SasCreation from "./pages/SasCreation";
import SasPresentation from "./pages/SasPresentation";
import SarlCreation from "./pages/SarlCreation";
import SarlPresentation from "./pages/SarlPresentation";
import SarluCreation from "./pages/SarluCreation";
import SarluCreationNew from "./pages/SarluCreationNew";
import SarluPresentation from "./pages/SarluPresentation";
import SaCreation from "./pages/SaCreation";
import SaPresentation from "./pages/SaPresentation";
import SauCreation from "./pages/SauCreation";
import SauPresentation from "./pages/SauPresentation";
import SasuCreation from "./pages/SasuCreation";
import SasuPresentation from "./pages/SasuPresentation";
import SciCreation from "./pages/SciCreation";
import SciPresentation from "./pages/SciPresentation";
import ScoopCreation from "./pages/ScoopCreation";
import ScoopPresentation from "./pages/ScoopPresentation";
import EntrepriseIndividuelleCreation from "./pages/EntrepriseIndividuelleCreation";
import EntrepriseIndividuellePresentation from "./pages/EntrepriseIndividuellePresentation";
import AutoEntrepreneurPresentation from "./pages/AutoEntrepreneurPresentation";
import EurlPresentation from "./pages/EurlPresentation";
import AssociationCreation from "./pages/AssociationCreation";
import AssociationPresentation from "./pages/AssociationPresentation";
import OngCreation from "./pages/OngCreation";
import OngPresentation from "./pages/OngPresentation";
import FondationCreation from "./pages/FondationCreation";
import FondationPresentation from "./pages/FondationPresentation";
import ContractCreation from "./pages/ContractCreation";
import RedactionContrat from "./pages/RedactionContrat";
import RedactionContratForm from "./pages/RedactionContratForm";
import LegalConsultation from "./pages/LegalConsultation";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import PaymentReturn from "@/pages/PaymentReturn";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";

// Admin
import AdminDemandes from "./pages/admin/AdminDemandes";
import AdminClients from "./pages/admin/AdminClients";
import AdminServices from "./pages/admin/AdminServices";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBoutique from "./pages/admin/AdminBoutique";
import AdminFormations from "./pages/admin/AdminFormations";
import AdminParametres from "./pages/admin/AdminParametres";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminDemandeDetail from "./pages/admin/AdminDemandeDetail";
import AdminEnterpriseTypes from "./pages/admin/AdminEnterpriseTypes";
import AdminFormationRegistrations from "@/pages/admin/AdminFormationRegistrations";
import AdminRegistrationDetail from "@/pages/admin/AdminRegistrationDetail";
import DemandesList from "@/pages/admin/DemandesList";
import AdminRedigerContrat from "./pages/admin/types/AdminRedigerContrat";
import AdminSefaireConseiler from "@/pages/admin/types/AdminSefaireConseiler";
import AdminEnterpriseTypeOffers from "@/pages/admin/types/AdminEnterpriseTypeOffers";
import AdminContacts from "@/pages/admin/AdminContacts";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminConseils from "./pages/admin/AdminConseils";

// Client
import ClientCommandes from "./pages/client/ClientCommandes";
import ClientPaiements from "./pages/client/ClientPaiements";
import ClientBoutique from "./pages/client/ClientBoutique";
import ClientProfil from "./pages/client/ClientProfil";
import ClientDemandeDetail from "./pages/client/ClientDemandeDetail";
import ClientPlans from "./pages/client/ClientPlans";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* ===== Routes PUBLIQUES ===== */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/formation" element={<Formation />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/conseil" element={<Conseil />} />
              <Route path="/conseil-gratuit" element={<ConseilGratuit />} />
              <Route path="/boutique" element={<Boutique />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/chatbot" element={<ChatBot />} />
              <Route path="/suivi-dossier" element={<DossierTracking />} />
              <Route path="/suivi-dossier/:ref" element={<DossierTracking />} />

              <Route path="/payment/return" element={<PaymentReturn />} />

              {/* Présentations */}
              <Route path="/creer-entreprise" element={<CreerEntreprise />} />
              <Route
                path="/creer-entreprise/sas"
                element={<SasPresentation />}
              />
              <Route
                path="/creer-entreprise/sarl"
                element={<SarlPresentation />}
              />
              <Route
                path="/creer-entreprise/sarlu"
                element={<SarluPresentation />}
              />
              <Route path="/creer-entreprise/sa" element={<SaPresentation />} />
              <Route
                path="/creer-entreprise/sau"
                element={<SauPresentation />}
              />
              <Route
                path="/creer-entreprise/sasu"
                element={<SasuPresentation />}
              />
              <Route
                path="/creer-entreprise/sci"
                element={<SciPresentation />}
              />
              <Route
                path="/creer-entreprise/scoop"
                element={<ScoopPresentation />}
              />
              <Route
                path="/creer-entreprise/entreprise-individuelle"
                element={<EntrepriseIndividuellePresentation />}
              />
              <Route
                path="/creer-entreprise/association"
                element={<AssociationPresentation />}
              />
              <Route
                path="/creer-entreprise/ong"
                element={<OngPresentation />}
              />
              <Route
                path="/creer-entreprise/fondation"
                element={<FondationPresentation />}
              />

              {/* Formulaires */}
              <Route
                path="/creer-entreprise/sas/formulaire"
                element={<SasCreation />}
              />
              <Route
                path="/creer-entreprise/sarl/formulaire"
                element={<SarlCreation />}
              />
              <Route
                path="/creer-entreprise/sarlu/formulaire"
                element={<SarluCreation />}
              />
              <Route
                path="/creer-entreprise/sarlu/nouveau-formulaire"
                element={<SarluCreationNew />}
              />
              <Route
                path="/creer-entreprise/sa/formulaire"
                element={<SaCreation />}
              />
              <Route
                path="/creer-entreprise/sau/formulaire"
                element={<SauCreation />}
              />
              <Route
                path="/creer-entreprise/sasu/formulaire"
                element={<SasuCreation />}
              />
              <Route
                path="/creer-entreprise/sci/formulaire"
                element={<SciCreation />}
              />
              <Route
                path="/creer-entreprise/scoop/formulaire"
                element={<ScoopCreation />}
              />
              <Route
                path="/creer-entreprise/entreprise-individuelle/formulaire"
                element={<EntrepriseIndividuelleCreation />}
              />
              <Route
                path="/creer-entreprise/association/formulaire"
                element={<AssociationCreation />}
              />
              <Route
                path="/creer-entreprise/ong/formulaire"
                element={<OngCreation />}
              />
              <Route
                path="/creer-entreprise/fondation/formulaire"
                element={<FondationCreation />}
              />

              {/* Compatibilité ancienne */}
              <Route path="/sas-creation" element={<SasCreation />} />
              <Route path="/sas-presentation" element={<SasPresentation />} />
              <Route path="/sarl-creation" element={<SarlCreation />} />
              <Route path="/sarl-presentation" element={<SarlPresentation />} />
              <Route path="/sarlu-creation" element={<SarluCreation />} />
              <Route
                path="/sarlu-creation-new"
                element={<SarluCreationNew />}
              />
              <Route
                path="/sarlu-presentation"
                element={<SarluPresentation />}
              />
              <Route path="/sa-creation" element={<SaCreation />} />
              <Route path="/sa-presentation" element={<SaPresentation />} />
              <Route path="/sau-creation" element={<SauCreation />} />
              <Route path="/sau-presentation" element={<SauPresentation />} />
              <Route path="/sasu-creation" element={<SasuCreation />} />
              <Route path="/sasu-presentation" element={<SasuPresentation />} />
              <Route path="/sci-creation" element={<SciCreation />} />
              <Route path="/sci-presentation" element={<SciPresentation />} />
              <Route path="/scoop-creation" element={<ScoopCreation />} />
              <Route
                path="/scoop-presentation"
                element={<ScoopPresentation />}
              />
              <Route
                path="/entreprise-individuelle-creation"
                element={<EntrepriseIndividuelleCreation />}
              />
              <Route
                path="/entreprise-individuelle-presentation"
                element={<EntrepriseIndividuellePresentation />}
              />
              <Route
                path="/auto-entrepreneur-presentation"
                element={<AutoEntrepreneurPresentation />}
              />
              <Route path="/eurl-presentation" element={<EurlPresentation />} />
              <Route
                path="/association-creation"
                element={<AssociationCreation />}
              />
              <Route
                path="/association-presentation"
                element={<AssociationPresentation />}
              />
              <Route path="/ong-creation" element={<OngCreation />} />
              <Route path="/ong-presentation" element={<OngPresentation />} />
              <Route
                path="/fondation-creation"
                element={<FondationCreation />}
              />
              <Route
                path="/fondation-presentation"
                element={<FondationPresentation />}
              />

              {/* Services juridiques */}
              <Route path="/contract-creation" element={<ContractCreation />} />
              <Route path="/redaction-contrat" element={<RedactionContrat />} />
              <Route
                path="/redaction-contrat/formulaire"
                element={<RedactionContratForm />}
              />
              <Route
                path="/legal-consultation"
                element={<LegalConsultation />}
              />

              {/* ===== ROUTES PROTÉGÉES ADMIN ===== */}
              <Route element={<RequireAuth roles={["Admin"]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/demandes" element={<AdminDemandes />} />
                <Route
                  path="/admin/demandes/types/:slug"
                  element={<DemandesList />}
                />

                <Route path="/admin/clients" element={<AdminClients />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/boutique" element={<AdminBoutique />} />
                <Route path="/admin/formations" element={<AdminFormations />} />
                <Route path="/admin/contacts" element={<AdminContacts />} />
                <Route
                  path="/admin/types/rediger-contrat"
                  element={<AdminRedigerContrat />}
                />
                <Route
                  path="/admin/types/se-faire-conseiller"
                  element={<AdminSefaireConseiler />}
                />
                <Route
                  path="/admin/types-entreprise/:sigle/offres"
                  element={<AdminEnterpriseTypeOffers />}
                />

                <Route
                  path="/admin/inscriptions"
                  element={<AdminFormationRegistrations />}
                />
                <Route path="/admin/plans" element={<AdminPlans />} />
                <Route
                  path="/admin/types-entreprise"
                  element={<AdminEnterpriseTypes />}
                />
                <Route
                  path="/admin/types/creer-entreprise"
                  element={<AdminEnterpriseTypes />}
                />
                <Route path="/admin/parametres" element={<AdminParametres />} />
                <Route
                  path="/admin/inscription/:id"
                  element={<AdminRegistrationDetail />}
                />

                <Route
                  path="/admin/demande/:id"
                  element={<AdminDemandeDetail />}
                />
                <Route path="/admin/newsletter" element={<AdminNewsletter />} />
                <Route
                  path="/admin/conseils-gratuits"
                  element={<AdminConseils />}
                />
              </Route>

              {/* ===== ROUTES PROTÉGÉES CLIENT ===== */}
              <Route element={<RequireAuth roles={["Client"]} />}>
                <Route path="/client" element={<ClientDashboard />} />
                <Route path="/client/commandes" element={<ClientCommandes />} />
                <Route path="/client/paiements" element={<ClientPaiements />} />
                <Route path="/client/boutique" element={<ClientBoutique />} />
                <Route path="/client/plans" element={<ClientPlans />} />
                <Route path="/client/profil" element={<ClientProfil />} />
                <Route
                  path="/client/demande/:id"
                  element={<ClientDemandeDetail />}
                />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
