
import {
    BaseMessageSignerWalletAdapter,
    WalletAdapterNetwork,
    WalletName,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { Keypair, Transaction, TransactionVersion, VersionedTransaction, PublicKey, SendOptions } from '@solana/web3.js';
import bs58 from 'bs58';

export interface PrivateKeyWalletAdapterConfig {
    keypair: Keypair;
}

export const PrivateKeyWalletName = 'Private Key' as WalletName<'Private Key'>;

export class PrivateKeyWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = PrivateKeyWalletName;
    url = 'https://solana.com';
    icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDJMMTMgMmw0IDUgLTUgNSAtNS01IDQgLTV6Ii8+PHBhdGggZD0iTTMgMjJ2LTZIMXY2aDJ6Ii8+PHBhdGggZD0iTTMgMjJoMTQiLz48L3N2Zz4='; // Simple key icon
    supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

    private _keypair: Keypair;
    private _connecting: boolean;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState = WalletReadyState.Installed;

    constructor(config: PrivateKeyWalletAdapterConfig) {
        super();
        this._keypair = config.keypair;
        this._connecting = false;
        this._publicKey = this._keypair.publicKey;
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            this._connecting = true;
            this.emit('connect', this._publicKey!);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        this._publicKey = null;
        this.emit('disconnect');
    }

    async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
        if (isVersionedTransaction(transaction)) {
            transaction.sign([this._keypair]);
        } else {
            transaction.partialSign(this._keypair);
        }
        return transaction;
    }

    async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
        for (const transaction of transactions) {
            if (isVersionedTransaction(transaction)) {
                transaction.sign([this._keypair]);
            } else {
                transaction.partialSign(this._keypair);
            }
        }
        return transactions;
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        const signature = require("tweetnacl").sign.detached(message, this._keypair.secretKey);
        return signature;
    }
}

function isVersionedTransaction(transaction: Transaction | VersionedTransaction): transaction is VersionedTransaction {
    return 'version' in transaction;
}
