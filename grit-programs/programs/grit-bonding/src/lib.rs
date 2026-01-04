use anchor_lang::prelude::*;

declare_id!("8N8qeFRcxnwJKn2mWvhMahP2S3ChfPwynRtVKAvPepY1");

#[program]
pub mod grit_bonding {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, slope: u64, base_price: u64) -> Result<()> {
        let curve_config = &mut ctx.accounts.curve_config;
        curve_config.authority = ctx.accounts.authority.key();
        curve_config.slope = slope;
        curve_config.base_price = base_price;
        curve_config.total_supply = 0;
        curve_config.reserve_balance = 0;
        Ok(())
    }

    pub fn buy(ctx: Context<Buy>, amount_out: u64) -> Result<()> {
        let curve_config = &mut ctx.accounts.curve_config;
        
        // Linear Curve: Price = Base + Slope * Supply
        // Cost = Integral from Supply to Supply+Amount
        // Simplified: Approx Price * Amount (for MVP, or exact calculus)
        // Exact Cost = Base * Amount + (Slope/2) * ((S+A)^2 - S^2)
        
        let s = curve_config.total_supply as u128;
        let a = amount_out as u128; // Amount of tokens to buy
        let m = curve_config.slope as u128;
        let b = curve_config.base_price as u128;

        // Cost = b*a + (m/2) * (2*s*a + a^2)
        //      = b*a + m*s*a + (m*a^2)/2
        let cost = b.checked_mul(a).unwrap()
            .checked_add(m.checked_mul(s).unwrap().checked_mul(a).unwrap()).unwrap()
            .checked_add(m.checked_mul(a.checked_pow(2).unwrap()).unwrap().checked_div(2).unwrap()).unwrap();
        
        // In reality we would transfer SOL from user to reserve, and Mint tokens to user.
        // For this task, we update state to simulate the math.
        
        curve_config.total_supply = curve_config.total_supply.checked_add(amount_out).unwrap();
        curve_config.reserve_balance = curve_config.reserve_balance.checked_add(cost as u64).unwrap();

        msg!("Purchased {} tokens for {} lamports", amount_out, cost);
        msg!("New Supply: {}, Reserve: {}", curve_config.total_supply, curve_config.reserve_balance);

        Ok(())
    }

    pub fn sell(ctx: Context<Sell>, amount_in: u64) -> Result<()> {
        let curve_config = &mut ctx.accounts.curve_config;

        let s = curve_config.total_supply as u128;
        let a = amount_in as u128; // Amount of tokens to sell
        let m = curve_config.slope as u128;
        let b = curve_config.base_price as u128;

        // Refund = Integral from S-A to S
        //        = b*a + m*s*a - (m*a^2)/2
        let refund = b.checked_mul(a).unwrap()
            .checked_add(m.checked_mul(s).unwrap().checked_mul(a).unwrap()).unwrap()
            .checked_sub(m.checked_mul(a.checked_pow(2).unwrap()).unwrap().checked_div(2).unwrap()).unwrap();

        curve_config.total_supply = curve_config.total_supply.checked_sub(amount_in).unwrap();
        curve_config.reserve_balance = curve_config.reserve_balance.checked_sub(refund as u64).unwrap();

        msg!("Sold {} tokens for {} lamports", amount_in, refund);
        msg!("New Supply: {}, Reserve: {}", curve_config.total_supply, curve_config.reserve_balance);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8 + 8 + 8 + 8)]
    pub curve_config: Account<'info, CurveConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub curve_config: Account<'info, CurveConfig>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct Sell<'info> {
    #[account(mut)]
    pub curve_config: Account<'info, CurveConfig>,
    pub user: Signer<'info>,
}

#[account]
pub struct CurveConfig {
    pub authority: Pubkey,
    pub slope: u64,       // Slope of the curve
    pub base_price: u64,  // Starting price
    pub total_supply: u64,
    pub reserve_balance: u64, // SOL held in bonding curve
}
