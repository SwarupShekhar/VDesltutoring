'use client';

import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
    ControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';

interface SessionLiveProps {
    token: string;
    serverUrl: string;
    roomName: string;
    userName: string;
    isStudent?: boolean;
}

export default function SessionLive({ token, serverUrl, roomName, userName, isStudent = false }: SessionLiveProps) {
    return (
        <div className="h-[calc(100vh-80px)] w-full bg-slate-950 flex flex-col">
            {/* Header is handled by the page, this is just the room container */}
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                connect={true}
                data-lk-theme="default"
                className="flex-1 flex flex-col"
            >
                <div className="flex-1 relative">
                    <VideoConference />
                    <div className="absolute top-4 right-4 z-10 hidden md:block">
                        {/* Placeholder for Whiteboard if needed later, or small overlay */}
                    </div>
                </div>

                <RoomAudioRenderer />
                <ControlBar />
            </LiveKitRoom>
        </div>
    );
}
