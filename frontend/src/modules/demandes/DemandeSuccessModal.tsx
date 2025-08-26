import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ExternalLink, Lock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function DemandeSuccessModal(props: {
  open: boolean;
  refCode?: string | null;
  userEmail?: string | null;
  isAuthenticated?: boolean;
  onCloseToHome: () => void;
  onCloseToOrders: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const {
    open,
    refCode,
    userEmail,
    isAuthenticated,
    onCloseToHome,
    onCloseToOrders,
    onOpenChange,
  } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Demande envoyée avec succès
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Numéro de demande</p>
              <p className="font-mono text-lg">{refCode || "—"}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                refCode &&
                navigator.clipboard
                  .writeText(refCode)
                  .then(() => toast.success("Numéro copié"))
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {!isAuthenticated && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-2">
              <p className="text-sm text-yellow-900 font-semibold flex items-center">
                <Lock className="h-4 w-4 mr-2" /> Compte créé automatiquement
              </p>
              <p className="text-sm text-yellow-800">
                Un compte a été créé avec votre e-mail
                {userEmail ? <strong> {userEmail}</strong> : ""}. Rendez-vous
                sur la page de connexion puis utilisez{" "}
                <strong>« Mot de passe oublié »</strong>.
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" asChild>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link
                    to={`/forgot-password${
                      userEmail ? `?email=${encodeURIComponent(userEmail)}` : ""
                    }`}
                  >
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
            <ExternalLink className="h-4 w-4 mr-2" /> Suivre ma demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
