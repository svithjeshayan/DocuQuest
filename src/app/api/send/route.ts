import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json();

    // Validate inputs
    if (!email || !otpCode) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Prepare EmailJS payload
    const emailData = {
      service_id: process.env.EMAILJS_SERVICE_ID || "service_dwb1ztp",
      template_id: process.env.EMAILJS_TEMPLATE_ID || "template_jtlvai3",
      user_id: process.env.EMAILJS_PUBLIC_KEY || "G7JEeLSEyqMuYoT2y",
      accessToken: process.env.EMAILJS_PRIVATE_KEY, // Required for server-side
      template_params: {
        to_email: "vithjeshayan2107@gmail.com",
        email: email,
        otpCode,
      },
    };

    console.log("Sending EmailJS with params:", emailData);

    // Send email via EmailJS REST API
    const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("EmailJS error:", errorData);
      return NextResponse.json(
        { error: `Failed to send email: ${errorData.text || "Unknown error"}` },
        { status: emailResponse.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
