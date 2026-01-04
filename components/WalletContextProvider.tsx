"use client";

import { FC, ReactNode, useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { RPC_URL } from "@/constants/tokens";
import {
    WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";


// Default styles that can be overridden by your app
// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";

import { PrivateKeyWalletAdapter } from "@/lib/PrivateKeyWalletAdapter";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    // const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    // Use centralized RPC configuration
    const endpoint = useMemo(() => RPC_URL, []);
    // const endpoint = useMemo(() => "http://127.0.0.1:8899", []);

    const wallets = useMemo(() => {
        const adapters: any[] = [
            new PhantomWalletAdapter(),
            new WalletConnectWalletAdapter({
                network: WalletAdapterNetwork.Devnet,
                options: {
                    projectId: "39265f2425979567958177579040188b", // Public placeholder ID
                    metadata: {
                        name: "GRIT Dashboard",
                        description: "GRITCOIN Dashboard & Player",
                        url: "https://gritcoin.xyz",
                        icons: ["https://avatars.githubusercontent.com/u/37784886"],
                    },
                },
            }),
        ];

        // Check for session private key
        if (typeof window !== "undefined") {
            const sessionKey = sessionStorage.getItem("GRIT_SESSION_KEY");
            if (sessionKey) {
                try {
                    const secretKey = bs58.decode(sessionKey);
                    const keypair = Keypair.fromSecretKey(secretKey);
                    adapters.push(new PrivateKeyWalletAdapter({ keypair }));
                } catch (e) {
                    console.error("Invalid session key", e);
                }
            }
        }

        return adapters;
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
