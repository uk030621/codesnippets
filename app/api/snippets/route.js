import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/snippetmongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Fetch only snippets belonging to the logged-in user
export async function GET(_req) {
  const { db } = await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snippets = await db
    .collection("snippets")
    .find({ userId: session.user.id }) // Fetch only user's snippets
    .toArray();

  return NextResponse.json(snippets);
}

// POST: Create a new snippet and associate it with the logged-in user
export async function POST(req) {
  const { db } = await connectToDatabase();
  const session = await getServerSession(authOptions);

  // Debugging: Log session data
  //console.log("Session Data:", session);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { error: "Unauthorized or missing user ID" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const result = await db.collection("snippets").insertOne({
    ...body,
    userId: session.user.id, // Ensure user ID is stored
  });

  return NextResponse.json({ _id: result.insertedId, ...body });
}

// PUT: Update a snippet, ensuring only the owner can modify it
export async function PUT(req) {
  const { db } = await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { _id, explanation, code } = await req.json();
  const snippet = await db
    .collection("snippets")
    .findOne({ _id: new ObjectId(_id) });

  if (!snippet || snippet.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .collection("snippets")
    .updateOne({ _id: new ObjectId(_id) }, { $set: { explanation, code } });

  return NextResponse.json({ success: true });
}

// DELETE: Remove a snippet, ensuring only the owner can delete it
export async function DELETE(req) {
  const { db } = await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { _id } = await req.json();
  const snippet = await db
    .collection("snippets")
    .findOne({ _id: new ObjectId(_id) });

  if (!snippet || snippet.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.collection("snippets").deleteOne({ _id: new ObjectId(_id) });

  return NextResponse.json({ success: true });
}
