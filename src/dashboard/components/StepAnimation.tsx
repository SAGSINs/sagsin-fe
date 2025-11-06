import { motion, AnimatePresence } from "framer-motion";

export type StepEvent = {
  algo: "astar" | "dijkstra" | "greedy" | string;
  action: "expand" | "consider" | "relax" | "select" | "complete" | string;
  step?: number;
  node?: string;
  from?: string;
  to?: string;
  g?: number;
  f?: number;
  dist?: number;
  path?: string[];
};

type StepAnimationProps = {
  current: StepEvent | null;
};

const algoColorSchemes = {
  astar: {
    bg: "bg-blue-50",
    border: "border-blue-500",
    text: "text-blue-700",
    badge: "bg-blue-500 text-white",
  },
  dijkstra: {
    bg: "bg-green-50",
    border: "border-green-500",
    text: "text-green-700",
    badge: "bg-green-500 text-white",
  },
  greedy: {
    bg: "bg-orange-50",
    border: "border-orange-500",
    text: "text-orange-700",
    badge: "bg-orange-500 text-white",
  },
};

const algoNames = {
  astar: "A*",
  dijkstra: "Dijkstra",
  greedy: "Greedy",
};

export default function StepAnimation({ current }: StepAnimationProps) {
  const algo = current?.algo as keyof typeof algoColorSchemes;
  const colors = algo ? algoColorSchemes[algo] : algoColorSchemes.astar;
  
  return (
    <div className="border rounded p-3">
      <h2 className="font-semibold mb-2">Current Step Animation</h2>
      <div className="relative h-64 overflow-hidden bg-muted rounded">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={`${current.algo}-${current.action}-${current.node ?? current.to}-${current.step}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-x-0 top-4 mx-auto w-[90%] bg-background border-2 ${colors.border} ${colors.bg} rounded-lg p-3 shadow-lg`}
            >
              {/* Header with Algorithm Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${colors.badge}`}>
                  {algoNames[algo] || current.algo.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                  Step {current.step ?? 0}
                </span>
              </div>
              
              {/* Action and Node */}
              <div className={`font-semibold text-base ${colors.text} mb-2`}>
                <span className="capitalize">{current.action}</span>
                {" "}
                <span className="font-mono">
                  {current.node ?? current.from}
                  {current.to ? ` → ${current.to}` : ""}
                </span>
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(current.f !== undefined && current.f !== null) && (
                  <div className="bg-white rounded px-2 py-1 border border-blue-200">
                    <div className="text-blue-500 font-medium">f-score</div>
                    <div className="font-mono font-bold text-blue-700">
                      {typeof current.f === 'number' ? current.f.toFixed(2) : current.f}
                    </div>
                  </div>
                )}
                {(current.g !== undefined && current.g !== null) && (
                  <div className="bg-white rounded px-2 py-1 border border-green-200">
                    <div className="text-green-500 font-medium">g-score</div>
                    <div className="font-mono font-bold text-green-700">
                      {typeof current.g === 'number' ? current.g.toFixed(2) : current.g}
                    </div>
                  </div>
                )}
                {(current.dist !== undefined && current.dist !== null) && (
                  <div className="bg-white rounded px-2 py-1 border border-purple-200">
                    <div className="text-purple-500 font-medium">distance</div>
                    <div className="font-mono font-bold text-purple-700">
                      {typeof current.dist === 'number' ? current.dist.toFixed(2) : current.dist}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
