import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/actions/auth";

export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
