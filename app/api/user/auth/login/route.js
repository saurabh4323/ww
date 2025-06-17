import { NextResponse } from "next/server";
import connectDb from "@/config/ConnectDb";
import User from "@/model/UserScheama";
export async function POST(request) {
  try {
    await connectDb();
    const { ServiceId, Password } = await request.json();
    const user = await User.findOne({
      ServiceId,
      Password,
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ServiceId or Password",
        },
        { status: 401 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        ServiceId: user.ServiceId,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
