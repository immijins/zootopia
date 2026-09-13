import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import './BuildingZone.css'

interface BuildingZoneProps { // 타입 지정 후 페이지에서 /src 경로 지정됨
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

    // 포인터 핸들러: 마우스 호버와 터치 입력을 함께 지원한다.
    const handlePointerEnter = contextSafe(() => {
        onHoverState(true);
        tlRef.current?.play();
    });

    const handlePointerLeave = contextSafe(() => {
        onHoverState(false);
        tlRef.current?.reverse();
    });

    return (
        <div
            className='buildingDiv'
            ref={containerRef}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
        >
            {/* 걸어나올 캐릭터 */}
            <img
                className='characterImg'
                ref={characterRef}
                src={characterImg}
                alt="걸어다니는 캐릭터"
            />

            {/* 건물 이미지 */}
            <img 
                className='buildingImg'
                src={buildingImg}
                alt="건물"
            />
        </div>
    )
}