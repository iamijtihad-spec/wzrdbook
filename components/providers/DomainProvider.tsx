"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export type Domain = 'sovereign' | 'ascesis' | 'heritage' | 'market' | 'glitch';

const DomainContext = createContext({
    domain: 'sovereign' as Domain,
    setDomain: (d: Domain) => { },
});

export const DomainProvider = ({ children }: { children: React.ReactNode }) => {
    const [domain, setDomain] = useState<Domain>('sovereign');
    const pathname = usePathname();

    // Sync domain with URL - this ensures refreshing on a /domain/ page loads the correct aesthetic
    useEffect(() => {
        if (pathname?.includes('/domain/ascesis')) setDomain('ascesis');
        else if (pathname?.includes('/domain/heritage')) setDomain('heritage');
        else if (pathname?.includes('/domain/market')) setDomain('market');
        // Sovereign is default, so logic can be implicit or explicit. 
        // Keeping state manual for now ensures smooth transitions.
    }, [pathname]);

    useEffect(() => {
        // This is the core "Firewall" move. 
        // It updates the CSS variables across the whole app instantly.
        document.body.setAttribute('data-domain', domain);
    }, [domain]);

    return (
        <DomainContext.Provider value={{ domain, setDomain }}>
            <div className="min-h-screen transition-colors duration-1000">
                {children}
            </div>
        </DomainContext.Provider>
    );
};

export const useDomain = () => useContext(DomainContext);
