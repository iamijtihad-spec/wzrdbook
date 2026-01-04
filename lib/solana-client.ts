import { Program, AnchorProvider, Idl, setProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import gritBondingIdl from "./idl/grit_bonding.json";
import gritStakingIdl from "./idl/grit_staking.json";
import gritGovIdl from "./idl/grit_gov.json";

const BONDING_PROGRAM_ID = new PublicKey("8N8qeFRcxnwJKn2mWvhMahP2S3ChfPwynRtVKAvPepY1");
const STAKING_PROGRAM_ID = new PublicKey("G9Xq99jdwuvQD1nGGhW1C3TYuc6iRz78faoscQqmX2D7");
const GOV_PROGRAM_ID = new PublicKey("AotidXSUcQsaQHbkwwrrnCX9MiMYhu9JimPA2LJ2VSxj");

export const PROGRAMS = {
    BONDING: BONDING_PROGRAM_ID,
    STAKING: STAKING_PROGRAM_ID,
    GOV: GOV_PROGRAM_ID,
};

const normalizeIdl = (idl: any): Idl => {
    // Handle default export
    if (idl?.default) {
        idl = idl.default;
    }
    // Deep clone to remove module-specific properties/prototypes that might confuse Anchor
    return JSON.parse(JSON.stringify(idl));
};

export const getBondingProgram = (provider: AnchorProvider) => {
    return new Program(normalizeIdl(gritBondingIdl), BONDING_PROGRAM_ID, provider);
};

export const getStakingProgram = (provider: AnchorProvider) => {
    return new Program(normalizeIdl(gritStakingIdl), STAKING_PROGRAM_ID, provider);
};

export const getGovProgram = (provider: AnchorProvider) => {
    return new Program(normalizeIdl(gritGovIdl), GOV_PROGRAM_ID, provider);
};

// Treasury
import gritTreasuryIdl from "./idl/grit_treasury.json";
const TREASURY_PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

export const getTreasuryProgram = (provider: AnchorProvider) => {
    return new Program(normalizeIdl(gritTreasuryIdl), TREASURY_PROGRAM_ID, provider);
};
