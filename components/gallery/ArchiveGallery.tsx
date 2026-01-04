"use client";

import { motion } from 'framer-motion';
import { EchoArtifact } from '../rewards/EchoArtifact';
import { Manifesto } from '../onboarding/Manifesto';
import { useGritState } from '@/components/GritStateProvider'; // Assuming access to history
import { useState } from 'react';

export const ArchiveGallery = () => {
    const { recentActivity } = useGritState();

    // Map Activity to Echo Artifacts
    const rituals = recentActivity.map((activity, index) => {
        let attributes: any = { domain: 'SOVEREIGN', resonance: 0.5, rarity: 'common' };
        let title = 'Echo';
        let domainType = 'SOVEREIGN';

        if (activity.type === 'burn') {
            domainType = 'ASCESIS';
            title = 'Sacrifice';
            attributes = {
                domain: 'ASCESIS',
                resonance: Math.min(1, (activity.data.amount || 0) / 1000),
                fracture_intensity: Math.min(1, (activity.data.amount || 0) / 500),
                rarity: (activity.data.amount || 0) > 1000 ? 'artifact' : 'common'
            };
        } else if (activity.type === 'claim' || activity.type === 'withdraw') {
            domainType = 'HERITAGE';
            title = 'Legacy';
            attributes = {
                domain: 'HERITAGE',
                resonance: 0.8,
                luster: Math.min(1, (activity.data.multiplier || 1) - 1),
                rarity: 'rare'
            };
        } else if (activity.type === 'play') {
            domainType = 'SOVEREIGN';
            title = activity.data.trackTitle || 'Resonance';
            attributes = {
                domain: 'SOVEREIGN',
                resonance: 0.6,
                rarity: 'common'
            };
        } else if (activity.type === 'vote') {
            domainType = 'GLITCH';
            title = 'Voice';
            attributes = {
                domain: 'GLITCH',
                resonance: 0.9,
                rarity: 'uncommon'
            };
        }

        return {
            id: activity.id,
            title,
            domainType,
            date: new Date(activity.timestamp).toLocaleDateString(),
            attributes
        };
    });

    return (
        <div className="relative h-screen w-full flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-black/95">

            {/* 1. The Manifesto (First Artifact) */}
            <div className="flex-none w-[90vw] md:w-[60vw] h-[80vh] mx-10 md:mx-40 snap-center flex items-center justify-center">
                <Manifesto />
            </div>

            {/* 2. Echo Artifacts (The Ribbon) */}
            {rituals.map((ritual, index) => (
                <motion.div
                    key={ritual.id}
                    className="relative flex-none w-[80vw] md:w-[40vw] h-[60vh] mx-4 snap-center group perspective-1000"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Artifact Container */}
                    <div className="relative h-full w-full overflow-hidden border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl transition-transform duration-700 group-hover:rotate-y-12">
                        {/* @ts-ignore */}
                        <EchoArtifact attributes={ritual.attributes} />

                        {/* Contextual Artist Tag */}
                        <div className="absolute top-8 left-8 mix-blend-difference font-mono text-[10px] tracking-widest text-white/40 z-20">
                            ARTIST_ORIGIN: WZRD // {ritual.date}
                        </div>

                        {/* Overlay Detail (Hover) */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-8 text-center bg-blend-multiply transition-opacity duration-300">
                            <h3 className="font-serif italic text-3xl text-white mb-2">{ritual.title}</h3>
                            <p className="text-[10px] font-mono text-[var(--domain-accent)] uppercase tracking-widest mb-8">{ritual.domainType}</p>

                            <div className="grid grid-cols-2 gap-8 text-[10px] uppercase tracking-widest text-[#555]">
                                <div>
                                    <span className="block text-[#333]">Resonance</span>
                                    <span className="text-white">{ritual.attributes.resonance * 100}%</span>
                                </div>
                                <div>
                                    <span className="block text-[#333]">Rarity</span>
                                    <span className="text-white">{ritual.attributes.rarity}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Spacer for scroll end */}
            <div className="flex-none w-[20vw]" />
        </div>
    );
};
