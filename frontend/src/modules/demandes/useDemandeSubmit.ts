import { useState } from "react";
import { http } from "@/lib/http";
import {
  getCurrentUserSafe,
  isAuthenticated as isAuth,
  isAdminUser,
} from "@/lib/user";

function pickRef(res: any): string | null {
  return (
    res?.ref ||
    res?.data?.ref ||
    res?.demande?.ref ||
    res?.demande?.data?.ref ||
    null
  );
}

export function useDemandeSubmit() {
  const [open, setOpen] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(isAuth());

  async function submit(
    payload: FormData | Record<string, any>,
    opts?: { emailField?: string }
  ) {
    const me = getCurrentUserSafe();
    if (isAuth() && isAdminUser(me)) {
      const err = new Error("ADMIN_BLOCKED");
      (err as any).code = "ADMIN_BLOCKED";
      throw err;
    }

    const isFD = typeof FormData !== "undefined" && payload instanceof FormData;
    const res = await http.post("/demandes", payload as any, {
      headers: isFD
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });

    const data = res.data || {};
    const ref = pickRef(data);
    const updatedUser = data?.updated_user;

    if (updatedUser) {
      try {
        const prev = JSON.parse(localStorage.getItem("current_user") || "{}");
        localStorage.setItem(
          "current_user",
          JSON.stringify({ ...prev, ...updatedUser })
        );
        setIsAuthenticated(true);
      } catch {}
    }

    if (!isAuth()) {
      const mail =
        (opts?.emailField && !isFD && (payload as any)[opts.emailField]) ||
        (opts?.emailField &&
          isFD &&
          (payload as FormData).get(opts.emailField)?.toString()) ||
        updatedUser?.email ||
        null;
      setUserEmail(mail);
    }

    setRefCode(ref);
    setOpen(true);
    return { ok: true, ref, raw: data };
  }

  function closeToHome(navigate: (p: string) => void) {
    setOpen(false);
    navigate("/");
  }
  function closeToOrders(navigate: (p: string) => void) {
    setOpen(false);
    navigate(
      refCode
        ? `/client/commandes?ref=${encodeURIComponent(refCode)}`
        : "/client/commandes"
    );
  }

  return {
    state: { open, refCode, userEmail, isAuthenticated },
    setOpen,
    submit,
    closeToHome,
    closeToOrders,
  };
}
