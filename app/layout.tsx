import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import { GritStateProvider } from "@/components/GritStateProvider";
import FullMusicPlayer from "@/components/FullMusicPlayer";
import PrivateKeyLogin from "@/components/PrivateKeyLogin";
import DiscordComms from "@/components/DiscordComms";
import { DomainProvider } from "@/components/providers/DomainProvider";
import { ArtistProvider } from "@/components/providers/ArtistProvider";
import { SentientBridge } from "@/components/sentient/SentientBridge";
import { MobileRitualController } from "@/components/mobile/MobileRitualController";
import { CursorController } from "@/components/CursorController";
import { AuthGate } from "@/components/AuthGate";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <WalletContextProvider>
          <GritStateProvider>
            <DomainProvider>
              <ArtistProvider>
                <SentientBridge>
                  <CursorController />
                  <AuthGate>
                    {children}
                  </AuthGate>
                  <MobileRitualController />
                </SentientBridge>
              </ArtistProvider>
            </DomainProvider>
            <FullMusicPlayer />
            <PrivateKeyLogin />
            <DiscordComms />
          </GritStateProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
