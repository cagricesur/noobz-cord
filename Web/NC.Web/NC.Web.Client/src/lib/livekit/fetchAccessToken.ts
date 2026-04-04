import { useAuthStore } from "@noobz-cord/stores";

export interface IFetchLiveKitTokenParams {
  roomName: string;
  participantIdentity: string;
  participantName: string;
}

function getTokenEndpoint(): string {
  const raw = import.meta.env.VITE_LIVEKIT_TOKEN_URL;
  return (typeof raw === "string" && raw.trim() !== "" ? raw.trim() : "/api/livekit/token") as string;
}

/**
 * Resolves a LiveKit access token: optional static dev token, otherwise POST to the API.
 * Backend should accept JSON body and return `{ token: string }` (or `accessToken` / `jwt`).
 */
export async function fetchLiveKitAccessToken(
  params: IFetchLiveKitTokenParams,
): Promise<string> {
  const staticToken = import.meta.env.VITE_LIVEKIT_TOKEN;
  if (typeof staticToken === "string" && staticToken.trim() !== "") {
    return staticToken.trim();
  }

  const authToken = useAuthStore.getState().user?.token;
  const res = await fetch(getTokenEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      roomName: params.roomName,
      identity: params.participantIdentity,
      name: params.participantName,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      detail
        ? `Could not get LiveKit token (${res.status}): ${detail.slice(0, 200)}`
        : `Could not get LiveKit token (${res.status}).`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      const rec = data as Record<string, unknown>;
      const token = rec.token ?? rec.accessToken ?? rec.jwt;
      if (typeof token === "string" && token.length > 0) {
        return token;
      }
    }
    throw new Error("LiveKit token response missing a string token field.");
  }

  const text = await res.text();
  if (text.length > 0) {
    return text.trim();
  }
  throw new Error("Empty LiveKit token response.");
}
