import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        relatedCustomer: {
          select: {
            id: true,
            firstNameTh: true,
            lastNameTh: true,
            firstNameEn: true,
            lastNameEn: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { topic, description, deadline, status, contact, relatedCustomerId, userId } = body;

    const updateData: {
      topic?: string;
      description?: string | null;
      deadline?: Date | null;
      status?: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
      contact?: "CALL" | "LINE" | "MESSENGER" | null;
      relatedCustomerId?: string | null;
      userId?: string | null;
    } = {};

    if (topic !== undefined) updateData.topic = topic;
    if (description !== undefined) updateData.description = description || null;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) {
      if (["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
        updateData.status = status;
      }
    }
    if (contact !== undefined) {
      if (contact === null || ["CALL", "LINE", "MESSENGER"].includes(contact)) {
        updateData.contact = contact;
      }
    }
    if (relatedCustomerId !== undefined) updateData.relatedCustomerId = relatedCustomerId || null;
    if (userId !== undefined) updateData.userId = userId || null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        relatedCustomer: {
          select: {
            id: true,
            firstNameTh: true,
            lastNameTh: true,
            firstNameEn: true,
            lastNameEn: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.task.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TASKS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
