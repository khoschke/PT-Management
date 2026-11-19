import type { PostChatReflection } from "./types";

/**
 * A lead's post-chat reflection, whichever shape the query returned it in.
 * post_chat_reflections is unique on lead_id, so PostgREST treats the embed as
 * one-to-one and returns a single object, not a list. Reading it as a list
 * found nothing, which is why saved reflections looked blank (18 Nov 2026).
 */
export function reflectionOf(lead: {
  post_chat_reflections?: PostChatReflection | PostChatReflection[] | null;
}): PostChatReflection | null {
  const r = lead.post_chat_reflections;
  return Array.isArray(r) ? (r[0] ?? null) : (r ?? null);
}
