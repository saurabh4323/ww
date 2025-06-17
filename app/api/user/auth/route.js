import { NextResponse } from "next/server";
import User from "@/model/UserScheama";
import connectDb from "@/config/ConnectDb";
export async function POST(request) {
  try {
    console.log("Connecting to database...");
    await connectDb();
    const { name, ServiceId, rank, gender, number, Password } =
      await request.json();
    const user = new User({
      name,
      ServiceId,

      rank,
      gender,
      number,
      Password,
    });
    const savedUser = await user.save();
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: savedUser,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
