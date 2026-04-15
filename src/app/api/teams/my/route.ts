import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/actions/auth";
import { getMyTeamAction } from "@/server/actions/teams";

export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ team: null }, { status: 401 });
  }

  const team = await getMyTeamAction(user.id);
  return NextResponse.json({ team });
}
