import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { enterpriseTypes } from "@/services/enterpriseTypes";

type Props = {
  open: boolean;
  onClose: () => void;
  item?: {
    id: number;
    sigle: string;
    signification: string;
    description?: string;
  } | null;
  onSubmitted?: () => Promise<void> | void;
};

export default function EnterpriseTypeEditForm({
  open,
  onClose,
  item,
  onSubmitted,
}: Props) {
  const isEdit = !!item?.id;

  const [form, setForm] = useState({
    sigle: "",
    signification: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        sigle: item.sigle ?? "",
        signification: item.signification ?? "",
        description: item.description ?? "",
      });
    } else {
      setForm({ sigle: "", signification: "", description: "" });
    }
  }, [item, open]);

  const onChange =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sigle.trim() || !form.signification.trim()) {
      toast.warning("Veuillez renseigner le sigle et la signification.");
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await enterpriseTypes.update(item!.id, form);
        toast.success("Type d’entreprise mis à jour");
      } else {
        await enterpriseTypes.create(form);
        toast.success("Type d’entreprise créé");
      }
      onClose();
      await onSubmitted?.();
    } catch (err: any) {
      toast.error(err?.message || "Échec de l’opération");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Modifier un type d’entreprise"
              : "Nouveau type d’entreprise"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Sigle</label>
            <Input
              value={form.sigle}
              onChange={(e) =>
                onChange("sigle")(
                  Object.assign(e, {
                    target: { value: e.target.value.toUpperCase() },
                  })
                )
              }
              placeholder="Ex: SARL, SAS, SA…"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Signification
            </label>
            <Input
              value={form.signification}
              onChange={onChange("signification")}
              placeholder="Ex: Société à Responsabilité Limitée"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={onChange("description")}
              placeholder="Description (facultatif)"
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-900 hover:bg-red-800"
            >
              {loading ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
