import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface BuildingZoneProps {
    buildingImg: string;
    characterImg: string;
    onHoverState: (hovering: boolean) => void;
}

export default function BuildingZone({ buildingImg, characterImg, onHoverState }: BuildingZoneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const characterRef = useRef<HTMLImageElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    const { contextSafe } = useGSAP(() => {
        tlRef.current = gsap.timeline({ paused: true })
        .to(characterRef.current, {
            x: 45,
            y: 20,
            scale: 1.05,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        })
        .to(characterRef.current, {
            rotate: 6,
            yoyo: true,
            repeat: 3,
            duration: 0.12,
            ease: "sine.inOut"
        }, "<0.1");
    }, { scope: containerRef });

    // 호버 핸들러
    const handleMouseEnter = contextSafe(() => {
        onHoverState(true);
        tlRef.current?.play();
    });

    const handleMouseLeave = contextSafe(() => {
        onHoverState(false);
        tlRef.current?.reverse();
    });

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                position: 'relative',
                width: '250px',
                height: '250px',
                cursor: 'none',
            }}
        >
            {/* 걸어나올 캐릭터 */}
            <img
                ref={characterRef}
                src={characterImg}
                alt="Character"
                style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '40px',
                    width: '120px',
                    height: 'auto',
                    zIndex: 99,
                    opacity: 0,
                    transformOrigin: 'bottom center',
                    pointerEvents: 'none'
                }}
            />

            {/* 건물 이미지 */}
            <img 
                src={buildingImg}
                alt="Building"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    zIndex: 2
                }}
            />
        </div>
    )
}