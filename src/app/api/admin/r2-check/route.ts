import { NextResponse } from "next/server"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

export async function GET() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET_NAME
  const publicUrl = process.env.R2_PUBLIC_URL

  // Verifica se as variáveis estão presentes
  const missing = ["R2_ACCOUNT_ID","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY","R2_BUCKET_NAME","R2_PUBLIC_URL"]
    .filter(k => !process.env[k])

  if (missing.length > 0) {
    return NextResponse.json({ ok: false, error: "Variáveis ausentes", missing })
  }

  try {
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    })

    await client.send(new ListObjectsV2Command({ Bucket: bucket!, MaxKeys: 1 }))

    return NextResponse.json({
      ok: true,
      bucket,
      publicUrl,
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) })
  }
}
