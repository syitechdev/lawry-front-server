import { useState } from "react";
import { initPayment } from "../api/paymentApi";
import { autoPost } from "../utils/autoPost";

export default function PayButton({
  type,      
  id,          
  channel,      
  customer,      
  label = "Payer",
  className = ""
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setError("");
    setLoading(true);
    try {
      const res = await initPayment({ type, id, channel, customer });
      // res: { method: "POST", action: "...processing_v2.php", fields: { sessionId }, reference }
      if (!res?.action || !res?.fields?.sessionId) {
        throw new Error("Réponse invalide");
      }
      autoPost(res.action, res.fields, res.method || "POST");
    } catch (e) {
      setError(e?.payload?.error || e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button onClick={onClick} disabled={loading} aria-busy={loading}>
        {loading ? "Redirection..." : label}
      </button>
      {error ? <div role="alert" style={{ marginTop: 8 }}>{String(error)}</div> : null}
    </div>
  );
}
