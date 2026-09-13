import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css'

import Close from '../../assets/close.png'

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 모달 열려있을 때 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className='modalContainer'
            onClick={onClose}
        >
            {/* 모달 영역 */}
            <div
                className='modalInner'
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div
                    className="modalHeader"
                >
                    <h2 className="modalTitle">
                        {title}
                    </h2>
                    {/* 닫기 버튼 */}
                    <button
                        className='modalClose'
                        onClick={onClose}
                    >
                        <img
                            src={Close}
                            alt="닫기"
                        />
                    </button>
                </div>

                {/* 본문 */}
                <div 
                    className='modalContents'>
                    {children}
                </div>
            </div>

        </div>,
        document.body
    )
}