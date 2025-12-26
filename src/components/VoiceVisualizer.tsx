import { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
    analyser: AnalyserNode | null;
    isListening: boolean;
}

export const VoiceVisualizer = ({ analyser, isListening }: VoiceVisualizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !analyser || !isListening) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#60A5FA'); // Blue-400
                gradient.addColorStop(1, '#3B82F6'); // Blue-500

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => cancelAnimationFrame(animationId);
    }, [analyser, isListening]);

    if (!isListening) return null;

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="w-full h-24 opacity-80"
        />
    );
};
