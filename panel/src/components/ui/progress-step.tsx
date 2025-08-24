import {cn} from "@/lib/utils"
import {Check} from "lucide-react"

interface ProgressStepProps {
    steps: {
        label: string
        completed?: boolean
        current?: boolean
    }[]
    onStepClick?: (stepIndex: number) => void
    className?: string
}

export function ProgressStep({steps, onStepClick, className}: ProgressStepProps) {
    return (
        <div className={cn("flex flex-col space-y-3", className)}>
            {steps.map((step, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 border hover:scale-[1.02]",
                        step.current
                            ? "bg-[oklch(0.7554_0.1534_231.639)]/10 border-[oklch(0.7554_0.1534_231.639)]/40 shadow-sm"
                            : step.completed
                                ? "bg-green-500/5 border-green-500/20 text-green-700 hover:bg-green-500/10 hover:border-green-500/30"
                                : "bg-muted/20 border-muted-foreground/20 text-muted-foreground hover:bg-muted/30 hover:border-muted-foreground/30"
                    )}
                    onClick={() => onStepClick?.(index)}
                >
                    <div
                        className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                            step.current
                                ? "bg-[oklch(0.7554_0.1534_231.639)] text-white scale-110"
                                : step.completed
                                    ? "bg-green-500 text-white"
                                    : "bg-muted-foreground/30 text-muted-foreground"
                        )}
                    >
                        {step.completed ? <Check className="w-3 h-3"/> : (index + 1)}
                    </div>

                    <div className="flex-1 min-w-0">
            <span className={cn(
                "text-xs font-medium transition-all duration-300 truncate block",
                step.current ? "text-[oklch(0.7554_0.1534_231.639)]" : ""
            )}>
              {step.label}
            </span>
                    </div>

                    <div className="ml-auto">
                        {step.current && (
                            <div
                                className="px-2 py-1 bg-[oklch(0.7554_0.1534_231.639)]/20 text-[oklch(0.7554_0.1534_231.639)] rounded-md text-xs font-medium border border-[oklch(0.7554_0.1534_231.639)]/30">
                                Current
                            </div>
                        )}
                        {step.completed && (
                            <div
                                className="px-2 py-1 bg-green-500/20 text-green-700 rounded-md text-xs font-medium border border-green-500/30">
                                Done
                            </div>
                        )}
                        {!step.current && !step.completed && (
                            <div
                                className="px-2 py-1 bg-muted-foreground/20 text-muted-foreground rounded-md text-xs font-medium border border-muted-foreground/30">
                                Pending
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
