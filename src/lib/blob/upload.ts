import { put } from "@vercel/blob";

export async function uploadImage(file: File, pathPrefix: string): Promise<string> {
  const filename = `${pathPrefix}/${crypto.randomUUID()}-${file.name}`;
  const blob = await put(filename, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}
