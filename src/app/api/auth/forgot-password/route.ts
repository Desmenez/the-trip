import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendForgotPasswordEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    // Don't reveal if user exists or not (security best practice)
    // Always return success message, even if user doesn't exist
    if (!user) {
      // Return success to prevent email enumeration
      return NextResponse.json({ message: "If an account exists with this email, a password reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24); // Token expires in 24 hours

    // Update user with reset token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset password email
    try {
      const fullName = `${user.firstName} ${user.lastName}`;
      await sendForgotPasswordEmail(user.email, fullName, resetToken);
    } catch (emailError) {
      console.error("Failed to send forgot password email:", emailError);
    }

    // Return success message (don't reveal if user exists)
    return NextResponse.json({ message: "If an account exists with this email, a password reset link has been sent." });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
