import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './IntroPage.css';
import { useNavigate } from 'react-router-dom';

import Footer from '../../components/Footer/Footer';
import IntroBack from '../../assets/introBack.png';
import Tetehr from '../../assets/tetehr.png';
import Logo from '../../assets/logo.png';

type CursorType = "default" | "objectOn"; // 커서

export default function IntroPage() {
    const navigate = useNavigate();

    const cursorRef = useRef<HTMLDivElement>(null); // 마우스
    const containerRef = useRef<HTMLDivElement>(null);
    const ropeClusterRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    const [cursorType, setCursorType] = useState<CursorType>("default");

    const handleStart = () => {
        navigate('/map');
    }

    // 마우스
    useEffect(() => {
        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3" });
    
        const handleMouseMove = (e: MouseEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // 커서 이미지 경로
    const getCursorImage = () => {
        if (cursorType == "objectOn") {
            return "url('/mouseOn.png')";
        } else {
            return "url('/mouseOff.png')";
        }
    }

    // 등장 타임라인
    useGSAP(() => {
        const tl = gsap.timeline();

        // 초기 상태
        gsap.set(ropeClusterRef.current, {
            y: -900,
            rotate: 8,
            transformOrigin: "50% 0%"
        });
        gsap.set([logoRef.current, btnRef.current], {
            scale: 0,
            opacity: 0
        });

        // 위에서 아래로 낙하
        tl.to(ropeClusterRef.current, {
            y: -150,
            rotation: 0,
            duration: 1.8,
            ease: "elastic.out(1, 0.45)"
        })

        // 로고 튀어나옴
        .to(logoRef.current, {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "back.out(2)"
        }, "-=0.6")

        // 입장 버튼
        .to(btnRef.current, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
        }, "-=0.2")
        // 루프 애니메이션
        .add(() => {
            gsap.to(ropeClusterRef.current, {
                rotation: 3,
                duration: 2.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    }, { scope: containerRef });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ropeClusterRef.current) return;
        const { clientX } = e;
        const windowWidth = window.innerWidth;

        const normalizedX = (clientX / windowWidth) * 2 - 1;

        gsap.to(ropeClusterRef.current, {
            x: normalizedX * 25,
            overwrite: "auto",
            duration: 0.5,
            ease: "power2.out"
        });
    };

    return (
        <div
            ref={containerRef}
            className="introContainer"
            onMouseMove={handleMouseMove}
        >
            {/* 커서 */}
            <div 
                className='cursorImg'
                ref={cursorRef}
                style={{
                    backgroundImage: getCursorImage(),
                }}
            />

            {/* 배경 영역 */}
            <img 
                src={IntroBack}
                alt="배경"
                className="backImg"
            />

            {/* 캐릭터 뭉치 */}
            <div ref={ropeClusterRef} className="ropeCluster">
                <img 
                    src={Tetehr}
                    alt="캐릭터"
                    className="clusterImg"
                />
            </div>

            {/* 로고 & 버튼 */}
            <div className="introBottomBox">
                <div ref={logoRef} className="logoBox">
                    <img 
                        src={Logo}
                        alt="로고"
                        className="logoImg"
                    />
                </div>

                <button
                    ref={btnRef}
                    onClick={handleStart}
                    className="enterBtn"
                    onMouseEnter={() => setCursorType('objectOn')}
                    onMouseLeave={() => setCursorType('default')}
                >
                    <span>Try Everything!</span>
                </button>
            </div>

            <Footer />
        </div>
    )
}