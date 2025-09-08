import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";
import { getCurrentUser, isAuthenticated, type User } from "@/lib/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  product: { id: number; name: string; price_cfa: number } | null;
};

export default function BuyModal({ open, onClose, product }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const firstMissingRef = useRef<HTMLInputElement | null>(null);

  // Préremplir si connecté (champs toujours visibles/éditables)
  useEffect(() => {
    if (!open) return;
    const isGuest = !isAuthenticated();
    if (!isGuest) {
      const u = getCurrentUser() as (User & { phone?: string | null }) | null;
      if (u) {
        const parts = (u.name || "").trim().split(" ");
        const firstName = parts.slice(0, -1).join(" ") || u.name || "";
        const lastName = parts.slice(-1).join(" ") || "";
        setForm({
          firstName,
          lastName,
          email: u.email || "",
          phone: u.phone || "",
        });
      }
    } else {
      // invité : on laisse vide, l’utilisateur remplit
      setForm((s) => s);
    }
  }, [open]);

  const validate = () => {
    const missing: { key: keyof typeof form; label: string }[] = [];
    if (!form.firstName.trim())
      missing.push({ key: "firstName", label: "Prénom" });
    if (!form.lastName.trim()) missing.push({ key: "lastName", label: "Nom" });
    if (!form.email.trim()) missing.push({ key: "email", label: "Email" });
    if (!form.phone.trim()) missing.push({ key: "phone", label: "Téléphone" });

    if (missing.length) {
      // Un toast par champ manquant
      missing.forEach((m, idx) => {
        setTimeout(() => toast.error(`${m.label} est obligatoire`), idx * 80);
      });
      // Focus sur le premier manquant
      setTimeout(() => firstMissingRef.current?.focus(), 50);
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!product) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: any = {
        type: "boutique",
        id: product.id,
        channel: "web",
        customer: {
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
        },
      };

      const res = await initPayment(payload);
      const reference = res?.reference;
      if (reference) localStorage.setItem("lastPaymentRef", reference);

      if (res?.method && res?.action && res?.fields) {
        autoPost(res.action, res.fields, res.method);
      } else if (res?.url) {
        window.location.assign(res.url);
      } else {
        toast.error("Réponse paiement invalide.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erreur paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acheter {product?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Montant : <b>{product?.price_cfa.toLocaleString()} FCFA</b>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) =>
                setForm((s) => ({ ...s, firstName: e.target.value }))
              }
              ref={(el) => {
                if (!form.firstName && !firstMissingRef.current)
                  firstMissingRef.current = el;
              }}
            />
            <Input
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) =>
                setForm((s) => ({ ...s, lastName: e.target.value }))
              }
              ref={(el) => {
                if (!form.lastName && !firstMissingRef.current)
                  firstMissingRef.current = el;
              }}
            />
            <Input
              className="sm:col-span-2"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((s) => ({ ...s, email: e.target.value }))
              }
              ref={(el) => {
                if (!form.email && !firstMissingRef.current)
                  firstMissingRef.current = el;
              }}
            />
            <Input
              className="sm:col-span-2"
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) =>
                setForm((s) => ({ ...s, phone: e.target.value }))
              }
              ref={(el) => {
                if (!form.phone && !firstMissingRef.current)
                  firstMissingRef.current = el;
              }}
            />
          </div>

          <Button
            disabled={loading || !product}
            className="w-full bg-red-900 hover:bg-red-800"
            onClick={submit}
          >
            {loading ? "Redirection..." : "Payer maintenant"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
