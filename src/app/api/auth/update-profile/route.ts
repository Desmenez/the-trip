import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName } = body;

    if (!firstName || firstName.trim() === "" || !lastName || lastName.trim() === "") {
      return new NextResponse("First name and last name are required", { status: 400 });
    }

    // Update user name
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        commissionPerHead: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...user,
      role: user.role.toString(),
      commissionPerHead: user.commissionPerHead ? Number(user.commissionPerHead) : null,
    });
  } catch (error) {
    console.error("[UPDATE_PROFILE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
