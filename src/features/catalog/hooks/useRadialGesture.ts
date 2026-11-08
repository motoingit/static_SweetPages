import { useEffect, useRef, useState, type PointerEvent } from 'react';

interface UseRadialGestureOptions {
  elementSelector: string;
  onSelect: (kg: number) => void;
}

export function useRadialGesture({
  elementSelector,
  onSelect,
}: UseRadialGestureOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKg, setSelectedKg] = useState<number | null>(null);

  const selectedKgRef = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressStarted = useRef(false);
  const pointerMoved = useRef(false);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  const updateSelectionFromCoords = (clientX: number, clientY: number) => {
    const button = document.querySelector(elementSelector);
    if (!(button instanceof HTMLElement)) return;

    const bounds = button.getBoundingClientRect();
    const dx = clientX - (bounds.left + bounds.width / 2);
    const dy = clientY - (bounds.top + bounds.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Center zone: 1 kg
    if (distance < 72) {
      setSelectedKg(1);
      selectedKgRef.current = 1;
      return;
    }

    const candidates = [
      { kg: 0.25, angle: Math.PI },
      { kg: 0.5, angle: 0 },
      { kg: 2, angle: -Math.PI * 0.75 },
      { kg: 5, angle: -Math.PI * 0.25 },
    ];

    const radialDistance = 112;
    const nearest = candidates.reduce<{ kg: number; distance: number }>(
      (best, candidate) => {
        const optionX = Math.cos(candidate.angle) * radialDistance;
        const optionY = Math.sin(candidate.angle) * radialDistance;
        const optionDistance = Math.hypot(dx - optionX, dy - optionY);
        return optionDistance < best.distance
          ? { kg: candidate.kg, distance: optionDistance }
          : best;
      },
      { kg: 0, distance: Infinity },
    );

    const selection = nearest.distance <= 72 ? nearest.kg : null;
    setSelectedKg(selection);
    selectedKgRef.current = selection;
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    longPressStarted.current = false;
    pointerMoved.current = false;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    longPressTimer.current = setTimeout(() => {
      longPressStarted.current = true;
      setIsOpen(true);
      setSelectedKg(null);
      selectedKgRef.current = null;
      if ('vibrate' in navigator) navigator.vibrate(15);
    }, 300);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (longPressStarted.current) {
      pointerMoved.current = true;
      updateSelectionFromCoords(event.clientX, event.clientY);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    if (longPressStarted.current) {
      if (pointerMoved.current && selectedKgRef.current !== null) {
        onSelect(selectedKgRef.current);
      }
      setIsOpen(false);
      setSelectedKg(null);
      selectedKgRef.current = null;
      longPressStarted.current = false;
      pointerMoved.current = false;
      return;
    }

    // Short tap default: 1 kg
    onSelect(1);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setIsOpen(false);
    setSelectedKg(null);
    selectedKgRef.current = null;
    longPressStarted.current = false;
    pointerMoved.current = false;
  };

  return {
    isOpen,
    selectedKg,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}

