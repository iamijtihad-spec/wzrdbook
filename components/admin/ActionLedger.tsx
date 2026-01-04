import { Activity, Terminal, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface LedgerEntry {
    type: string;
    description: string;
    timestamp: number;
    actor: string;
}

export function ActionLedger() {
    const [logs, setLogs] = useState<LedgerEntry[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("/api/admin/ledger");
                const data = await res.json();
                if (data.success) {
                    setLogs(data.entries);
                }
            } catch (e) {
                // Silently fail on network error (polling will retry)
                // console.warn("Ledger poll failed", e);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Activity className="text-blue-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Action Ledger</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Live System Events</p>
                </div>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {(!Array.isArray(logs) || logs.length === 0) ? (
                    <div className="text-center text-gray-500 py-8">
                        {Array.isArray(logs) ? "System Idle. Logs Empty." : "Initializing System Ledger..."}
                    </div>
                ) : (
                    logs.map((item, i) => (
                        <div key={i} className="relative p-4 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-colors overflow-hidden group">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'transfer' ? 'bg-blue-500' : 'bg-green-500'}`} />

                            <div className="flex justify-between items-start pl-3">
                                <div>
                                    <h4 className="text-white text-sm font-bold uppercase">{item.type}</h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        <span className="text-blue-400 font-mono">
                                            {item.description}
                                        </span>
                                    </p>
                                    <p className="text-[10px] text-gray-600 mt-1 truncate max-w-[200px]">Actor: {item.actor}</p>
                                </div>
                                <span className="text-[10px] text-gray-600 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                <span className="text-gray-400">System Status</span>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 font-bold uppercase text-xs">Operational</span>
                </div>
            </div>
        </div>
    );
}
