import { useEffect, useState } from "react";
import { SocketConnection } from "@/socket/socket";
import type { StepEvent } from "../components/StepAnimation";

type AlgoType = "astar" | "dijkstra" | "greedy";

type AlgorithmResults = {
    [key in AlgoType]?: {
        steps: StepEvent[];
        result: any;
        completed: boolean;
    };
};

export function useMultiAlgorithmSocket() {
    const [nodes, setNodes] = useState<string[]>([]);
    const [algoResults, setAlgoResults] = useState<AlgorithmResults>({});
    const [currentStep, setCurrentStep] = useState<StepEvent | null>(null);
    const [activeAlgos, setActiveAlgos] = useState<Set<AlgoType>>(new Set());

    // Function to reset results - will be called from parent component
    const resetResults = () => {
        setAlgoResults({});
        setCurrentStep(null);
    };

    useEffect(() => {
        const sock = SocketConnection.getInstance();

        const onStart = (payload: any) => {
            const algo = payload.algo as AlgoType;
            setActiveAlgos((prev) => new Set(prev).add(algo));
            setAlgoResults((prev) => ({
                ...prev,
                [algo]: {
                    steps: [],
                    result: null,
                    completed: false,
                },
            }));
        };

        const onStep = (ev: StepEvent) => {
            const algo = ev.algo as AlgoType;

            // Log để debug
            console.log('Step received:', {
                algo: ev.algo,
                action: ev.action,
                node: ev.node,
                f: ev.f,
                g: ev.g,
                dist: ev.dist,
            });

            setAlgoResults((prev) => ({
                ...prev,
                [algo]: {
                    ...prev[algo],
                    steps: [...(prev[algo]?.steps || []), ev],
                } as any,
            }));
            setCurrentStep(ev);
        };

        const onComplete = (payload: any) => {
            const algo = payload.algo as AlgoType;
            setAlgoResults((prev) => ({
                ...prev,
                [algo]: {
                    ...prev[algo],
                    result: payload.result || null,
                    completed: true,
                } as any,
            }));

            // Remove from active after short delay
            setTimeout(() => {
                setActiveAlgos((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(algo);
                    return newSet;
                });
            }, 1000);
        };

        const onNodeUpdated = (node: any) => {
            if (node?.hostname) {
                setNodes((prev) => {
                    const exists = prev.includes(node.hostname);
                    return exists ? prev : [...prev, node.hostname];
                });
            }
        };

        sock.on("heuristic:run-start", onStart);
        sock.on("heuristic:step", onStep);
        sock.on("heuristic:complete", onComplete);
        sock.on("node-updated", onNodeUpdated);

        return () => {
            sock.off("heuristic:run-start", onStart);
            sock.off("heuristic:step", onStep);
            sock.off("heuristic:complete", onComplete);
            sock.off("node-updated", onNodeUpdated);
        };
    }, []);

    return { nodes, algoResults, currentStep, activeAlgos, resetResults };
}
