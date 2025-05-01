import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    const files = await prisma.uploadedFile.findMany({
      where: {
        chat: { userId },
      },
      select: {
        id: true,
        name: true,
        type: true,
        content: true,
        url: true,
        selected: true,
        chatId: true, // Include chatId
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    const { chatId, name, type, content, url, selected } = await request.json();
    const file = await prisma.uploadedFile.create({
      data: {
        chatId,
        name,
        type,
        content,
        url,
        selected,
      },
      select: {
        id: true,
        name: true,
        type: true,
        content: true,
        url: true,
        selected: true,
        chatId: true, // Include chatId in response
      },
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json({ error: "Failed to create file" }, { status: 500 });
  }
}

