import React, { useRef, useState, useEffect, act } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';
import './MapPage.css';

import Modal from '../components/Modal';
import FlyingText from './FlyingText';
import BuildingZone from './BuildingZone';

type CursorType = "default" | "objectOn";
type ModalType = "trailer" | "game" | "profile" | "gallery" | "null";

// 사용할 GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export default function MapPage() {
    const containerRef = useRef<HTMLDivElement>(null); // 로드
    const characterRef = useRef<HTMLDivElement>(null); // 캐릭터
    const cursorRef = useRef<HTMLDivElement>(null); // 마우스

    const [cursorType, setCursorType] = useState<CursorType>("default");
    const [activeModal, setActiveModal] = useState<ModalType | null>(null);

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

    // 로드 & 캐릭터
    useGSAP(() => {
        // 캐릭터 애니메이션
        gsap.to(characterRef.current, {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top", 
                end: "bottom 90%",
                scrub: 0.2,
                //markers: true // 디버깅 확인용
            },
            motionPath: {
                path: "#my-path",
                align: "#my-path",
                alignOrigin: [0.5, 0.5],
                autoRotate: true
            },
            ease: "none"
        });
    }, { scope: containerRef });

    return (
        <div className="containerRef" ref={containerRef}>
            {/* 배경 이미지 */}
            <img 
                src="../src/assets/map.png"
                alt="배경 이미지"
                style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    pointerEvents: "none",
                    zIndex: -9
                }}
            />

            {/* 커서 */}
            <div 
                ref={cursorRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100px",
                    height: "100px",
                    pointerEvents: "none",
                    zIndex: 9999,
                    transform: "translate(-50%, -50%)",
                    transition: "width 0.2s, height 0.2s, background-color 0.2s",
                    backgroundImage: getCursorImage(),
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center"
                }}
            />

            <div className="scrollText">
                Try scrolling down! ↓
            </div>

            {/* 길 */}
            <svg 
                viewBox="-200 0 519 4000"
                style={{ width: "100%", height: "100%", position: "absolute", top: "18%", left: 0, pointerEvents: "none"}}>
                <path 
                    id="my-path"
                    d="M221.034 15C221.034 215.5 -86.7442 560.555 50.0462 1092.77C221.034 1758.03 511.014 1878.34 491.015 2556.75C475.683 2695.09 426.02 3030.82 350.025 3267"
                    fill="none"
                    stroke="#F0E9B2"
                    strokeWidth="20"
                />
            </svg>

            {/* 캐릭터 */}
            <div
                className="characterRef"
                ref={characterRef}
            >
                <img 
                    src="../src/assets/judy.png"
                    alt="캐릭터"
                    style={{
                        width: "80px",
                        height: "auto",
                        rotate: "-90deg"
                    }}
                />
            </div>

            {/* 건물 */}
            <div 
                style={{
                    position: 'absolute',
                    right: '15%',
                    top: '20%',
                    zIndex: 12
                }}
            >
                <BuildingZone 
                    buildingImg="../src/assets/build.png"
                    characterImg="../src/assets/buildChat.png"
                    onHoverState={(isHover => setCursorType(isHover ? "objectOn" : "default"))}
                />
            </div>

            {/* 글씨 인터랙션 */}
            <div 
                className="typingBox">
                <FlyingText
                    lines={[
                        "Welcome to Zootopia",
                        "Anyone can be anything",
                        "Try everything!"
                    ]}
                />
            </div>

            <div
                onClick={() => setActiveModal("gallery")}
                className="modalDiv modalDiv1"
                onMouseEnter={() => setCursorType("objectOn")}
                onMouseLeave={() => setCursorType("default")}
            >
                <img 
                    src="../src/assets/div1.png"
                    alt="포스터"
                    style={{
                        width: "100%",
                        height: "100%"
                    }}
                />
            </div>

            <div
                className="modalDiv modalDiv2"
                onMouseEnter={() => setCursorType("objectOn")}
                onMouseLeave={() => setCursorType("default")}
            >
                <img 
                    src="../src/assets/div2.png"
                    alt="게임"
                    style={{
                        width: "100%",
                        height: "100%"
                    }}
                />
            </div>

            <div
                onClick={() => setActiveModal("trailer")}
                className="modalDiv modalDiv3"
                onMouseEnter={() => setCursorType("objectOn")}
                onMouseLeave={() => setCursorType("default")}
            >
                <img 
                    src="../src/assets/div3.png"
                    alt="포스터"
                    style={{
                        width: "100%",
                        height: "100%"
                    }}
                />
            </div>

            {/* 공통 모달 렌더링 영역 */}
            <Modal
                isOpen={activeModal !== null}
                onClose={() => setActiveModal(null)}
                title={
                    activeModal === "trailer" ? "주토피아 트레일러" :
                    activeModal === "game" ? "미니게임" :
                    activeModal === "profile" ? "프로필" :
                    activeModal === "gallery" ? "갤러리" : "주토피아 월드"
                }
            >
                {/* 트레일러 */}
                {activeModal === "trailer" && (
                    <div style={{ width: "100%", height: "400px" }}>
                        <iframe 
                            style={{ width: "560px", height: "315px", border: 0 }}
                            src="https://www.youtube.com/embed/KMmCFtibicE?si=n6DbpJgUtwMS2VpT" 
                            title="YouTube video player" 
                            allowFullScreen 
                        />
                    </div>
                )}
            </Modal>

        </div>
    )
}