import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function getCycleKey() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "shop");

    const cycleKey = getCycleKey();

    const messages = await db
      .collection("feedback_messages")
      .find({ cycleKey })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/feedback error:", error);

    return NextResponse.json(
      { error: "Failed to load feedback" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const text = String(body.text || "").trim();
    const x = Number(body.x);
    const y = Number(body.y);

    if (!text || Number.isNaN(x) || Number.isNaN(y)) {
      return NextResponse.json(
        { error: "Invalid feedback message" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "shop");

    const cycleKey = getCycleKey();

    const doc = {
      text,
      x,
      y,
      cycleKey,
      createdAt: new Date(),
    };

    const result = await db.collection("feedback_messages").insertOne(doc);

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...doc,
    });
  } catch (error) {
    console.error("POST /api/feedback error:", error);

    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}