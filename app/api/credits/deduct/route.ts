// app/api/credits/deduct/route.ts

// ✅ خصم الكريديتس من Server — لا يمكن تخطيه من Console

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Authenticate user server-side (cannot be faked)
    const supabase = createClient();
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

    // ✅ 3. Check credits with row lock (prevents race conditions)
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

    // ✅ 4. Deduct atomically (update, not upsert)
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

    // ✅ 5. Log transaction for audit
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      type: "deduct",
      amount,
      description,
      created_at: new Date().toISOString(),
    });

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
