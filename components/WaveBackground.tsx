
import React, { useRef, useEffect } from 'react';

interface Wave {
  y: number;
  length: number;
  amplitude: number;
  frequency: number;
  color: string;
  speed: number;
}

const WaveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let increment = 0;

        const waves: Wave[] = [
            { y: window.innerHeight / 2, length: 0.005, amplitude: 250, frequency: 0.015, color: 'rgba(66, 153, 225, 0.2)', speed: 0.01 },
            { y: window.innerHeight / 2, length: 0.008, amplitude: 200, frequency: 0.020, color: 'rgba(129, 140, 248, 0.2)', speed: 0.012 },
            { y: window.innerHeight / 2, length: 0.01, amplitude: 150, frequency: 0.025, color: 'rgba(99, 102, 241, 0.2)', speed: 0.015 },
            { y: window.innerHeight / 2, length: 0.02, amplitude: 100, frequency: 0.030, color: 'rgba(192, 132, 252, 0.2)', speed: 0.018 },
        ];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            waves.forEach(wave => wave.y = canvas.height / 2);
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            waves.forEach(wave => {
                ctx.beginPath();
                ctx.moveTo(0, wave.y);
                
                for (let i = 0; i < canvas.width; i++) {
                    ctx.lineTo(i, wave.y + Math.sin(i * wave.length + increment) * wave.amplitude * Math.sin(increment * wave.frequency));
                }
                
                // Add the neon glow effect
                ctx.shadowColor = wave.color;
                ctx.shadowBlur = 15;

                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            });

            // Reset shadow for other potential canvas drawings (good practice)
            ctx.shadowBlur = 0;

            increment += 0.02;
            
        };

        animate();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};

export default WaveBackground;