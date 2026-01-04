import { Activity, CreditCard, DollarSign } from "lucide-react";
import payrollConfig from "@/config/payroll.json";

export function PayrollLedger() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                    <CreditCard className="text-green-400" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Payroll Ledger</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Active Contracts</p>
                </div>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {payrollConfig.payroll.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-green-400 text-sm">{item.id}</span>
                                <span className="px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider bg-green-500/20 text-green-400">
                                    {item.status}
                                </span>
                            </div>
                            <p className="text-white font-bold mt-1">{item.recipient}</p>
                            <p className="text-xs text-gray-500">{item.role} • {item.frequency}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold text-white">{parseInt(item.amount).toLocaleString()}</span>
                            <span className="text-xs text-gray-400 ml-1">{item.token}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Obligation</span>
                <span className="text-green-400 font-mono font-bold">~65,000 / mo</span>
            </div>
        </div>
    );
}
