import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Define the directory where files will be saved
const uploadDir = "C:\\Users\\saura\\OneDrive\\Desktop\\MCTE";

export async function POST(request) {
  try {
    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Parse the form data from the request
    const formData = await request.formData();
    const file = formData.get("file"); // Assuming the file is sent with the key "file"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type (optional, e.g., only allow images)
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and PDF are allowed." },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique filename to avoid conflicts
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);

    // Save the file to the specified path
    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: "File uploaded and saved successfully",
      filename: filename,
      path: filePath,
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    return NextResponse.json(
      { error: "Error uploading file", details: err.message },
      { status: 500 }
    );
  }
}
