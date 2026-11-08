import { useEffect, useRef, useState, type PointerEvent } from 'react';

interface UseUnitGestureOptions {
  elementSelector: string;
  currentUnits: number;
  onApplyUnits: (units: number) => void;
}

export function useUnitGesture({
  elementSelector,
  currentUnits,
  onApplyUnits,
}: UseUnitGestureOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<number | null>(null);

  const selectedUnitsRef = useRef<number | null>(null);
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

    if (Math.hypot(dx, dy) < 30) {
      setSelectedUnits(currentUnits);
      selectedUnitsRef.current = currentUnits;
      return;
    }

    const options = [
      { units: 5, angle: Math.PI },
      { units: 10, angle: 0 },
      { units: 20, angle: -Math.PI * 0.75 },
      { units: 30, angle: -Math.PI * 0.25 },
    ];

    const nearest = options.reduce<{ units: number; distance: number }>(
      (best, option) => {
        const distance = Math.hypot(
          dx - Math.cos(option.angle) * 80,
          dy - Math.sin(option.angle) * 80,
        );
        return distance < best.distance
          ? { units: option.units, distance }
          : best;
      },
      { units: 1, distance: Infinity },
    );

    const selection = nearest.distance <= 58 ? nearest.units : null;
    setSelectedUnits(selection);
    selectedUnitsRef.current = selection;
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
      setSelectedUnits(null);
      selectedUnitsRef.current = null;
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
      if (pointerMoved.current && selectedUnitsRef.current !== null) {
        onApplyUnits(selectedUnitsRef.current);
      }
      setIsOpen(false);
      setSelectedUnits(null);
      selectedUnitsRef.current = null;
      longPressStarted.current = false;
      pointerMoved.current = false;
      return;
    }

    // Short tap: increment by 1 (cycling back to 1 if >= 30)
    onApplyUnits(currentUnits >= 30 ? 1 : currentUnits + 1);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setIsOpen(false);
    setSelectedUnits(null);
    selectedUnitsRef.current = null;
    longPressStarted.current = false;
    pointerMoved.current = false;
  };

  return {
    isOpen,
    selectedUnits,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}

