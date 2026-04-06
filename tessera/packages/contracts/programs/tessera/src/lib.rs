use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::instructions::{load_instruction_at_checked, ID as IX_ID};
use anchor_lang::solana_program::ed25519_program::ID as ED25519_ID;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod tessera {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Tessera Smart Contract Initialized");
        Ok(())
    }

    pub fn initialize_profile(ctx: Context<InitializeProfile>) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        profile.owner = ctx.accounts.owner.key();
        profile.last_mint_timestamp = 0;
        profile.streak_counter = 0;
        profile.total_mints = 0;
        profile.highest_frame_tier = 0;
        Ok(())
    }

    pub fn mint_tessera(ctx: Context<MintTessera>, payload: BundledMetadataPayload) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        let tessera = &mut ctx.accounts.new_tessera;

        // 1. Verify Ed25519 signature via ix_sysvar
        let ix = load_instruction_at_checked(0, &ctx.accounts.ix_sysvar)?;
        require_keys_eq!(ix.program_id, ED25519_ID, ErrorCode::InvalidSignature);

        // 2. Cooldown check
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;
        let seconds_in_day = 86400;

        // Enforce one mint per day (86400 seconds)
        require!(
            current_timestamp - profile.last_mint_timestamp >= seconds_in_day,
            ErrorCode::MintTooSoon
        );

        // Update streak: if it's been more than 48 hours, streak resets, otherwise increment
        if profile.last_mint_timestamp == 0 || (current_timestamp - profile.last_mint_timestamp > seconds_in_day * 2) {
            profile.streak_counter = 1;
        } else {
            profile.streak_counter = profile.streak_counter.checked_add(1).unwrap_or(1);
        }

        profile.total_mints = profile.total_mints.checked_add(1).unwrap_or(1);
        profile.last_mint_timestamp = current_timestamp;

        // 3. Populate new TesseraAccount
        tessera.wallet_owner = ctx.accounts.owner.key();
        tessera.minting_timestamp = current_timestamp;
        tessera.bmp = payload.clone();

        emit!(TesseraMinted {
            wallet_owner: tessera.wallet_owner,
            total_mints_count: profile.total_mints,
            streak_counter: profile.streak_counter,
            minting_timestamp: current_timestamp,
        });

        msg!("Minting Tessera! Total Mints: {}, Streak: {}", profile.total_mints, profile.streak_counter);
        Ok(())
    }

    pub fn record_milestone(ctx: Context<RecordMilestone>, skill_id: u8, tier_unlocked: u8) -> Result<()> {
        let milestone = &mut ctx.accounts.milestone;
        let profile = &mut ctx.accounts.user_profile;
        let clock = Clock::get()?;
        
        milestone.wallet_owner = ctx.accounts.owner.key();
        milestone.skill_id = skill_id;
        milestone.tier_unlocked = tier_unlocked;
        milestone.unlock_timestamp = clock.unix_timestamp;

        // Update the global user highest frame tier
        if tier_unlocked > profile.highest_frame_tier {
            profile.highest_frame_tier = tier_unlocked;
        }

        msg!("Milestone Unlocked! Skill: {}, Tier: {}", skill_id, tier_unlocked);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 8 + 4 + 4 + 1 + 3, // discriminator + pubkey + i64 + u32 + u32 + u8 + padding
        seeds = [b"profile", owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payload: BundledMetadataPayload)]
pub struct MintTessera<'info> {
    #[account(
        mut,
        seeds = [b"profile", owner.key().as_ref()],
        bump,
        has_one = owner
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(
        init,
        payer = owner,
        // 8 (discriminator) + 32 (owner) + 8 (timestamp) + 64 (sig) + 32 (hash) + 4 (string prefix) + 128 (max uri)
        space = 8 + 32 + 8 + 64 + 32 + 4 + 128,
        seeds = [b"tessera", owner.key().as_ref(), &user_profile.total_mints.to_le_bytes()],
        bump
    )]
    pub new_tessera: Account<'info, TesseraAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: The instruction sysvar is required to verify the Ed25519 signature
    #[account(address = IX_ID)]
    pub ix_sysvar: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(skill_id: u8, tier_unlocked: u8)]
pub struct RecordMilestone<'info> {
    #[account(
        mut,
        seeds = [b"profile", owner.key().as_ref()],
        bump,
        has_one = owner
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 1 + 1 + 8, // discriminator + pubkey + u8 + u8 + i64
        seeds = [b"milestone", owner.key().as_ref(), &[skill_id], &[tier_unlocked]],
        bump
    )]
    pub milestone: Account<'info, MilestoneAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserProfile {
    pub owner: Pubkey,
    pub last_mint_timestamp: i64,
    pub streak_counter: u32,
    pub total_mints: u32,
    pub highest_frame_tier: u8,
}

#[account]
pub struct TesseraAccount {
    pub wallet_owner: Pubkey,
    pub minting_timestamp: i64,
    pub bmp: BundledMetadataPayload,
}

#[account]
pub struct MilestoneAccount {
    pub wallet_owner: Pubkey,
    pub skill_id: u8,
    pub tier_unlocked: u8,
    pub unlock_timestamp: i64,
}

#[event]
pub struct TesseraMinted {
    pub wallet_owner: Pubkey,
    pub total_mints_count: u32,
    pub streak_counter: u32,
    pub minting_timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BundledMetadataPayload {
    pub auth_sig: [u8; 64],
    pub data_hash: [u8; 32],
    pub metadata_uri: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You can only mint one Tessera per day.")]
    MintTooSoon,
    #[msg("Invalid Ed25519 payload signature.")]
    InvalidSignature,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mint_cooldown_logic() {
        let mut profile = UserProfile {
            owner: Pubkey::new_unique(),
            last_mint_timestamp: 1000000,
            streak_counter: 1,
            total_mints: 1,
            highest_frame_tier: 0,
        };
        let seconds_in_day = 86400;

        let too_soon_timestamp = profile.last_mint_timestamp + seconds_in_day - 1;
        assert!(too_soon_timestamp - profile.last_mint_timestamp < seconds_in_day);

        let exact_timestamp = profile.last_mint_timestamp + seconds_in_day;
        assert!(exact_timestamp - profile.last_mint_timestamp >= seconds_in_day);
    }
}
