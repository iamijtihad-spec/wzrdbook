import { Gift, Star, Trophy, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export function RewardsLedger() {
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ledger/rewards');
            const data = await res.json();
            setRewards(data.rewards || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                        <Gift className="text-amber-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Rewards Live</h3>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Listen-to-Earn Stream</p>
                    </div>
                </div>
                <button onClick={fetchRewards} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCw size={16} className={`text-white ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {rewards.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No rewards distributed yet.</div>
                ) : (
                    rewards.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Trophy size={12} className="text-amber-500" />
                                    <span className="font-mono text-gray-400 text-xs">{item.trackTitle || "Action"}</span>
                                </div>
                                <p className="text-white text-sm font-bold mt-1 truncate max-w-[120px]">{item.wallet?.slice(0, 6)}...</p>
                                <p className="text-[10px] text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-amber-400">+{item.earned}</span>
                                <span className="text-[10px] text-amber-500/80 ml-1">{item.ringId === 'ring-1' ? "CHI" : "CHI"}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Live Distribution</span>
                <span className="text-amber-400 font-mono font-bold">
                    {rewards.reduce((acc, r) => acc + (parseFloat(r.earned) || 0), 0).toFixed(4)} CHI
                </span>
            </div>
        </div>
    );
}
