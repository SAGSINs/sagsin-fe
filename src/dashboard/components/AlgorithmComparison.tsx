import { Card } from "@/components/ui/card";

type AlgoType = "astar" | "dijkstra" | "greedy";

type ComparisonProps = {
  algoResults: {
    [key in AlgoType]?: {
      result: any;
      completed: boolean;
      steps: any[];
    };
  };
  selectedAlgos?: Set<AlgoType>; // Optional: filter to show only selected algorithms
};

const algoColors = {
  astar: "border-blue-500 bg-blue-50/50",
  dijkstra: "border-green-500 bg-green-50/50",
  greedy: "border-orange-500 bg-orange-50/50",
};

const algoNames = {
  astar: "A*",
  dijkstra: "Dijkstra",
  greedy: "Greedy",
};

export default function AlgorithmComparison({ algoResults, selectedAlgos }: ComparisonProps) {
  // Filter to show only selected algorithms if provided
  const completedAlgos = Object.entries(algoResults).filter(
    ([algo, data]) => {
      const isCompleted = data?.completed && data?.result;
      const isSelected = !selectedAlgos || selectedAlgos.has(algo as AlgoType);
      return isCompleted && isSelected;
    }
  );

  if (completedAlgos.length === 0) {
    return null;
  }

  // Find best algorithm by total weight
  const bestAlgo = completedAlgos.reduce((best, [algo, data]) => {
    if (!best || (data?.result?.total_weight < best.data?.result?.total_weight)) {
      return { algo, data };
    }
    return best;
  }, null as any);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Algorithm Comparison</h2>
        <span className="text-sm text-muted-foreground">
          {completedAlgos.length} algorithm{completedAlgos.length > 1 ? "s" : ""} completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {completedAlgos.map(([algo, data]) => {
          const isBest = algo === bestAlgo?.algo;
          const result = data?.result;

          return (
            <Card
              key={algo}
              className={`p-4 border-2 ${algoColors[algo as AlgoType]} ${
                isBest ? "ring-2 ring-yellow-400 shadow-lg" : ""
              } transition-all`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {algoNames[algo as AlgoType]}
                    {isBest && (
                      <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                        ⭐ Best
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {data?.steps?.length || 0} steps
                  </span>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Weight:</span>
                    <span className="font-mono font-semibold">
                      {result?.total_weight?.toFixed(2) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Path Length:</span>
                    <span className="font-mono">{result?.hop_count || 0} hops</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Delay:</span>
                    <span className="font-mono">
                      {result?.total_delay_ms?.toFixed(2) || "N/A"} ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stability:</span>
                    <span className="font-mono">
                      {((result?.stability_score || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Path Preview */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Path:</p>
                  <div className="text-xs font-mono bg-background/80 p-2 rounded max-h-32 overflow-y-auto">
                    {result?.path && result.path.length > 0 ? (
                      <div className="space-y-1">
                        {result.path.map((node: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded ${
                              idx === 0 ? 'bg-green-100 text-green-800 font-semibold' :
                              idx === result.path.length - 1 ? 'bg-red-100 text-red-800 font-semibold' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {node}
                            </span>
                            {idx < result.path.length - 1 && (
                              <span className="text-muted-foreground">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No path found</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Table */}
      {completedAlgos.length > 1 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Performance Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Algorithm</th>
                  <th className="text-right py-2 px-3">Weight</th>
                  <th className="text-right py-2 px-3">Delay (ms)</th>
                  <th className="text-right py-2 px-3">Hops</th>
                  <th className="text-right py-2 px-3">Stability</th>
                  <th className="text-right py-2 px-3">Steps</th>
                </tr>
              </thead>
              <tbody>
                {completedAlgos.map(([algo, data]) => {
                  const result = data?.result;
                  const isBest = algo === bestAlgo?.algo;
                  return (
                    <tr
                      key={algo}
                      className={`border-b hover:bg-accent/50 ${
                        isBest ? "bg-yellow-50/50 font-semibold" : ""
                      }`}
                    >
                      <td className="py-2 px-3">
                        {algoNames[algo as AlgoType]}
                        {isBest && " ⭐"}
                      </td>
                      <td className="text-right py-2 px-3 font-mono">
                        {result?.total_weight?.toFixed(2)}
                      </td>
                      <td className="text-right py-2 px-3 font-mono">
                        {result?.total_delay_ms?.toFixed(2)}
                      </td>
                      <td className="text-right py-2 px-3 font-mono">
                        {result?.hop_count}
                      </td>
                      <td className="text-right py-2 px-3 font-mono">
                        {((result?.stability_score || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="text-right py-2 px-3 text-muted-foreground">
                        {data?.steps?.length || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
