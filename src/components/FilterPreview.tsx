import { useEffect, useRef } from 'react';
import { ANIMATION_PRESETS, STAGGER_DEFAULTS } from '../constants/animations';
import type { LayoutFilter } from './AnimationsPanel';

export const FilterPreview = ({
  filter,
  isActive,
}: {
  filter: LayoutFilter;
  isActive: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<Animation[]>([]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const elements = elementsRef.current.filter(Boolean) as Element[];
    if (elements.length === 0) return;

    // Cancel previous animations
    animationsRef.current.forEach((anim) => anim.cancel());
    animationsRef.current = [];

    // Animate with stagger using Web Animations API
    const { keyframes, options } = ANIMATION_PRESETS.filterPreview;
    elements.forEach((el, i) => {
      const anim = el.animate([...keyframes], {
        ...options,
        delay: i * STAGGER_DEFAULTS.filters,
      });
      animationsRef.current.push(anim);
    });

    return () => {
      animationsRef.current.forEach((anim) => anim.cancel());
    };
  }, [isActive, filter]);

  // Favorites - Heart icon
  if (filter === 'favorites') {
    return (
      <div ref={containerRef} className="flex items-center justify-center w-6 h-5">
        <div
          ref={(el) => {
            elementsRef.current[0] = el;
          }}
          className={`text-lg ${isActive ? 'text-black' : 'text-current opacity-60'}`}
        >
          ❤️
        </div>
      </div>
    );
  }

  // Text - Typography icon
  if (filter === 'text') {
    return (
      <div ref={containerRef} className="flex items-center justify-center w-6 h-5">
        <div
          ref={(el) => {
            elementsRef.current[0] = el;
          }}
          className={`text-sm font-bold ${isActive ? 'text-black' : 'text-current opacity-60'}`}
        >
          Aa
        </div>
      </div>
    );
  }

  // Different layouts for each filter type
  if (filter === 'single') {
    return (
      <div ref={containerRef} className="flex items-center justify-center w-6 h-5">
        <div
          ref={(el) => {
            elementsRef.current[0] = el;
          }}
          className={`rounded-sm ${isActive ? 'bg-black/90' : 'bg-current opacity-50'}`}
          style={{ width: 16, height: 16 }}
        />
      </div>
    );
  }

  if (filter === 'duo') {
    return (
      <div ref={containerRef} className="flex items-center justify-center gap-0.5 w-6 h-5">
        {[0, 1].map((i) => (
          <div
            key={i}
            ref={(el) => {
              elementsRef.current[i] = el;
            }}
            className={`rounded-sm ${isActive ? 'bg-black/90' : 'bg-current opacity-50'}`}
            style={{ width: 7, height: 14 }}
          />
        ))}
      </div>
    );
  }

  if (filter === 'trio') {
    return (
      <div ref={containerRef} className="flex items-center justify-center gap-0.5 w-6 h-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => {
              elementsRef.current[i] = el;
            }}
            className={`rounded-sm ${isActive ? 'bg-black/90' : 'bg-current opacity-50'}`}
            style={{ width: 5, height: 12 }}
          />
        ))}
      </div>
    );
  }

  // Fallback
  return null;
};
