import { useRef, useEffect, ReactNode } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'dropdown' | 'center';
  className?: string;
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'dropdown',
  className = ''
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    if (!isOpen) return;

    if (position === 'center' && overlayRef.current && modalRef.current) {
      // Animate overlay
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      // Animate modal
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    } else if (modalRef.current) {
      // Dropdown animation
      gsap.fromTo(modalRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.4)' }
      );
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (position === 'center') {
    return (
      <div ref={overlayRef} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div
          ref={modalRef}
          className={`relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-ui-border bg-ui-bg/95 shadow-2xl backdrop-blur-xl ${className}`}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-ui-border px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ui-muted transition-colors hover:bg-ui-panel hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
          <div className="overflow-y-auto max-h-[calc(85vh-60px)]">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={modalRef}
      className={`absolute top-14 left-0 right-0 z-[9999] mx-4 overflow-hidden rounded-2xl border border-ui-border bg-ui-bg/95 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-ui-border px-4 py-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-ui-muted">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-ui-muted transition-colors hover:bg-ui-panel hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {children}
    </div>
  );
};
