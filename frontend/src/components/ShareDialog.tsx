import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Link as LinkIcon, Mail, Send } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  url?: string;
  text?: string;
};

function shareUrls({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text?: string;
}) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const d = encodeURIComponent(text || "");
  return {
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    whatsapp: `https://api.whatsapp.com/send?text=${t}%20${u}`,
    email: `mailto:?subject=${t}&body=${d}%0A%0A${u}`,
  };
}

export default function ShareDialog({
  open,
  onOpenChange,
  title,
  url,
  text,
}: Props) {
  const finalUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const links = React.useMemo(
    () => shareUrls({ url: finalUrl, title, text }),
    [finalUrl, title, text]
  );

  const onNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: finalUrl });
        onOpenChange(false);
      } catch {
        /* cancel */
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(finalUrl);
      alert("Lien copié !");
    } catch {
      window.prompt("Copiez le lien :", finalUrl);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Partager cet article</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="bg-black text-white hover:bg-white hover:text-black"
            onClick={() =>
              window.open(links.x, "_blank", "noopener,noreferrer")
            }
          >
            {/* X / Twitter */}
            <Share2 className="h-4 w-4 mr-2" />X (Twitter)
          </Button>
          <Button
            variant="outline"
            className="bg-blue-500 text-white hover:bg-blue-800"
            onClick={() =>
              window.open(links.facebook, "_blank", "noopener,noreferrer")
            }
          >
            <Share2 className="h-4 w-4 mr-2" />
            Facebook
          </Button>
          <Button
            variant="outline"
            className="bg-blue-700 text-white hover:bg-blue-900"
            onClick={() =>
              window.open(links.linkedin, "_blank", "noopener,noreferrer")
            }
          >
            <Share2 className="h-4 w-4 mr-2" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            className="bg-green-500 text-white hover:bg-green-700"
            onClick={() =>
              window.open(links.whatsapp, "_blank", "noopener,noreferrer")
            }
          >
            <Send className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="bg-red-600 text-white hover:bg-red-800"
            onClick={() => (window.location.href = links.email)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={copyLink}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Copier le lien
          </Button>
        </div>

        {/* Bouton de partage natif si dispo */}
        {"share" in navigator && (
          <div className="pt-2">
            <Button className="w-full" onClick={onNativeShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Partage natif
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
