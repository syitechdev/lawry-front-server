export type AutofillMap = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
};
function readMe() {
  try {
    return JSON.parse(localStorage.getItem("current_user") || "{}");
  } catch {
    return {};
  }
}

export function useFormAutofill() {
  const me = readMe();
  function apply(
    setValue: (name: string, v: any, opts?: any) => void,
    map: AutofillMap
  ) {
    if (!setValue) return;
    if (map.name && me.name)
      setValue(map.name, me.name, { shouldDirty: false });
    if (map.phone && me.phone)
      setValue(map.phone, me.phone, { shouldDirty: false });
    if (map.email && me.email)
      setValue(map.email, me.email, { shouldDirty: false });
    if (map.address && me.address)
      setValue(map.address, me.address, { shouldDirty: false });
  }
  return { apply, me };
}
