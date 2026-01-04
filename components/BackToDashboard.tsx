import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard() {
    return (
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 uppercase tracking-widest text-xs font-bold transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Command Center</span>
        </Link>
    );
}
