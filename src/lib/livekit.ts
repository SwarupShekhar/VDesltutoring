import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const getRoomService = () => {
    if (!process.env.LIVEKIT_URL) {
        throw new Error("LIVEKIT_URL is not defined");
    }
    if (!process.env.LIVEKIT_API_KEY) {
        throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (!process.env.LIVEKIT_API_SECRET) {
        throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    return new RoomServiceClient(
        process.env.LIVEKIT_URL,
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET
    );
};

// Lazy initialization proxy
export const livekit = new Proxy({} as RoomServiceClient, {
    get: (_target, prop) => {
        const service = getRoomService();
        return (service as any)[prop];
    }
});

export function createToken(roomName: string, userId: string) {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        throw new Error("LIVEKIT_API_KEY or LIVEKIT_API_SECRET is not defined");
    }
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
