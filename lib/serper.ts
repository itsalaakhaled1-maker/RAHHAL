"use server";

const SERPER_API_KEY = process.env.SERPER_API_KEY || "";

export async function searchImages(query: string, count: number = 5) {
  try {
    const response = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: count,
        gl: "sa",
        hl: "ar",
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.images?.map((img: any) => img.imageUrl) || [];
  } catch (error) {
    console.error("Serper error:", error);
    return null;
  }
}
