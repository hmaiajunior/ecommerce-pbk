import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/** Verifica o tipo real do arquivo pelos magic numbers (bytes iniciais). */
function detectMime(buffer: Buffer): string | null {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg"
  }
  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png"
  }
  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp"
  }
  return null
}

export type UploadResult =
  | { url: string; key: string; error: null }
  | { url: null; key: null; error: string }

export async function uploadProductImage(
  file: File
): Promise<UploadResult> {
  if (file.size > MAX_SIZE_BYTES) {
    return { url: null, key: null, error: "Arquivo excede o limite de 5 MB." }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const mime = detectMime(buffer)

  if (!mime || !ALLOWED_TYPES[mime]) {
    return {
      url: null,
      key: null,
      error: "Formato inválido. Use JPEG, PNG ou WebP.",
    }
  }

  const ext = ALLOWED_TYPES[mime]
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: mime,
    })
  )

  return {
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
    key,
    error: null,
  }
}

export async function deleteProductImage(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  )
}
