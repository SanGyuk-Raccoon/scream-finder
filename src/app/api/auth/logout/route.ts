import { NextResponse } from "next/server";
import { logoutAction } from "@/server/actions/auth";

export async function POST(request: Request): Promise<NextResponse> {
  await logoutAction();
  return NextResponse.redirect(new URL("/", request.url));
}
