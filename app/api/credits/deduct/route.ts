// app/api/credits/deduct/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // ✅ Create server client inline (avoids supabase-server.ts issues)
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    );

    // ✅ 1. Authenticate user server-side
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ 2. Validate request
    const body = await request.json();
    const { amount = 1, description = "Trip search" } = body;

    if (typeof amount !== "number" || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // ✅ 3. Check credits
    const { data: creditRow, error: fetchError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Credit fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to check credits" },
        { status: 500 }
      );
    }

    const currentCredits = creditRow?.credits ?? 0;

    if (currentCredits < amount) {
      return NextResponse.json(
        { error: "Insufficient credits", currentCredits },
        { status: 402 }
      );
    }

    // ✅ 4. Deduct credits
    const newCredits = currentCredits - amount;

    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Credit update error:", updateError);
      return NextResponse.json(
        { error: "Failed to deduct credits" },
        { status: 500 }
      );
    }

    // ✅ 5. Log transaction (optional - table may not exist yet)
    try {
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        type: "deduct",
        amount,
        description,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      // Ignore if table doesn't exist yet
      console.log("Credit transaction logging skipped:", logError);
    }

    return NextResponse.json({
      success: true,
      credits: newCredits,
      deducted: amount,
    });

  } catch (error) {
    console.error("Deduct credits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}