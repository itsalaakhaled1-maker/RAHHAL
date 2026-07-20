import { NextRequest, NextResponse } from "next/server";
import { searchImages } from "@/lib/serper";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const count = parseInt(searchParams.get("count") || "5");

    if (!query) {
      return NextResponse.json({ images: [] });
    }

    const images = await searchImages(query, count);

    return NextResponse.json({ images: images || [] });

  } catch (error) {
    console.error("Images API error:", error);
    return NextResponse.json({ images: [] });
  }
}
