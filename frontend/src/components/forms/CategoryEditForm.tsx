import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { categories, type Category } from "@/services/categories";

type Props = {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
  onSubmitted: () => Promise<void> | void;
};

export default function CategoryEditForm({
  open,
  category,
  onClose,
  onSubmitted,
}: Props) {
  const isEdit = !!category?.id;
  const [name, setName] = React.useState(category?.name ?? "");
  const [description, setDescription] = React.useState(
    category?.description ?? ""
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Le nom est requis.");
      return;
    }
    try {
      setLoading(true);
      if (isEdit) {
        await categories.update(category!.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
        toast.success("Catégorie mise à jour");
      } else {
        await categories.create({
          name: name.trim(),
          description: description.trim() || null,
        });
        toast.success("Catégorie créée");
      }
      await onSubmitted();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l’enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nom</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Droit des affaires"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description (optionnel)</Label>
            <Textarea
              id="cat-desc"
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Brève description de la catégorie…"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-red-900 hover:bg-red-800"
              disabled={loading}
            >
              {loading ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
