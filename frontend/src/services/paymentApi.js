import { http } from "../lib/http";

function normalizeApiError(e) {
  const status = e?.response?.status;
  const payload = e?.response?.data;
  const message =
    payload?.message ||
    payload?.error ||
    e?.message ||
    "Une erreur est survenue";
  const err = new Error(message);
  err.status = status;
  err.payload = payload;
  throw err;
}


export async function initPayment({ type, id, channel, customer, repay } = {}) {
  try {
    const body = {
      ...(typeof repay === "boolean" ? { repay } : {}),
      ...(customer
        ? {
            customerEmail: customer.email,
            customerFirstName: customer.firstName,
            customerLastName: customer.lastName,
            customerPhoneNumber: customer.phone,
          }
        : {}),
      ...(channel ? { channel } : {}),
    };

    const { data } = await http.post(
      `/pay/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
      body,
      { headers: { Accept: "application/json" } }
    );
    return data;
  } catch (e) {
    normalizeApiError(e);
  }
}

function sanitizeReference(ref) {
  if (!ref) return "";
  const s = String(ref);
  return s.split("?")[0].split("&")[0];
}

function currentUrlParams() {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
}

export async function getPaymentStatus(reference) {
  const qp = currentUrlParams();
  const ref =
    sanitizeReference(reference) ||
    sanitizeReference(qp.get("reference")) ||
    sanitizeReference(qp.get("referenceNumber")) ||
    "";

  const params = {
    ...(ref ? { reference: ref } : {}),
    ...(qp.get("referenceNumber") ? { referenceNumber: qp.get("referenceNumber") } : {}),
    ...(qp.get("sessionId") ? { sessionId: qp.get("sessionId") } : {}),
    ...(qp.get("sessionid") ? { sessionid: qp.get("sessionid") } : {}),
    ...(qp.get("responsecode") ? { responsecode: qp.get("responsecode") } : {}),
    ...(qp.get("hashcode") ? { hashcode: qp.get("hashcode") } : {}),
    ...(qp.get("message") ? { message: qp.get("message") } : {}),
  };

  try {
    const { data } = await http.get(`/pay/return`, {
      params,
      headers: { Accept: "application/json" },
    });
    return data;
  } catch (e) {
    if (e?.response?.status === 404) {
      return { reference: ref || "", status: "unknown", message: null };
    }
    const status = e?.response?.status;
    const payload = e?.response?.data;
    const message =
      payload?.message || payload?.error || e?.message || "Une erreur est survenue";
    const err = new Error(message);
    err.status = status;
    err.payload = payload;
    throw err;
  }
}