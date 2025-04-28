import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    const { chatId, message, msgBy, createdAt } = await request.json();
    const chatMessage = await prisma.chatMessage.create({
      data: {
        chatId,
        message,
        msgBy,
        createdAt: new Date(createdAt),
      },
    });

    return NextResponse.json(chatMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}