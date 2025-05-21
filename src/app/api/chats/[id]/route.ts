// src\app\api\chats\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    const { name, threadId } = await request.json();
    const chat = await prisma.chatHistory.update({
      where: { id: params.id, userId },
      data: { name, threadId },
    });

    return NextResponse.json({
      id: chat.id,
      name: chat.name,
      createdAt: chat.createdAt,
      threadId: chat.threadId,
      messages: [], // Align with your GET response format
    });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    await prisma.chatHistory.delete({
      where: { id: params.id, userId },
    });
    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}

// Ensure Prisma client is properly disconnected
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
});
