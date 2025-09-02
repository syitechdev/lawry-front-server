import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock } from "lucide-react";
import clsx from "clsx";

type DossierSearchFormProps = {
  onSubmit: (ref: string) => void | Promise<void>;
  value?: string;
  onChange?: (val: string) => void;
  initialValue?: string;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

export default function DossierSearchForm({
  onSubmit,
  value,
  onChange,
  initialValue = "",
  loading = false,
  disabled = false,
  placeholder = "Entrez votre numéro de dossier (ex: DEM-2025-000123)",
  autoFocus = false,
  className,
}: DossierSearchFormProps) {
  const isControlled =
    typeof value === "string" && typeof onChange === "function";
  const [internal, setInternal] = useState(initialValue);
  const currentValue = isControlled ? value! : internal;

  const handleChange = (v: string) => {
    if (isControlled) onChange!(v);
    else setInternal(v);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ref = currentValue.trim();
    if (!ref || disabled || loading) return;
    await onSubmit(ref);
  };

  return (
    <div
      className={clsx(
        "bg-white/70 backdrop-blur-sm p-6 rounded-lg max-w-3xl mx-auto mb-8 border border-gray-200 shadow-lg",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Suivi de dossier
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Input
            placeholder={placeholder}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1"
            disabled={disabled}
            autoFocus={autoFocus}
          />
          <Button
            type="submit"
            disabled={disabled || loading || !currentValue.trim()}
            className="bg-red-900 hover:bg-red-800 text-white"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Recherche...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Suivre
              </>
            )}
          </Button>
        </div>
      </form>

      <p className="text-sm text-gray-600 mt-2 text-center">
        Suivez l'état d'avancement de votre dossier en temps réel
      </p>
    </div>
  );
}
