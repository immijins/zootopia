import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import './PawpsicleGame.css';
import GameJuice from '../../assets/gameJuice.png';
import GameStick from '../../assets/gameStick.png';
import GameStamp from '../../assets/gameStamp.png';
import GameIce from '../../assets/gameIce.png';
import GameChat1 from '../../assets/gameChat1.png';
import GameChat2 from '../../assets/gameChat2.png';


// 진행 상태 : 0 (빈틀) -> 1(주스 채움) -> 2(막대 꽂음) -> 3(배달) -> 4(완료)
type GameProgress = 0 | 1 | 2 | 3 | 4;
type GameItem = 'juice' | 'stick' | 'pawpsicle';

export default function PawpsicleGame() {
    const [progress, setProgress] = useState<GameProgress>(0);
    const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
    
    const liquidRef = useRef<HTMLDivElement>(null);
    const pawpsicleRef = useRef<HTMLDivElement>(null);
    const hamsterRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // 1단계
        if (progress === 1 && liquidRef.current) {
            gsap.to(liquidRef.current, {
                height: "100%",
                duration: 1.5,
                ease: "power1.inOut",
                onComplete: () => setProgress(2)
            });
        }

        // 3단계
        if (progress === 3 && pawpsicleRef.current) {
            gsap.fromTo(pawpsicleRef.current, 
                { scale: 0, rotation: -20 },
                { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.5)" }
            );
            gsap.to(pawpsicleRef.current, {
                y: -10, yoyo: true, repeat: -1, duration: 0.8, ease: "sine.inOut"
            });
        }

        // 4단계
        if (progress === 4 && hamsterRef.current) {
            gsap.to(hamsterRef.current, {
                y: -20,
                yoyo: true, 
                repeat: -1,
                duration: 0.2,
                ease: "power1.inOut"
            });
        }
    }, [progress]);

    // 드래그 시작 시 데이터 저장
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemType: string) => {
        e.dataTransfer.setData('item', itemType);
    };

    // 드롭 허용
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // 재료 틀에 떨어뜨림
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const item = e.dataTransfer.getData('item');

        applyItemToMold(item);
    };

    // 햄스터에게 드롭
    const handleDropOnHamsters = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const item = e.dataTransfer.getData('item');
        applyItemToHamsters(item);
    }

    const applyItemToMold = (item: string) => {
        if ((progress === 0 && item === 'juice') || (progress === 2 && item === 'stick')) {
            setProgress(progress === 0 ? 1 : 3);
            setSelectedItem(null);
        }
    };

    const applyItemToHamsters = (item: string) => {
        if (progress === 3 && item === 'pawpsicle') {
            setProgress(4);
            setSelectedItem(null);
        }
    };

    const selectItem = (item: GameItem) => {
        setSelectedItem(item);
    };

    const handleMoldTap = () => {
        if (selectedItem) applyItemToMold(selectedItem);
    };

    const handleHamsterTap = () => {
        if (selectedItem) applyItemToHamsters(selectedItem);
    };

    const resetGame = () => {
        setProgress(0);
        setSelectedItem(null);
    };

    return (
        <div className='gameContainer'>
            <h3 className='gameTitle'>
                닉의 발바닥 아이스크림
            </h3>
            <p className='gameInfo'>
                {progress === 0 && '1단계: 틀에 빨간 주스를 드래그해서 부어주세요.'}
                {progress === 1 && '주스를 얼리는 중...'}
                {progress === 2 && '2단계: 얼어붙은 주스에 나무 막대를 꽂아주세요.'}
                {progress === 3 && '3단계: 완성! 퇴근하는 레밍 은행원들에게 배달하세요!'}
                {progress === 4 && '야미~ 햄스터들이 아주 행복해합니다.'}
            </p>

            {/* 게임 전체 영역 */}
            <div className='gameInner'>
                {/* 아이스크림 생성 영역 */}
                {progress < 4 && (<div className='gameDivLeft'>
                    {/* 드래그 할 재료들 */}
                    {progress < 3 && (
                        <div className='iceGameDiv'>
                            <div className='iceElement'>
                                <div
                                    className='iceOfJuice'
                                    draggable={progress === 0}
                                    onClick={() => {if (progress === 0) selectItem('juice')}}
                                    onDragStart={(e) => handleDragStart(e, 'juice')}
                                    style={{
                                        backgroundColor: progress === 0 ? '#fff0f0' : '#eaeaea',
                                        cursor: progress === 0 ? 'grab' : 'not-allowed',
                                        opacity: progress === 0 ? 1 : 0.4,
                                    }}
                                >
                                    <img
                                        className='iceElementImg'
                                        src={GameJuice}
                                        alt='붉은주스' />
                                </div>
                                <span 
                                    className='iceElementTxt'
                                    style={{ 
                                        color: progress === 0 ? '#ff8787' : '#ddd'
                                    }}>
                                        붉은주스
                                </span>
                            </div>

                            <div className='iceElement'>
                                <div
                                    className='iceOfStick'
                                    draggable={progress === 2}
                                    onClick={() => selectItem('stick')}
                                    onDragStart={(e) => handleDragStart(e, 'stick')}
                                    style={{
                                        backgroundColor: progress === 2 ? '#fff4e6' : '#f0f0f0',
                                        cursor: progress === 2 ? 'grab' : 'not-allowed',
                                        opacity: progress === 2 ? 1 : 0.4,
                                    }}
                                >
                                    <img
                                        className='iceElementImg'
                                        src={GameStick}
                                        alt='나무막대' />
                                </div>
                                <span 
                                    className='iceElementTxt'
                                    style={{ 
                                        color: progress === 2 ? '#ffa94d' : '#ddd'
                                    }}>
                                        나무막대
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 아이스크림 틀 */}
                    {progress < 3 && (
                        <div
                            className='iceFullBox'
                            onClick={handleMoldTap}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            data-selected={selectedItem ? 'true' : undefined}>   
                            <img 
                                className='iceStamp'
                                src={GameStamp}
                                alt="발바닥 모양" />
                            {/* 차오르는 애니메이션 */}
                            {progress >= 1 && progress < 3 && (
                                <div
                                    className='growIce'
                                    ref={liquidRef}
                                    style={{
                                        height: progress >= 2 ? '100%' : '0%', }}
                                />
                            )}
                        </div>
                    )}

                    {progress === 3 && (
                        <div
                            className='icecream'
                            ref={pawpsicleRef}
                            draggable
                            onClick={() => selectItem('pawpsicle')}
                            onDragStart={(e) => handleDragStart(e, 'pawpsicle')}
                            >
                            <img 
                                src={GameIce}
                                alt="아이스크림"
                            />
                        </div>
                    )}
                </div>)}

                {/* 3. 햄스터(손님) 영역 - 완성되었을 때 등장 */}
                <div
                    className='customerDiv'
                    onClick={handleHamsterTap}
                    onDragOver={handleDragOver}
                    onDrop={handleDropOnHamsters}
                    style={{
                        border: progress >= 3 ? '2px dashed #74c0fc' : '2px dashed transparent', 
                    }}
                    >
                    {progress >= 3 && (
                        <div ref={hamsterRef} style={{ fontSize: '60px', letterSpacing: '-10px' }}>
                        {progress === 4 ? (
                            <img
                                className='customerImg customerOk'
                                src={GameChat2}
                                alt="햄스터"
                            />
                        ) : (
                            <img
                                className='customerImg'
                                src={GameChat1}
                                alt="햄스터"
                                style={{
                                    width: "90%",
                                    height: "90%"
                                }}
                            />
                        )} 
                        </div>
                    )}
                    {progress === 3 && 
                        <div className='dragTxt'>
                            여기로 드래그!
                        </div>
                    }
                    </div>
                </div>

                {progress === 4 && (
                    <button
                        className='replayBtn'
                        onClick={resetGame}
                    >
                        다시하기
                    </button>
                )}
            </div>

    )

}
