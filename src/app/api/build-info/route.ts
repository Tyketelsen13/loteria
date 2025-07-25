import { NextResponse } from "next/server";
import { BUILD_VERSION, BUILD_TIMESTAMP } from "@/lib/build-info";

export async function GET() {
  return NextResponse.json({
    build_info: {
      version: BUILD_VERSION,
      timestamp: BUILD_TIMESTAMP,
      current_time: new Date().toISOString(),
      message: "This confirms the new build is deployed"
    },
    mongodb_info: {
      driver_version: "5.9.2",
      expected_behavior: "Should connect without SSL conflicts"
    }
  });
}
