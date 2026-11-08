interface RadialQuantityMenuProps {
  selectedKg: number | null;
}

export function RadialQuantityMenu({ selectedKg }: RadialQuantityMenuProps) {
  const options = [
    { kg: 2, label: '2 kg', className: 'radial-option upper-left' },
    { kg: 5, label: '5 kg', className: 'radial-option upper-right' },
    { kg: 0.25, label: '¼ kg', className: 'radial-option left' },
    { kg: 0.5, label: '½ kg', className: 'radial-option right' },
  ];

  return (
    <div className="radial-menu" role="menu" aria-label="Choose quantity">
      {options.map((option) => (
        <span
          key={option.kg}
          className={`${option.className} ${selectedKg === option.kg ? 'selected' : ''}`}
        >
          {option.label}
        </span>
      ))}
      <span className={`radial-option center ${selectedKg === 1 ? 'selected' : ''}`}>
        1 kg
      </span>
    </div>
  );
}

