import { useState } from "react";
import { Server, ShieldCheck, Database, Rocket, AlertTriangle, Check, Loader2 } from "lucide-react";

export function DeploymentProtocol() {
    const [step, setStep] = useState(0);
    const [deploying, setDeploying] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const STEPS = [
        { id: 1, label: "Audit Smart Contracts", icon: ShieldCheck, status: "Ready" },
        { id: 2, label: "Snapshot Database", icon: Database, status: "Pending" },
        { id: 3, label: "Verify Treasury Funds", icon: Server, status: "Pending" },
        { id: 4, label: "Initiate Mainnet Sequence", icon: Rocket, status: "Locked" },
    ];

    const runDeployment = async () => {
        setDeploying(true);
        setLogs(prev => [...prev, "Initializing Deployment Sequence..."]);

        // Simulation Sequence
        for (let i = 0; i < STEPS.length; i++) {
            await new Promise(r => setTimeout(r, 1500));
            setStep(i + 1);
            setLogs(prev => [...prev, `[SUCCESS] ${STEPS[i].label} Verified.`]);
        }

        await new Promise(r => setTimeout(r, 1000));
        setLogs(prev => [...prev, "⚠️ MAINNET LAUNCH ABORTED: SIMULATION MODE ACTIVE"]);
        setDeploying(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full relative overflow-hidden">
            {/* Background Pulse */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-1000 ${deploying ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />

            <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-3 bg-red-500/20 rounded-xl">
                    <Rocket className="text-red-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Deployment Protocol</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Mainnet Launch Control</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                {/* Steps */}
                <div className="space-y-4">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${step > i ? 'bg-green-500/10 border-green-500/30' :
                                step === i && deploying ? 'bg-amber-500/10 border-amber-500/30 animate-pulse' :
                                    'bg-black/30 border-white/5 opacity-50'
                            }`}>
                            <div className={`p-2 rounded-lg ${step > i ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                <s.icon size={18} />
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${step > i ? 'text-green-400' : 'text-gray-400'}`}>{s.label}</h4>
                            </div>
                            {step > i && <Check size={16} className="text-green-500" />}
                            {step === i && deploying && <Loader2 size={16} className="text-amber-500 animate-spin" />}
                        </div>
                    ))}
                </div>

                {/* Terminal Log */}
                <div className="bg-black/80 rounded-xl p-4 font-mono text-xs h-32 overflow-y-auto border border-white/10 custom-scrollbar">
                    {logs.length === 0 && <span className="text-gray-600 animate-pulse">_ Awaiting Command...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className={`mb-1 ${log.includes("check") ? 'text-green-400' : log.includes("WARN") || log.includes("ABORTED") ? 'text-red-400' : 'text-blue-400'}`}>
                            {`> ${log}`}
                        </div>
                    ))}
                </div>

                {/* Big Red Button */}
                <button
                    onClick={runDeployment}
                    disabled={deploying}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${deploying ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                            'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-red-900/50 hover:scale-[1.02]'
                        }`}
                >
                    {deploying ? (
                        <>Processing Sequence...</>
                    ) : (
                        <>
                            <AlertTriangle size={20} /> Initiate Mainnet Sequence
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
