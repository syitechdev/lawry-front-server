import { http } from "@/lib/http";

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await http.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const url = data?.url as string | undefined;
  if (!url) throw new Error("Upload échoué: URL non retournée");
  return url;
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  const out: string[] = [];
  for (const f of files) {
    const url = await uploadImage(f); 
    out.push(url);
  }
  return out;
}