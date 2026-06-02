import { useEffect, useState } from "react";
import { Sparkles, SparklesIcon, Zap, ZapOff } from "lucide-react";
import { getMotionOverride, setMotionDisabled, applyMotionAttribute } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Header button: lets the user toggle all NOVA motion on/off (persisted). */
export function MotionToggle({ className }: { className?: string }) {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setDisabled(getMotionOverride());
    applyMotionAttribute();
    const onChange = () => setDisabled(getMotionOverride());
    window.addEventListener("nova:motion-change", onChange);
    return () => window.removeEventListener("nova:motion-change", onChange);
  }, []);

  const toggle = () => setMotionDisabled(!disabled);

  return (
    <button
      onClick={toggle}
      title={disabled ? "Enable animations" : "Disable animations"}
      aria-label={disabled ? "Enable animations" : "Disable animations"}
      aria-pressed={disabled}
      className={cn(
        "hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground md:flex",
        className,
      )}
    >
      {disabled ? <ZapOff className="h-[18px] w-[18px]" /> : <Zap className="h-[18px] w-[18px]" />}
    </button>
  );
}

export default MotionToggle;