import { useMemo, useState } from "react";
import { SocketConnection } from "@/socket/socket";
import AlgorithmSelector from "./components/AlgorithmSelector";
import TimelineChart from "./components/TimelineChart";
import StepAnimation from "./components/StepAnimation";
import AlgorithmComparison from "./components/AlgorithmComparison";
import { useMultiAlgorithmSocket } from "./hooks/useMultiAlgorithmSocket";

type AlgoType = "astar" | "dijkstra" | "greedy";

export default function AlgorithmsManagement() {
  // Multi-algorithm selection
  const [selectedAlgos, setSelectedAlgos] = useState<Set<AlgoType>>(new Set(["astar"]));
  const [src, setSrc] = useState<string>("ground_station_hanoi");
  const [dst, setDst] = useState<string>("ship_tokyo");
  
  const { nodes, algoResults, currentStep, activeAlgos, resetResults } = useMultiAlgorithmSocket();

  // Get all steps from currently selected algorithms only
  const allSteps = useMemo(() => {
    const steps: any[] = [];
    Object.entries(algoResults).forEach(([algo, data]) => {
      // Only include steps from selected algorithms
      if (selectedAlgos.has(algo as AlgoType) && data?.steps) {
        steps.push(...data.steps);
      }
    });
    return steps.sort((a, b) => (a.step || 0) - (b.step || 0));
  }, [algoResults, selectedAlgos]);

  const timeline = useMemo(() => {
    return allSteps.map((s, i) => ({
      i,
      metric:
        s.f ?? s.g ?? s.dist ?? (s.action === "complete" ? allSteps.length : i),
      label: `[${s.algo?.toUpperCase()}] ${s.action} ${s.node ?? s.from ?? ""}${s.to ? `→${s.to}` : ""}`,
    }));
  }, [allSteps]);

  const toggleAlgo = (algo: AlgoType) => {
    setSelectedAlgos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(algo)) {
        if (newSet.size > 1) { // Keep at least one selected
          newSet.delete(algo);
        }
      } else {
        newSet.add(algo);
      }
      return newSet;
    });
  };

  const handleRun = () => {
    // Reset all previous results before running new algorithms
    resetResults();
    
    const sock = SocketConnection.getInstance();
    // Run all selected algorithms
    selectedAlgos.forEach(algo => {
      sock.emit("heuristic:request-run", { algo, src, dst });
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Algorithms Management</h1>
      <p className="text-sm text-muted-foreground">
        Stream live heuristic steps and visualize the search process.
      </p>

      <AlgorithmSelector
        selectedAlgos={selectedAlgos}
        toggleAlgo={toggleAlgo}
        src={src}
        setSrc={setSrc}
        dst={dst}
        setDst={setDst}
        nodes={nodes}
        onRun={handleRun}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimelineChart data={timeline} />
        <StepAnimation current={currentStep} />
      </div>

      {/* Algorithm Comparison - shows when multiple algorithms complete */}
      <AlgorithmComparison algoResults={algoResults} selectedAlgos={selectedAlgos} />

      {/* Show running status */}
      {activeAlgos.size > 0 && (
        <div className="border border-primary/50 bg-primary/5 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-sm font-medium">
              Running {activeAlgos.size} algorithm{activeAlgos.size > 1 ? "s" : ""}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}