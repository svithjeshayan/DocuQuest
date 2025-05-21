// src\app\api\files\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    const { selected } = await request.json();
    const file = await prisma.uploadedFile.update({
      where: { id: params.id },
      data: { selected },
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
    return NextResponse.json(file);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = request.headers.get("User-Id");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 401 });
  }

  try {
    await prisma.uploadedFile.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}