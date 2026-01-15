import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import Decimal from "decimal.js";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const body = await req.json();
    const { firstName, lastName, email, phoneNumber, role, isActive, commissionRate, password } = body;

    // Check for duplicate email if email is being updated
    if (email !== undefined) {
      const existingEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingEmail && existingEmail.id !== id) {
        return new NextResponse("This email already exists.", { status: 409 });
      }
    }

    // Check for duplicate phone number if phoneNumber is being updated
    if (phoneNumber !== undefined && phoneNumber) {
      const existingPhoneNumber = await prisma.user.findUnique({
        where: {
          phoneNumber,
        },
      });

      if (existingPhoneNumber && existingPhoneNumber.id !== id) {
        return new NextResponse("This phone number already exists.", { status: 409 });
      }
    }

    const updateData: Prisma.UserUpdateInput = {
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber !== undefined ? phoneNumber || null : undefined,
      role,
    };

    // Handle isActive - explicitly check for boolean (including false)
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    // Handle commissionRate - allow "0" to be parsed as 0, not null
    if (commissionRate !== undefined && commissionRate !== null && commissionRate !== "") {
      updateData.commissionPerHead = new Decimal(commissionRate);
    } else if (commissionRate === "" || commissionRate === null) {
      updateData.commissionPerHead = null;
    }

    // Handle password - only update if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
