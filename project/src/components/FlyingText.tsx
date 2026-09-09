import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface FlyingTextProps {
    lines?: string[];
}

export default function FlyingText({
    lines = [
        "line1",
        "line2",
        "line3"
    ]
}: FlyingTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const chars = containerRef.current?.querySelectorAll('.char');
        if (!chars || chars.length === 0) return;

        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

        tl.fromTo(
            chars,
            {
                opacity: 0,
                y: 40,
                scale: 0.5,
                rotation: -10
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                stagger: 0.03
            }
        )
        .to({}, {duration: 0.8})
        .to(chars, {
            opacity: 0,
            y: -80,
            x: -30,
            rotation: -35,
            scale: 1.2,
            duration: 0.5,
            ease: "power2.in",
            stagger: {
                each: 0.02,
                from: "start"
            },
        });
    }, {scope: containerRef});

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                transform: 'rotate(-8deg)',
                fontFamily: "'Fredoka', 'Impact', sans-serif",
                fontWeight: 900,
                fontSize: '60px',
                color: '#03B5A5',
                lineHeight: 1.15,
                userSelect: 'none',
                position: 'absolute'
            }}
        >
            {lines.map((line, lineIdx) => (
                <div key={lineIdx} style={{ whiteSpace: 'pre', zIndex: 99 }}>
                    {line.split('').map((char, charIdx) => (
                        <span
                            key={charIdx}
                            className="char"
                            style={{
                                display: 'inline-block',
                                willChange: 'transform, opacity'
                            }}
                        >   
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>
            ))}
            <img 
                src="../src/assets/cloud.png"
                alt="구름"
                style={{
                    width: "600px",
                    height: "auto",
                    position: 'absolute',
                    top: 0
                }}
            />
        </div>
    )
}