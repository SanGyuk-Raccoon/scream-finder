import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/actions/auth";
import { createTeamAction } from "@/server/actions/teams";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/?error=login", request.url));
  }

  const formData = await request.formData();

  try {
    const team = await createTeamAction({
      ownerUserId: user.id,
      ownerDisplayName: user.username,
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      activityTime: String(formData.get("activityTime") ?? ""),
    });

    return NextResponse.redirect(new URL(`/teams/${team.id}`, request.url));
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown";
    return NextResponse.redirect(new URL(`/teams/new?error=${code}`, request.url));
  }
}
