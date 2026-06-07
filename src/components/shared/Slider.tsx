interface SliderProps {
  label: string
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
}

export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
}: SliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-black/70">{label}</span>
        <span className="text-xs font-mono text-black/50">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="
          w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-surface-border accent-accent
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-accent
          [&::-webkit-slider-thumb]:shadow-sm
          [&::-webkit-slider-thumb]:cursor-pointer
        "
      />
    </div>
  )
}
