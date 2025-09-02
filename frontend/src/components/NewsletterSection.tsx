import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { newsletterSubscribe } from "@/services/newsletter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  className?: string;
  placeholder?: string;
  buttonLabel?: string;
  variant?: "inline" | "block";
  onSuccess?: () => void;
};

const schema = z.object({
  email: z
    .string({ required_error: "Email requis" })
    .min(1, "Email requis")
    .email("Email invalide")
    .transform((v) => v.trim()),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const NewsletterSection: React.FC<Props> = ({
  title = "Abonnez-vous à notre newsletter juridique",
  description = "Recevez les dernières actualités juridiques directement dans votre boîte mail.",
  className,
  placeholder = "Votre adresse email",
  buttonLabel = "S’abonner",
  variant = "inline",
  onSuccess,
}) => {
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", website: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if ((values.website || "").trim().length > 0) return;

    try {
      await newsletterSubscribe({ email: values.email });
      setDone(true);
      toast({
        title: "Inscription réussie ",
        description: "Merci ! Vous recevrez bientôt nos actualités.",
      });
      reset({ email: "", website: "" });
      onSuccess?.();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Une erreur est survenue.";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    }
  };

  return (
    <div
      className={`mt-12 sm:mt-16 bg-red-900 rounded-lg p-6 sm:p-8 text-center text-white mx-2 sm:mx-0 ${
        className || ""
      }`}
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
      <p className="mb-6 text-sm sm:text-base">{description}</p>

      {done && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 text-green-800 px-3 py-2 text-sm">
          Inscription enregistrée. Merci !
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={
          variant === "inline"
            ? "flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 max-w-md mx-auto"
            : "max-w-md mx-auto space-y-3 text-left"
        }
      >
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
          {...register("website")}
        />

        {variant === "block" && <Label htmlFor="newsletter-email">Email</Label>}

        <Input
          id="newsletter-email"
          type="email"
          placeholder={placeholder}
          className={
            variant === "inline"
              ? "flex-1 px-4 py-2 rounded-md text-gray-900 text-sm"
              : "text-gray-900"
          }
          {...register("email")}
        />

        {variant === "inline" ? (
          <Button
            type="submit"
            className="bg-white text-red-900 hover:bg-gray-100 text-sm px-6"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi…
              </>
            ) : (
              buttonLabel
            )}
          </Button>
        ) : (
          <Button
            type="submit"
            className="bg-white text-red-900 hover:bg-gray-100 w-full"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi…
              </>
            ) : (
              buttonLabel
            )}
          </Button>
        )}

        {errors.email && (
          <p className="text-left text-xs text-red-200 sm:col-span-2">
            {errors.email.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default NewsletterSection;
