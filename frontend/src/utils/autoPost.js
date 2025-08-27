export function autoPost(action, fields = {}, method = "POST") {
  const form = document.createElement("form");
  form.method = method;
  form.action = action;
  form.style.display = "none";

  Object.entries(fields || {}).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v ?? "");
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
