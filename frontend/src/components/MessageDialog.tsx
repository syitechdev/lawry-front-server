
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface MessageDialogProps {
  onSendMessage: (message: string) => void;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "ghost";
  className?: string;
}

const MessageDialog = ({ 
  onSendMessage, 
  triggerText = "Envoyer un message",
  triggerVariant = "outline",
  className = "w-full"
}: MessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Veuillez saisir un message");
      return;
    }
    
    onSendMessage(message);
    setMessage("");
    setOpen(false);
    toast.success("Message envoyé");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={className}>
          <MessageSquare className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envoyer un message au client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <div className="flex space-x-2">
            <Button onClick={handleSend} className="flex-1">
              Envoyer
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
