import { useState } from "react";
import { Send, Calendar, Users, CheckCircle } from "lucide-react";

export function AirdropControl({ onAirdrop }: { onAirdrop: (recipient: string, amount: string, token: string) => void }) {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [token, setToken] = useState("CHI");

    const WEEKLY_TASKS = [
        { id: 1, task: "Distribute Weekly Staking Yield", status: "Pending", due: "Friday" },
        { id: 2, task: "Bounty Payout (Batch #42)", status: "Completed", due: "Monday" },
        { id: 3, task: "Artist Royalties (Ring 4)", status: "Pending", due: "Sunday" },
    ];

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Send className="text-purple-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Airdrop Control</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Token Distribution</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Manual Airdrop Form */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Manual Transfer</h4>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Recipient Address</label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none font-mono text-sm"
                            placeholder="Solana Wallet Address"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none font-mono text-sm"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Token</label>
                            <select
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none font-mono text-sm appearance-none"
                            >
                                <option value="CHI">CHI (Utility)</option>
                                <option value="MOXY">MOXY (Gov)</option>
                                <option value="GRIT">GRIT (Bond)</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={() => onAirdrop(recipient, amount, token)}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
                    >
                        <Send size={16} /> Execute Airdrop
                    </button>
                </div>

                {/* Weekly Tasks */}
                <div className="border-l border-white/10 pl-8 hidden lg:block">
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Calendar size={14} /> Weekly Obligations
                    </h4>
                    <div className="space-y-3">
                        {WEEKLY_TASKS.map(task => (
                            <div key={task.id} className="group flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    <span className={`text-sm ${task.status === 'Completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                        {task.task}
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase">{task.due}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-blue-400" />
                            <span className="text-xs font-bold text-blue-300 uppercase">Airdrop Estimate</span>
                        </div>
                        <p className="text-2xl font-bold text-white">45,000 CHI</p>
                        <p className="text-xs text-gray-400">Scheduled for distribution this week.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
