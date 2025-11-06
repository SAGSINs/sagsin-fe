type AlgoType = "astar" | "dijkstra" | "greedy";

type AlgorithmSelectorProps = {
  selectedAlgos: Set<AlgoType>;
  toggleAlgo: (algo: AlgoType) => void;
  src: string;
  setSrc: (src: string) => void;
  dst: string;
  setDst: (dst: string) => void;
  nodes: string[];
  onRun: () => void;
};

const algorithms = [
  { value: "astar" as const, label: "A* (A-Star)", color: "bg-blue-500" },
  { value: "dijkstra" as const, label: "Dijkstra", color: "bg-green-500" },
  { value: "greedy" as const, label: "Greedy Best-First", color: "bg-orange-500" },
];

export default function AlgorithmSelector({
  selectedAlgos,
  toggleAlgo,
  src,
  setSrc,
  dst,
  setDst,
  nodes,
  onRun,
}: AlgorithmSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="col-span-1 space-y-2">
          <label className="text-sm font-medium">
            Algorithms (Select 1-3)
          </label>
          <div className="border rounded-md p-3 space-y-2 bg-background">
            {algorithms.map(({ value, label, color }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAlgos.has(value)}
                  onChange={() => toggleAlgo(value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <div className={`w-3 h-3 rounded ${color}`} />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="col-span-1 space-y-2">
          <label className="text-sm font-medium">Source Node</label>
          <select
            className="border rounded-md p-2 w-full bg-background hover:bg-accent transition-colors"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
          >
            {nodes.length > 0 ? (
              nodes.map((node) => (
                <option key={node} value={node}>
                  {node}
                </option>
              ))
            ) : (
              <option value={src}>{src}</option>
            )}
          </select>
        </div>
        <div className="col-span-1 space-y-2">
          <label className="text-sm font-medium">Destination Node</label>
          <select
            className="border rounded-md p-2 w-full bg-background hover:bg-accent transition-colors"
            value={dst}
            onChange={(e) => setDst(e.target.value)}
          >
            {nodes.length > 0 ? (
              nodes.map((node) => (
                <option key={node} value={node}>
                  {node}
                </option>
              ))
            ) : (
              <option value={dst}>{dst}</option>
            )}
          </select>
        </div>
      </div>

      <button
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium shadow-sm flex items-center gap-2"
        onClick={onRun}
        disabled={selectedAlgos.size === 0}
      >
        ▶ Run {selectedAlgos.size > 1 ? `${selectedAlgos.size} Algorithms` : Array.from(selectedAlgos)[0]?.toUpperCase() || ""}
        {selectedAlgos.size > 1 && (
          <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded">
            Compare Mode
          </span>
        )}
      </button>
    </div>
  );
}
