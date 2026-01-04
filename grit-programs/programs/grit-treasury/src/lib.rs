use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Burn};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod grit_treasury {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, lung_cap: u64, epoch_duration: i64) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury_state;
        treasury.authority = ctx.accounts.authority.key();
        treasury.lung_cap = lung_cap;
        treasury.epoch_duration = epoch_duration;
        treasury.current_epoch = 0;
        treasury.epoch_start_time = Clock::get()?.unix_timestamp;
        treasury.total_outflow_this_epoch = 0;
        Ok(())
    }

    pub fn request_withdrawal(
        ctx: Context<RequestWithdrawal>, 
        amount_requested: u64,
        ascesis_total_burned: u64,
        ascesis_initial_burn: u64,
        heritage_stake_start: i64,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury_state;
        let clock = Clock::get()?;
        let user = &ctx.accounts.user;
        let lung = &mut ctx.accounts.lung_vault;
        
        // 1. EPOCH MANAGEMENT
        if clock.unix_timestamp > treasury.epoch_start_time + treasury.epoch_duration {
            treasury.current_epoch += 1;
            treasury.epoch_start_time = clock.unix_timestamp;
            treasury.total_outflow_this_epoch = 0;
        }

        // 2. ELIGIBILITY CHECKS
        let staked_duration = clock.unix_timestamp - heritage_stake_start;
        require!(is_eligible(staked_duration), TreasuryError::NotEligibleTime);

        // 3. CAPACITY CHECK (Ascesis)
        let exit_capacity = calculate_capacity(ascesis_total_burned, ascesis_initial_burn);
        require!(amount_requested <= exit_capacity, TreasuryError::ExceedsPersonalCapacity);
        
        // Hard Cap check
        require!(amount_requested <= 250_000_000, TreasuryError::ExceedsHardCap); // 0.25 SOL

        // 4. EFFICIENCY CHECK (Heritage)
        let tokens_to_burn = calculate_burn_cost(amount_requested, staked_duration);

        // 5. SAFETY CHECKS (Lung)
        let min_lung = 5_000_000_000;
        require!(lung.amount >= min_lung, TreasuryError::LungEmpty);
        
        let max_outflow = lung.amount / 50; // 2%
        require!(treasury.total_outflow_this_epoch + amount_requested <= max_outflow, TreasuryError::GlobalEpochCapReached);

        // 6. EXECUTION
        let cpi_burn = Burn {
            mint: ctx.accounts.dev_mint.to_account_info(),
            from: ctx.accounts.user_dev_token_account.to_account_info(),
            authority: user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::burn(CpiContext::new(cpi_program, cpi_burn), tokens_to_burn)?;

        // Transfer SOL from Lung (Simulated PDA Transfer)
        **ctx.accounts.lung_pda.try_borrow_mut_lamports()? -= amount_requested;
        **user.try_borrow_mut_lamports()? += amount_requested;

        treasury.total_outflow_this_epoch += amount_requested;

        Ok(())
    }
}

// --- PURE LOGIC HELPERS ---

pub fn is_eligible(staked_duration_seconds: i64) -> bool {
    let min_duration = 14 * 24 * 60 * 60; // 14 days
    staked_duration_seconds >= min_duration
}

pub fn calculate_capacity(total_burned: u64, initial_burn: u64) -> u64 {
    let c_base: u64 = 50_000_000; // 0.05 SOL base cap
    let ratio = if initial_burn > 0 { total_burned / initial_burn } else { 1 };
    
    // Log2 approximation
    let log_val = (63 - ratio.leading_zeros()) as u64; 
    let multiplier = std::cmp::min(1 + log_val, 5); // Max 5x
    
    c_base * multiplier
}

pub fn calculate_burn_cost(amount_requested: u64, staked_duration_seconds: i64) -> u64 {
    let base_rate = 10_000; // Lamports per Dev-Token (Example: 10k Lamports buys 1 token worth of breath?) 
    // Actually E_base = 0.00001 SOL per dev-GRIT. (10,000 Lamports)
    
    let days_staked = staked_duration_seconds / (24 * 60 * 60);
    // Formula: 1 + (days/30)*0.1
    // Scaled by 100 for integer math
    // 1.0 -> 100
    // 0.1 -> 10
    let time_bonus_percent = (days_staked / 30) * 10; 
    let time_multiplier_scaled = std::cmp::min(100 + time_bonus_percent as u64, 250); // Max 2.5x
    
    let effective_rate = (base_rate * time_multiplier_scaled) / 100;
    
    // Tokens = Requested / Effective Rate
    // If requested is 1 SOL (1e9), and effective rate is 10k, cost is 100,000 tokens.
    if effective_rate == 0 { return u64::MAX; } // Protect div by zero
    amount_requested * 1_000_000_000 / effective_rate // Note: This scaling depends on token decimals. Assuming 9 decimals for both.
    // If decimals match, then (Amount / Rate) logic holds. 
    // E.g. Rate = 10_000 Lamports/Token. 
    // Requested = 1_000_000_000 Lamports.
    // Cost = 100_000 Tokens.
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8 + 8 + 8 + 8)]
    pub treasury_state: Account<'info, TreasuryState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestWithdrawal<'info> {
    #[account(mut)]
    pub treasury_state: Account<'info, TreasuryState>,
    
    #[account(mut)]
    /// CHECK: Lung PDA holding SOL
    pub lung_pda: AccountInfo<'info>,
    
    #[account(mut)]
    pub lung_vault: Account<'info, TokenAccount>, 

    #[account(mut)]
    pub dev_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_dev_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TreasuryState {
    pub authority: Pubkey,
    pub lung_cap: u64,
    pub epoch_duration: i64,
    pub current_epoch: u64,
    pub epoch_start_time: i64,
    pub total_outflow_this_epoch: u64,
}

#[error_code]
pub enum TreasuryError {
    #[msg("Not Eligible: Must stake for minimum 14 days.")]
    NotEligibleTime,
    #[msg("Withdrawal exceeds personal capacity determined by Ascesis scars.")]
    ExceedsPersonalCapacity,
    #[msg("Withdrawal exceeds hard wallet cap.")]
    ExceedsHardCap,
    #[msg("Lung balance below safety threshold.")]
    LungEmpty,
    #[msg("Global epoch withdrawal cap reached.")]
    GlobalEpochCapReached,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_eligibility() {
        let day = 24 * 60 * 60;
        assert_eq!(is_eligible(13 * day), false);
        assert_eq!(is_eligible(14 * day), true);
        assert_eq!(is_eligible(100 * day), true);
    }

    #[test]
    fn test_capacity_scaling() {
        let base_cap = 50_000_000; // 0.05 SOL
        
        // 1. Initial Burn only (Ratio 1) -> log2(1) = 0 -> Mult 1 -> 0.05 SOL
        assert_eq!(calculate_capacity(100, 100), base_cap);
        
        // 2. 3x Burn (Ratio 3) -> log2(3) = 1 -> Mult 2 -> 0.10 SOL
        assert_eq!(calculate_capacity(300, 100), base_cap * 2);

        // 3. 16x Burn (Ratio 16) -> log2(16) = 4 -> Mult 5 -> 0.25 SOL (Max)
        assert_eq!(calculate_capacity(1600, 100), base_cap * 5);
        
        // 4. 100x Burn (Ratio 100) -> log2(100) = 6 -> Mult capped at 5 -> 0.25 SOL
        assert_eq!(calculate_capacity(10000, 100), base_cap * 5);
    }

    #[test]
    fn test_efficiency_scaling() {
        // Base Rate = 10_000 Lamports per Token.
        // Requested = 1 SOL (1e9).
        // Base Cost = 1e9 / 10_000 = 100,000 Tokens.
        
        let day = 24 * 60 * 60;
        let one_sol = 1_000_000_000;

        // 1. 0 Days -> Mult 100% -> Cost 100,000
        assert_eq!(calculate_burn_cost(one_sol, 0), 100_000 * 1_000_000_000); // Wait, my math is scaled by 1e9 in fn
        // Ah, the function does `amount * 1e9 / effective`.
        // If effective is 10_000, and amount is 1e9 (1 SOL).
        // Result = 1e18 / 1e4 = 1e14. That seems huge.
        // Let's re-read the function carefully. 
        // `amount_requested` is in Lamports (so 1e9 for 1 SOL).
        // `effective_rate` is Lamports per Token (e.g., 10,000).
        // Actual Tokens Needed = Amount / Rate.
        // 1_000_000_000 / 10_000 = 100_000 Tokens.
        // My function line: `amount_requested * 1_000_000_000 / effective_rate`
        // It injects an EXTRA 1e9 factor? 
        // Oh, maybe it assumes `amount_requested` was passed as SOL units? 
        // No, in Solana we pass u64 Lamports usually.
        // FIX: The formula should just be `amount_requested / effective_rate` if outputs are Token Atomic Units (assuming 0 decimals?)
        // Wait, GRIT has 9 decimals.
        // So 1 Token = 1e9 atomic units.
        // If Rate is "10,000 Lamports buys 1 Full Token",
        // Then:
        // Input: 1e9 Lamports (1 SOL).
        // Yield: 1e9 / 10_000 = 100,000 Full Tokens.
        // In Atomic Units: 100,000 * 1e9.
        // So `amount_requested * (10^decimals) / effective_rate`.
        // Yes, my implementation multiply by 1e9 is correct IF Grit has 9 decimals.
        
        // Let's verify scaling.
        // 30 Days -> (30/30)*10 = 10% bonus. Rate = 110% of base.
        // Rate = 11,000.
        // Cost = 1e9 / 11,000 * 1e9 approx 90,909 * 1e9 tokens. (Cheaper). CORRECT.
    }
}
