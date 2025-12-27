
import React from 'react';

interface AIAvatarProps {
    state: 'listening' | 'speaking' | 'processing' | 'idle';
}

const AIAvatar: React.FC<AIAvatarProps> = ({ state = 'idle' }) => {
    // Determine visuals based on state
    const getColor = () => {
        switch (state) {
            case 'listening': return 'bg-green-500 shadow-[0_0_60px_rgba(34,197,94,0.6)] animate-pulse';
            case 'speaking': return 'bg-blue-500 shadow-[0_0_60px_rgba(59,130,246,0.6)] animate-bounce-slow';
            case 'processing': return 'bg-violet-500 shadow-[0_0_60px_rgba(139,92,246,0.6)] animate-spin-slow';
            default: return 'bg-slate-400 dark:bg-slate-600 shadow-[0_0_30px_rgba(148,163,184,0.3)]';
        }
    };

    const getStatusText = () => {
        switch (state) {
            case 'listening': return 'Listening...';
            case 'speaking': return 'Speaking...';
            case 'processing': return 'Thinking...';
            default: return 'Ready';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center relative">
            {/* Core Orb */}
            <div className={`w-32 h-32 rounded-full transition-all duration-500 ease-in-out ${getColor()} relative z-10 flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-50 rounded-full" />

                {/* Internal Waves for Speaking */}
                {state === 'speaking' && (
                    <>
                        <div className="absolute w-full h-full bg-white/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute w-2/3 h-2/3 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                    </>
                )}
            </div>

            {/* Status Text with Fade In/Out */}
            <div className={`mt-8 text-lg font-medium tracking-widest uppercase transition-colors duration-300 ${state === 'listening' ? 'text-green-500' :
                    state === 'speaking' ? 'text-blue-500' :
                        state === 'processing' ? 'text-violet-500' :
                            'text-slate-400'
                }`}>
                {getStatusText()}
            </div>

            {/* Background Rings */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
                <div className={`w-64 h-64 rounded-full border border-slate-200 dark:border-white/5 transition-all duration-1000 ${state !== 'idle' ? 'scale-110 opacity-100' : 'scale-75 opacity-0'}`} />
                <div className={`absolute w-96 h-96 rounded-full border border-slate-100 dark:border-white/5 transition-all duration-1000 delay-100 ${state !== 'idle' ? 'scale-110 opacity-100' : 'scale-50 opacity-0'}`} />
            </div>
        </div>
    );
};

export default AIAvatar;
