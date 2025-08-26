// src/modules/demandes/DemandeSuccessModal.tsx
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, ExternalLink } from "lucide-react";

type Props = {
  open: boolean;
  refCode: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseToHome: () => void;
  onCloseToOrders: () => void;
};

const DemandeSuccessModal: React.FC<Props> = ({
  open,
  refCode,
  userEmail,
  isAuthenticated,
  onOpenChange,
  onCloseToHome,
  onCloseToOrders,
}) => {
  const emailQuery = userEmail ? `?email=${encodeURIComponent(userEmail)}` : "";

  const handleCopy = () => {
    if (!refCode) return;
    navigator.clipboard
      .writeText(refCode)
      .then(() => {
        toast.success("Numéro copié dans le presse-papiers", {
          description:
            "Vous pouvez vous connecter ou réinitialiser votre mot de passe si nécessaire.",
          action: {
            label: "Se connecter",
            onClick: () => window.location.assign("/login"),
          },
          cancel: {
            label: "Mot de passe oublié",
            onClick: () =>
              window.location.assign(`/forgot-password${emailQuery}`),
          },
        });
      })
      .catch(() => toast.success("Copié !"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Demande envoyée avec succès
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">
            Merci ! Votre demande a bien été enregistrée.
          </p>

          <div className="rounded-lg border bg-gray-50 p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Numéro de demande</p>
              <p className="font-mono text-lg">{refCode || "—"}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Vous pouvez suivre l’avancement et échanger avec votre juriste
            depuis votre espace.
          </div>

          {!isAuthenticated && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-2">
              <p className="text-sm text-yellow-900 font-semibold">
                Accès à votre espace
              </p>
              <p className="text-sm text-yellow-800">
                Utilisez votre e-mail pour vous connecter. Si vous n’avez pas
                encore de mot de passe, utilisez{" "}
                <strong>« Mot de passe oublié »</strong> pour en définir un.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" asChild>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/forgot-password${emailQuery}`}>
                    Mot de passe oublié
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCloseToHome}>
            Fermer
          </Button>
          <Button
            className="bg-red-900 hover:bg-red-800"
            onClick={onCloseToOrders}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Suivre ma demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DemandeSuccessModal;
