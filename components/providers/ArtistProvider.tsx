"use client";

import { useEffect, ReactNode } from 'react';
import artistConfig from '@/config/artist.config.json';
import { usePathname } from 'next/navigation';

export const ArtistProvider = ({ children }: { children: ReactNode }) => {
    const { aesthetic_dna } = artistConfig;
    const pathname = usePathname();

    useEffect(() => {
        // Inject the artist's specific colors into the CSS variables
        const root = document.documentElement;

        // Palette
        root.style.setProperty('--domain-sovereign', aesthetic_dna.palette.sovereign);
        root.style.setProperty('--domain-ascesis', aesthetic_dna.palette.ascesis);
        root.style.setProperty('--domain-heritage', aesthetic_dna.palette.heritage);
        root.style.setProperty('--domain-glitch', aesthetic_dna.palette.glitch);

        // Textures
        root.style.setProperty('--grain-opacity', String(aesthetic_dna.textures.grain_intensity));

        // Typography (Optional - usually handled by Font loading in layout, but variables can be set)

    }, []);

    // Future: Dynamic Domain Switching logic can go here (changing active accent color based on route)
    useEffect(() => {
        const root = document.documentElement;
        const path = pathname || ''; // Handle potential null
        if (path.includes('ascesis')) {
            root.style.setProperty('--domain-accent', aesthetic_dna.palette.ascesis);
        } else if (path.includes('heritage')) {
            root.style.setProperty('--domain-accent', aesthetic_dna.palette.heritage);
        } else if (path.includes('sovereign')) {
            root.style.setProperty('--domain-accent', aesthetic_dna.palette.sovereign);
        } else {
            // Default or Glitch
            root.style.setProperty('--domain-accent', aesthetic_dna.palette.sovereign);
        }
    }, [pathname, aesthetic_dna]);

    return <>{children}</>;
};
