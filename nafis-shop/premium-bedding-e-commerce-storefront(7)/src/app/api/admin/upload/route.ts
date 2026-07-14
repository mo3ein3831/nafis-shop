import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Simple image upload — saves to public/uploads/
// In production, use Cloudinary, S3, or Liara object storage.
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده." }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "فقط JPG، PNG، WebP و AVIF مجاز هستند." }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "حداکثر حجم فایل ۵ مگابایت است." }, { status: 400 });
    }

    // For production: upload to S3/Cloudinary. For now, return a note.
    // Since we can't write files persistently in serverless, we return the data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "خطا در آپلود فایل" }, { status: 500 });
  }
}
