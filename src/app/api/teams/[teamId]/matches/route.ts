import { NextRequest, NextResponse } from "next/server";
import { LolTier } from "@/shared/types/core";
import { getCurrentUser } from "@/server/actions/auth";
import { registerMatchPostAction } from "@/server/actions/matches";

type Context = {
  params: Promise<{ teamId: string }>;
};

function readTier(value: FormDataEntryValue | null): LolTier | undefined {
  if (!value) {
    return undefined;
  }

  return String(value) as LolTier;
}

export async function POST(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const user = await getCurrentUser();
  const { teamId } = await context.params;

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();

  try {
    await registerMatchPostAction({
      teamId,
      actorUserId: user.id,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      minTier: readTier(formData.get("minTier")),
      maxTier: readTier(formData.get("maxTier")),
      availableTime: String(formData.get("availableTime") ?? ""),
    });
    return NextResponse.redirect(new URL(`/teams/${teamId}?matchCreated=1`, request.url));
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown";
    return NextResponse.redirect(
      new URL(`/teams/${teamId}/matches/new?error=${code}`, request.url),
    );
  }
}
