import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

if (!process.env.LIVEKIT_URL) {
    throw new Error("LIVEKIT_URL is not defined");
}
if (!process.env.LIVEKIT_API_KEY) {
    throw new Error("LIVEKIT_API_KEY is not defined");
}
if (!process.env.LIVEKIT_API_SECRET) {
    throw new Error("LIVEKIT_API_SECRET is not defined");
}

export const livekit = new RoomServiceClient(
    process.env.LIVEKIT_URL,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
);

export function createToken(roomName: string, userId: string) {
    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        { identity: userId }
    );

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });

    return at.toJwt();
}
