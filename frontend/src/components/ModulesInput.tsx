import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type Props = {
  value?: string[];
  onChange?: (modules: string[]) => void;
  placeholder?: string;
  maxItems?: number;
};

export default function ModulesInput({
  value = [],
  onChange,
  placeholder = "Ajouter un module",
  maxItems,
}: Props) {
  const [newModule, setNewModule] = useState("");
  const modules = Array.isArray(value) ? value : [];
  const add = () => {
    const v = (newModule ?? "").trim();
    if (!v) return;
    const next = [...modules, v];
    if (maxItems && next.length > maxItems) return;
    onChange?.(next);
    setNewModule("");
  };
  const remove = (index: number) => {
    const next = modules.slice(0, index).concat(modules.slice(index + 1));
    onChange?.(next);
  };
  const updateItem = (index: number, val: string) => {
    const next = modules.slice();
    next[index] = val;
    onChange?.(next.map((m) => (m ?? "").trim()).filter(Boolean));
  };
  const onKeyAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {modules.map((m, i) => (
          <div
            key={i}
            className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
          >
            <input
              className="bg-transparent text-sm text-gray-600 outline-none w-44"
              value={m}
              onChange={(e) => updateItem(i, e.target.value)}
            />
            <Button variant="ghost" size="icon" onClick={() => remove(i)}>
              <Minus className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newModule}
          onChange={(e) => setNewModule(e.target.value)}
          onKeyDown={onKeyAdd}
          placeholder={placeholder}
        />
        <Button onClick={add} className="bg-red-900 hover:bg-red-800">
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </div>
      <p className="text-sm text-gray-400">
        Les modules apparaîtront dans la fiche détaillée.
      </p>
    </div>
  );
}
