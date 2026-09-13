import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';
import './MapPage.css';

import Modal from '../../components/Modal/Modal';
import FlyingText from '../../components/FlyingText/FlyingText';
import BuildingZone from '../../components/BuildingZone/BuildingZone';
import PawpsicleGame from '../../components/PawpsicleGame/PawpsicleGame';
import Footer from '../../components/Footer/Footer';

import Div1 from '../../assets/div1.png';
import Div2 from '../../assets/div2.png';
import Div3 from '../../assets/div3.png';
import Walk from '../../assets/walk.svg';
import Map from '../../assets/Map.png';
import Judy from '../../assets/judy.png';
import Build from '../../assets/build.png';
import BuildChat from '../../assets/buildChat.png';
import Modal1 from '../../assets/modal1.png';

type CursorType = "default" | "objectOn"; // 커서
type ModalType = "trailer" | "game" | "profile" | "null"; // 모달
interface StepPoint { // 발자국
    x: number;
    y: number;
    rotation: number;
    progress: number;
}
interface SpotZone { // 캐릭터 이동
    id: string;
    modalType: "profile" | "game" | "trailer" | "null"; 
    title: string;
    bubbleText: string;
    top: string;
    left?: string;
    triggerProgress: number; // 도착시점
    zoomOrigin: string; // 중심축
    imgSrc: string;
}

const SPOT_ZONES: SpotZone[] = [
    {
        id: "spot-profile",
        modalType: "profile",
        title: "캐릭터 소개",
        bubbleText: "🔍 Click Me!",
        top: "25%",
        left: "20%",
        triggerProgress: 0.20,
        zoomOrigin: "85% 20%",
        imgSrc: `${Div1}`
    }, 
    {
        id: "spot-game",
        modalType: "game",
        title: "게임",
        bubbleText: "🔍 Click Me!",
        top: "50%",
        left: "20%",
        triggerProgress: 0.45,
        zoomOrigin: "15% 52%",
        imgSrc: `${Div2}`
    }, {
        id: "spot-trailer",
        modalType: "trailer",
        title: "예고편 공개!",
        bubbleText: "🔍 Click Me!",
        top: "80%",
        left: "28%",
        triggerProgress: 0.80,
        zoomOrigin: "82% 82%",
        imgSrc: `${Div3}`
    }
]

// 사용할 GSAP 플러그인 등록
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export default function MapPage() {
    const containerRef = useRef<HTMLDivElement>(null); // 로드
    const worldRef = useRef<HTMLDivElement>(null); // 카메라 줌
    const characterRef = useRef<HTMLDivElement>(null); // 캐릭터
    const cursorRef = useRef<HTMLDivElement>(null); // 마우스
    const characterInnerRef = useRef<HTMLDivElement>(null); // 캐릭터 영역
    const drawPathRef = useRef<SVGPathElement>(null); // 드로잉 라인
    const footprintsRef = useRef<SVGAElement>(null); // 발자국
    const bubbleRef = useRef<(HTMLDivElement | null)[]>([]); // 말풍선

    const [cursorType, setCursorType] = useState<CursorType>("default");
    const [activeModal, setActiveModal] = useState<ModalType | null>(null);

    // 마우스
    useEffect(() => {
        const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        if (!hasFinePointer || !cursorRef.current) return;

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

    const handleMapImageLoad = () => {
        ScrollTrigger.refresh();
        if (characterRef.current) {
            gsap.set(characterRef.current, {
                motionPath: {
                    path: "#my-path",
                    align: "#my-path",
                    alignOrigin: [0.5, 0.5],
                    autoRotate: false,
                    end: 0
                }
            })
        }
    }

    // 로드 & 캐릭터
    useGSAP(() => {
        if (!drawPathRef.current || !containerRef.current || !footprintsRef.current || !characterRef.current || !worldRef.current || !bubbleRef.current) return;

        const path = drawPathRef.current;
        const totalLength = path.getTotalLength();

        // 길 드로잉
        gsap.set(path, {
            strokeDasharray: totalLength,
            strokeDashoffset: totalLength
        });

        // 걸어가는 느낌 애니메이션
        gsap.set(characterInnerRef.current, { transformOrigin: "50% 50%" });
        gsap.set(characterRef.current, {
            motionPath: {
                path: "#my-path",
                align: "#my-path",
                alignOrigin: [0.5, 0.5],
                autoRotate: false,
                end: 0
            }
        });

        // 말풍선 초기 숨김
        bubbleRef.current.forEach((bubble) => {
            if (bubble) gsap.set(bubble, {
                scale: 0, 
                opacity: 0, 
                transformOrigin: "bottom center"
            })
        })

        const walkBounce = gsap.to(characterInnerRef.current, {
            y: -10,
            duration: 0.28,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

        // 발자국 좌표 및 각도
        const stepDistance = 100; // 간격
        const stepCount = Math.floor(totalLength / stepDistance);
        const steps: StepPoint[] = [];

        for (let i = 1; i <= stepCount; i++) {
            const currentDist = i * stepDistance;
            const point = path.getPointAtLength(currentDist);
            const nextPoint = path.getPointAtLength(Math.min(currentDist + 2, totalLength));
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
        
            steps.push({
                x: point.x,
                y: point.y,
                rotation: angle + 90,
                progress: currentDist / totalLength
            });
        }

        // 발자국 DOM 생성
        footprintsRef.current.innerHTML = '';
        const footprintElements: SVGGElement[] = [];

        const iconSize = 36;

        steps.forEach((step, idx) => {
            const isEven = idx % 2 === 0;
            const sideOffset = isEven ? 8 : -8;

            const groupNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            groupNode.style.pointerEvents = 'none';

            const imgNode = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            imgNode.setAttribute('href', `${Walk}`);
            imgNode.setAttribute('width', `${iconSize}`);
            imgNode.setAttribute('height', `${iconSize}`);

            imgNode.setAttribute('x', `${-iconSize / 2}`);
            imgNode.setAttribute('y', `${-iconSize / 2}`);
            
            groupNode.appendChild(imgNode);
        
            gsap.set(groupNode, {
                x: step.x + sideOffset,
                y: step.y,
                transformOrigin: `50% 50%`,
                rotation: step.rotation,
                scale: 0,
                opacity: 0
            });

            footprintsRef.current?.appendChild(groupNode);
            footprintElements.push(groupNode);
        });

        // 통합 마스터
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3,
                onUpdate: () => {
                    // 스크롤 시에만 바운스
                    if (walkBounce.paused()) walkBounce.play();
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        walkBounce.pause();
                    }, 150);
                }
            }
        });

        // 드로잉 애니메이션
        masterTl.to(path, {
            strokeDashoffset: 0,
            ease: "none",
            duration: 1
        }, 0);

        masterTl.to(characterRef.current, {
            motionPath: {
                path: "#my-path",
                align: "#my-path",
                alignOrigin: [0.5, 0.5],
                autoRotate: false
            },
            ease: "none",
            duration: 1
        }, 0);

        // 발자국 애니메이션
        footprintElements.forEach((el, index) => {
            masterTl.to(el, {
                scale: 1,
                opacity: 0.85,
                duration: 0.04,
                ease: "back.out(2)"
            }, steps[index].progress);
        });

        /* 건물 근처 도착 시 카메라 줌인 & 말풍선 효과 */
        SPOT_ZONES.forEach((spot, index) => {
            const bubbleEl = bubbleRef.current[index];
            const prog = spot.triggerProgress;
            const duration = 0.07;

            masterTl.to(worldRef.current, {
                transformOrigin: spot.zoomOrigin,
                scale: 1.25,
                duration: duration,
                ease: "power2.out"
            }, prog - 0.04);

            if (bubbleEl) {
                masterTl.to(bubbleEl, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.04,
                    ease: "back.out(2)"
                }, prog);

                masterTl.to(bubbleEl, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.03,
                    ease: "power2.in"
                }, prog + duration);
            }

            masterTl.to(worldRef.current, {
                scale: 1,
                duration: duration,
                ease: "power2.inOut"
            }, prog + duration + 0.02);
        });

        return () => {
            clearTimeout(scrollTimeout);
            walkBounce.kill();
            masterTl.kill();
            if (footprintsRef.current) footprintsRef.current.innerHTML = '';
        };
    }, { scope: containerRef });

    return (
        <div className="containerRef" ref={containerRef}>
            
            {/* 커서 */}
            <div 
                className='cursorImg'
                ref={cursorRef}
                style={{
                    backgroundImage: getCursorImage(),
                }}
            />

            {/* 카메라 줌 */}
            <div ref={worldRef}>

                {/* 배경 이미지 */}
                <img 
                    src={Map}
                    alt="배경 이미지"
                    onLoad={handleMapImageLoad}
                    style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        pointerEvents: "none",
                        zIndex: -9
                    }}
                />

                <div className="scrollText">
                    Try scrolling down! ↓
                </div>

                {/* 길 */}
                <svg 
                    viewBox="-200 0 519 4200"
                    style={{ width: "100%", height: "100%", position: "absolute", top: "18%", left: 0, pointerEvents: "none"}}>
                    <path 
                        id="my-path"
                        d="M221.034 15C221.034 215.5 -86.7442 560.555 50.0462 1092.77C221.034 1758.03 511.014 1878.34 491.015 2556.75C475.683 2695.09 426.02 3030.82 350.025 3267"
                        fill="none"
                        stroke="none"
                        strokeWidth="20"
                        strokeLinecap="round"
                        opacity="0.4"
                    />

                    <path 
                        ref={drawPathRef}
                        d="M221.034 15C221.034 215.5 -86.7442 560.555 50.0462 1092.77C221.034 1758.03 511.014 1878.34 491.015 2556.75C475.683 2695.09 426.02 3030.82 350.025 3267"
                        fill="none"
                        stroke="none"
                        strokeWidth="20"
                        strokeLinecap="round"
                    />

                    <g ref={footprintsRef}/>
                </svg>


                {/* 캐릭터 외부 영역 */}
                <div
                    className="characterRef"
                    ref={characterRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100px',
                        pointerEvents: 'none',
                        zIndex: 25
                    }}
                >
                    {/* 캐릭터 */}
                    <div
                        ref={characterInnerRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            willChange: "transform",
                            rotate: "90deg"
                        }}
                    >
                        <img 
                            src={Judy}
                            alt="캐릭터"
                            style={{
                                width: "100%",
                                height: "auto",
                                rotate: "-90deg",
                                display: "block"
                            }}
                        />
                    </div>
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
                        buildingImg={Build}
                        characterImg={BuildChat}
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

                {/* 모달 및 말풍선 표시 */}
                {SPOT_ZONES.map((spot, index) => (
                    <div
                        key={spot.id}
                        className="modalDiv"
                        onClick={() => setActiveModal(spot.modalType)}
                        onMouseEnter={() => setCursorType("objectOn")}
                        onMouseLeave={() => setCursorType("default")}
                        style={{
                            top: spot.top,
                            left: spot.left,
                            zIndex: 30,
                            cursor: 'none'
                        }}
                    >
                        <div
                            className='bubbleRef'
                            ref={(el) => {(bubbleRef.current[index] = el)}}
                        >
                            {spot.bubbleText}
                            <div 
                                className='bubbleRefBottom'
                            />
                        </div>
                        
                        <img 
                            src={spot.imgSrc}
                            alt={spot.title}
                        />
                    </div>
                    
                ))}

                {/* 공통 모달 렌더링 영역 */}
                <Modal
                    isOpen={activeModal !== null}
                    onClose={() => setActiveModal(null)}
                    title={
                        activeModal === "trailer" ? "주토피아 트레일러" :
                        activeModal === "game" ? "미니게임" :
                        activeModal === "profile" ? "프로필" : "주토피아 월드"
                    }
                >
                    {/* 프로필 */}
                    {activeModal === "profile" && (
                        <div className='modalBox'>
                            <img 
                                src={Modal1}
                            />
                        </div>
                    )}

                    {/* 게임 */}
                    {activeModal === "game" && (
                        <div className='modalBox'>
                            <PawpsicleGame />
                        </div>
                    )}

                    {/* 트레일러 */}
                    {activeModal === "trailer" && (
                        <div className='modalBox'>
                            <iframe 
                                style={{ width: "100%", height: "100%", border: 0 }}
                                src="https://www.youtube.com/embed/KMmCFtibicE?si=n6DbpJgUtwMS2VpT" 
                                title="YouTube video player" 
                                allowFullScreen 
                            />
                        </div>
                    )}
                </Modal>


            </div>
            
            <Footer />
        </div>
    )
}