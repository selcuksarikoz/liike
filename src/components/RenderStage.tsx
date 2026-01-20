import { useEffect, useRef } from 'react';
import { useRenderStore } from '../store/renderStore';

type Props = {
  stageRef: React.RefObject<HTMLDivElement>;
  className?: string;
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const RenderStage = ({ stageRef, className }: Props) => {
  const { durationMs } = useRenderStore();
  const orbRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    const animation = orb.animate(
      [
        { transform: 'translate3d(-30%, -10%, 0) scale(0.9)', filter: 'blur(0px)' },
        { transform: 'translate3d(30%, 10%, 0) scale(1.05)', filter: 'blur(2px)' },
        { transform: 'translate3d(-10%, 25%, 0) scale(1)', filter: 'blur(0px)' },
      ],
      {
        duration: durationMs,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out',
      }
    );

    return () => animation.cancel();
  }, [durationMs]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const animation = card.animate(
      [
        { transform: 'translateY(0px) scale(1)', opacity: 0.9 },
        { transform: 'translateY(-12px) scale(1.01)', opacity: 1 },
      ],
      {
        duration: durationMs / 2,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out',
      }
    );

    return () => animation.cancel();
  }, [durationMs]);

  return (
    <div
      ref={stageRef}
      className={cx(
        'relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl shadow-black/50',
        className
      )}
    >
      <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-blue-300/40 blur-3xl" />
      <div className="absolute right-0 top-6 h-40 w-40 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-cyan-200/30 blur-2xl" />
      <div
        ref={orbRef}
        className="absolute inset-0 scale-125 bg-gradient-to-r from-cyan-400/40 via-blue-400/30 to-indigo-500/30 mix-blend-screen blur-3xl"
      />

      <div className="absolute inset-0 flex items-center justify-center px-10">
        <div
          ref={cardRef}
          className="w-full max-w-xl rounded-2xl border border-slate-100/60 bg-white/70 p-6 shadow-lg backdrop-blur dark:border-slate-700/50 dark:bg-slate-900/70"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-inner" />
            <div className="h-2 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-5/6 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-2/3 rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="h-12 rounded-xl bg-gradient-to-br from-cyan-400/70 to-blue-500/70 shadow-inner dark:from-cyan-500/60 dark:to-blue-600/60" />
            <div className="h-12 rounded-xl bg-gradient-to-br from-emerald-400/70 to-cyan-500/70 shadow-inner dark:from-emerald-500/60 dark:to-cyan-600/60" />
            <div className="h-12 rounded-xl bg-gradient-to-br from-amber-400/70 to-rose-400/70 shadow-inner dark:from-amber-500/60 dark:to-rose-500/60" />
          </div>
        </div>
      </div>
    </div>
  );
};
