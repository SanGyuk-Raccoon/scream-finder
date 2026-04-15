import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/actions/auth";
import { createInviteLinkAction } from "@/server/actions/invite-links";

type Context = {
  params: Promise<{ teamId: string }>;
};

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
  const maxUsesValue = String(formData.get("maxUses") ?? "").trim();
  const expiresAt = String(formData.get("expiresAt") ?? "").trim();

  try {
    await createInviteLinkAction({
      teamId,
      actorUserId: user.id,
      maxUses: maxUsesValue ? Number(maxUsesValue) : undefined,
      expiresAt: expiresAt || undefined,
    });
    return NextResponse.redirect(new URL(`/teams/${teamId}?inviteCreated=1`, request.url));
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown";
    return NextResponse.redirect(new URL(`/teams/${teamId}?error=${code}`, request.url));
  }
}
