use anchor_lang::prelude::*;

declare_id!("AotidXSUcQsaQHbkwwrrnCX9MiMYhu9JimPA2LJ2VSxj");

#[program]
pub mod grit_gov {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn create_proposal(ctx: Context<CreateProposal>, title: String, description: String) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.author = ctx.accounts.author.key();
        proposal.title = title;
        proposal.description = description;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.status = ProposalStatus::Active;
        proposal.creation_time = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, _proposal_id: u64, approve: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote_record = &mut ctx.accounts.vote_record;

        require!(proposal.status == ProposalStatus::Active, ErrorCode::ProposalNotActive);

        vote_record.voter = ctx.accounts.voter.key();
        vote_record.proposal = proposal.key();
        vote_record.approve = approve;

        if approve {
            proposal.votes_for += 1; // Simplistic: 1 vote per user. Real gov uses token weight.
        } else {
            proposal.votes_against += 1;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(init, payer = author, space = 8 + 32 + 64 + 256 + 8 + 8 + 2 + 8)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    #[account(init, payer = voter, space = 8 + 32 + 32 + 1)]
    pub vote_record: Account<'info, VoteRecord>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Proposal {
    pub author: Pubkey,
    pub title: String, // Max 64 chars
    pub description: String, // Max 256 chars
    pub votes_for: u64,
    pub votes_against: u64,
    pub status: ProposalStatus,
    pub creation_time: i64,
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub proposal: Pubkey,
    pub approve: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Active,
    Passed,
    Failed,
    Executed,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Proposal is not active.")]
    ProposalNotActive,
}
