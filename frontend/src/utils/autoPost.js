export function autoPost(action, fields = {}, method = "POST") {
  const form = document.createElement("form");
  form.method = String(method || "POST").toUpperCase();
  form.action = action;
  form.style.display = "none";
  form.target = "_self";

  Object.entries(fields || {}).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;       
    input.value = String(v ?? "");
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  // nettoyage
  setTimeout(() => {
    try { document.body.removeChild(form); } catch {}
  }, 0);
}
