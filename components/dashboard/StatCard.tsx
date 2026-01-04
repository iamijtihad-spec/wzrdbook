import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    icon: LucideIcon;
    color: string;
}

export default function StatCard({ title, value, subValue, icon: Icon, color }: StatCardProps) {
    return (
        <div className="glass-panel p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={48} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={color} />
                    <span className="text-xs uppercase tracking-wider font-bold text-gray-400">{title}</span>
                </div>
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                    {value}
                </div>
                {subValue && (
                    <div className="text-xs text-gray-500 mt-1 font-medium">
                        {subValue}
                    </div>
                )}
            </div>
        </div>
    );
}
