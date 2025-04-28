import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    const chats = await prisma.chatHistory.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }, // Order messages within each chat
          select: {
            id: true,
            message: true,
            msgBy: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" }, // Order chats by creation date
    });

    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      name: chat.name,
      createdAt: chat.createdAt,
      messages: chat.messages.map((msg) => ({
        id: msg.id,
        content: msg.message,
        isUser: msg.msgBy === "USER",
        timestamp: msg.createdAt,
      })),
    }));

    return NextResponse.json(formattedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    const chat = await prisma.chatHistory.create({
      data: {
        name,
        userId,
        threaded: false,
      },
    });

    return NextResponse.json({
      id: chat.id,
      name: chat.name,
      createdAt: chat.createdAt,
      messages: [],
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}