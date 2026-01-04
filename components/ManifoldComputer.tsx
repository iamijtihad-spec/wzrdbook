"use client";

import { useEffect, useRef } from "react";

interface ManifoldProps {
    supply?: number; // Affects complexity (node count)
    speed?: number;  // Affects rotation speed
}

export default function ManifoldComputer({ supply = 0, speed = 1 }: ManifoldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = canvas.parentElement?.clientWidth || 300;
            canvas.height = canvas.parentElement?.clientHeight || 300;
        };
        window.addEventListener("resize", resize);
        resize();

        // GEOMETRIC CONFIG (Data Driven)
        // Base nodes + 1 node per 10 supply tokens (capped at 200 for perf)
        const baseNodes = 30;
        const effectiveSupply = Math.min(supply, 2000);
        const numNodes = baseNodes + Math.floor(effectiveSupply / 20);

        const nodes: { x: number; y: number; z: number }[] = [];
        const connectionDistance = 100 + (speed * 10); // Higher speed = longer reach

        // Init Sphere Nodes
        for (let i = 0; i < numNodes; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 100;
            nodes.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi)
            });
        }

        const render = () => {
            // Speed factor: 0.005 base + speed prop scaling
            // If speed is 1 (normal), we get 0.005
            // If speed is 10 (high activity), we get 0.05
            const velocity = 0.002 + (speed * 0.002);
            time += velocity;

            ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Trails
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // Rotation Matrices
            const rotateY = (n: typeof nodes[0]) => {
                const cos = Math.cos(time);
                const sin = Math.sin(time);
                return {
                    x: n.x * cos - n.z * sin,
                    y: n.y,
                    z: n.x * sin + n.z * cos
                };
            };

            const rotateX = (n: typeof nodes[0]) => {
                const cos = Math.cos(time * 0.5);
                const sin = Math.sin(time * 0.5);
                return {
                    x: n.x,
                    y: n.y * cos - n.z * sin,
                    z: n.y * sin + n.z * cos
                };
            };

            // Transform and Project
            const projectedNodes = nodes.map(n => {
                let p = rotateY(n);
                p = rotateX(p);
                const scale = 300 / (300 + p.z); // Perspective
                return {
                    x: cx + p.x * scale,
                    y: cy + p.y * scale,
                    z: p.z
                };
            });

            // Draw Connections
            ctx.strokeStyle = "rgba(249, 115, 22, 0.3)"; // Orange-ish
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < projectedNodes.length; i++) {
                for (let j = i + 1; j < projectedNodes.length; j++) {
                    const d = Math.hypot(
                        projectedNodes[i].x - projectedNodes[j].x,
                        projectedNodes[i].y - projectedNodes[j].y
                    );
                    if (d < connectionDistance) {
                        ctx.moveTo(projectedNodes[i].x, projectedNodes[i].y);
                        ctx.lineTo(projectedNodes[j].x, projectedNodes[j].y);
                    }
                }
            }
            ctx.stroke();

            // Draw Nodes
            projectedNodes.forEach(n => {
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [supply, speed]);

    return (
        <div className="w-full h-full relative group">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-orange-500/50 uppercase tracking-widest pointer-events-none group-hover:text-orange-400 transition-colors">
                Manifold::Compute::Active
            </div>
        </div>
    );
}
