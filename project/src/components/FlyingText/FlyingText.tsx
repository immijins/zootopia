import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import './FlyingText.css'
import Cloud from '../../assets/cloud.png'

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
            className='FlyingDiv'
            ref={containerRef}
        >
            {/* 텍스트 */}
            {lines.map((line, lineIdx) => (
                <div key={lineIdx} style={{ whiteSpace: 'pre', zIndex: 99 }}>
                    {line.split('').map((char, charIdx) => (
                        <span
                            key={charIdx}
                            className="char"
                            style={{
                                willChange: 'transform, opacity'
                            }}
                        >   
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>
            ))}
            {/* 구름 배경 */}
            <img 
                className='cloudBack'
                src={Cloud}
                alt="구름"
            />
        </div>
    )
}