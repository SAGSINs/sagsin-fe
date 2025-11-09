import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useLinks } from "@/contexts/network-context";
import LinkDetail from "@/components/links/link-detail";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function LinkManagement() {
    const { links, loading, error, searchLinks, refreshLinks } = useLinks();
    const [searchParams] = useSearchParams();
    const [srcQuery, setSrcQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");

    // Lấy search queries từ URL params
    useEffect(() => {
        const src = searchParams.get('src');
        const dest = searchParams.get('dest');
        if (src) setSrcQuery(src);
        if (dest) setDestQuery(dest);
    }, [searchParams]);

    const filtered = useMemo(() => {
        return searchLinks(srcQuery, destQuery);
    }, [srcQuery, destQuery, searchLinks]);

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="bg-muted/50 rounded-xl p-6 min-h-[70vh] w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Links Management</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshLinks}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <input
                        type="text"
                        value={srcQuery}
                        onChange={(e) => setSrcQuery(e.target.value)}
                        placeholder="Search source (hostname or IP)"
                        className="w-full md:w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring"
                    />
                    <input
                        type="text"
                        value={destQuery}
                        onChange={(e) => setDestQuery(e.target.value)}
                        placeholder="Search destination (hostname or IP)"
                        className="w-full md:w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring"
                    />
                </div>

                {error && (
                    <div className="text-destructive mb-4 p-3 bg-destructive/10 rounded-md">
                        Error: {error}
                    </div>
                )}

                {loading && links.length === 0 ? (
                    <div className="text-muted-foreground">Loading links...</div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1">
                        {filtered.map((l) => (
                            <LinkDetail 
                                key={l._id || `${l.srcNode}-${l.destNode}`} 
                                link={{
                                    _id: l._id,
                                    srcNode: l.srcNode,
                                    srcNodeName: l.srcNode,
                                    destNode: l.destNode,
                                    destNodeName: l.destNode,
                                    available: l.available,
                                    metrics: {
                                        bandwidthMbps: l.metrics?.bandwidthMbps,
                                        delayMs: l.metrics?.delayMs,
                                        jitterMs: l.metrics?.jitterMs,
                                        lossRate: l.metrics?.packetLoss,
                                        queueLength: l.metrics?.queueLength,
                                    },
                                    createdAt: l.createdAt,
                                    updatedAt: l.updatedAt,
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-muted-foreground">No links found.</div>
                )}
            </div>
        </div>
    );
}