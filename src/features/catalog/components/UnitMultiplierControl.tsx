import { useUnitGesture } from '../hooks/useUnitGesture';

interface UnitMultiplierControlProps {
  productId: string;
  unitCount: number;
  onApplyUnits: (units: number) => void;
}

export function UnitMultiplierControl({
  productId,
  unitCount,
  onApplyUnits,
}: UnitMultiplierControlProps) {
  const elementSelector = `[data-unit-button="${productId}"]`;

  const {
    isOpen,
    selectedUnits,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useUnitGesture({
    elementSelector,
    currentUnits: unitCount,
    onApplyUnits,
  });

  return (
    <div className={`unit-trigger ${isOpen ? 'is-open' : ''}`}>
      {isOpen && (
        <div className="unit-radial-menu" role="menu" aria-label="Choose units">
          {[20, 30, 5, 10].map((units) => (
            <span
              key={units}
              className={`unit-option unit-${units} ${selectedUnits === units ? 'selected' : ''}`}
            >
              ×{units}
            </span>
          ))}
          <span
            className={`unit-option unit-center ${selectedUnits === unitCount ? 'selected' : ''}`}
          >
            ×{unitCount}
          </span>
        </div>
      )}
      <button
        data-unit-button={productId}
        className="button ghost unit-button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerMove}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        ×{unitCount}
      </button>
    </div>
  );
}

