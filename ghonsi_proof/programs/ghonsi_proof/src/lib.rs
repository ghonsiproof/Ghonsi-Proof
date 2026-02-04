use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{freeze_account, mint_to, Mint, Token, TokenAccount},
    metadata::{
        create_metadata_accounts_v3,
        mpl_token_metadata::{self, types::{Creator, DataV2, Collection}},
        Metadata,
    },
};

declare_id!("FAoVEXXpg5iBRvY8kFeMedSPy3a9VSgMZWj5739gEgTB");

pub const PROOF_SEED: &[u8] = b"proof";
pub const MINT_FEE_LAMPORTS: u64 = 10_000_000; // 0.01 SOL

#[program]
pub mod ghonsi_proof {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let authority = &mut ctx.accounts.program_authority;
        authority.primary_admin = ctx.accounts.admin.key();
        authority.admin_count = 1;
        authority.admins[0] = ctx.accounts.admin.key();
        
        msg!("Program initialized. Primary Admin: {}", ctx.accounts.admin.key());
        Ok(())
    }

    pub fn add_admin(ctx: Context<ManageAdmin>, new_admin: Pubkey) -> Result<()> {
        let authority = &mut ctx.accounts.program_authority;
        
        require_keys_eq!(
            ctx.accounts.admin.key(),
            authority.primary_admin,
            ErrorCode::Unauthorized
        );

        require!(
            authority.admin_count < 10,
            ErrorCode::MaxAdminsReached
        );

        // Check if already an admin
        for i in 0..authority.admin_count {
            require_keys_neq!(
                authority.admins[i as usize],
                new_admin,
                ErrorCode::AlreadyAdmin
            );
        }

        // Store admin_count in local variable first
        let index = authority.admin_count as usize;
        authority.admins[index] = new_admin;
        authority.admin_count += 1;

        msg!("Admin added: {}", new_admin);
        Ok(())
    }

    pub fn remove_admin(ctx: Context<ManageAdmin>, admin_to_remove: Pubkey) -> Result<()> {
        let authority = &mut ctx.accounts.program_authority;
        
        require_keys_eq!(
            ctx.accounts.admin.key(),
            authority.primary_admin,
            ErrorCode::Unauthorized
        );

        // Can't remove primary admin
        require_keys_neq!(
            admin_to_remove,
            authority.primary_admin,
            ErrorCode::CannotRemovePrimaryAdmin
        );

        let mut found_index = None;
        for i in 0..authority.admin_count {
            if authority.admins[i as usize] == admin_to_remove {
                found_index = Some(i);
                break;
            }
        }

        require!(found_index.is_some(), ErrorCode::AdminNotFound);

        // Store values in local variables
        let index = found_index.unwrap() as usize;
        let count = authority.admin_count as usize;
        
        // Shift admins down
        for i in index..(count - 1) {
            authority.admins[i] = authority.admins[i + 1];
        }
        authority.admin_count -= 1;

        msg!("Admin removed: {}", admin_to_remove);
        Ok(())
    }

    pub fn mint_proof(
        ctx: Context<MintProof>,
        proof_id: String,
        title: String,
        uri: String,
        work_description: String,
        proof_type: String,
    ) -> Result<()> {
        require!(proof_id.len() <= 32, ErrorCode::IdTooLong);
        require!(title.len() <= 64, ErrorCode::TitleTooLong);
        require!(uri.len() <= 200, ErrorCode::UriTooLong);
        require!(work_description.len() <= 500, ErrorCode::DescriptionTooLong);

        // Charge fee to admin wallet
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &ctx.accounts.program_authority.primary_admin,
            MINT_FEE_LAMPORTS,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.admin.to_account_info(),
            ],
        )?;

        let clock = Clock::get()?;
        let proof = &mut ctx.accounts.proof;
        proof.mint = ctx.accounts.mint.key();
        proof.owner = ctx.accounts.owner.key();
        proof.proof_id = proof_id;
        proof.title = title.clone();
        proof.work_description = work_description;
        proof.status = ProofStatus::Pending;
        proof.submission_date = clock.unix_timestamp;
        proof.verification_date = 0;
        proof.proof_type = proof_type;
        proof.verified_by = Pubkey::default();
        proof.rejection_reason = String::new();
        proof.bump = ctx.bumps.proof;

        // Mint the NFT
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                &[&[b"authority", &[ctx.bumps.mint_authority]]],
            ),
            1,
        )?;

        // Freeze the account (soulbound)
        freeze_account(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::FreezeAccount {
                    account: ctx.accounts.token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                &[&[b"authority", &[ctx.bumps.mint_authority]]],
            ),
        )?;

        // Create metadata
        let data_v2 = DataV2 {
            name: title,
            symbol: "PROOF".to_string(),
            uri,
            seller_fee_basis_points: 0,
            creators: Some(vec![Creator {
                address: ctx.accounts.mint_authority.key(),
                verified: true,
                share: 100,
            }]),
            collection: Some(Collection {
                verified: false,
                key: ctx.accounts.collection_mint.key(),
            }),
            uses: None,
        };

        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.metadata_program.to_account_info(),
                anchor_spl::metadata::CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.mint_authority.to_account_info(),
                    payer: ctx.accounts.owner.to_account_info(),
                    update_authority: ctx.accounts.mint_authority.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                &[&[b"authority", &[ctx.bumps.mint_authority]]],
            ),
            data_v2,
            true,
            true,
            None,
        )?;

        msg!("Proof minted: {} by {}", proof.proof_id, proof.owner);
        Ok(())
    }

    pub fn verify_proof(ctx: Context<VerifyProof>) -> Result<()> {
        let authority = &ctx.accounts.program_authority;
        
        // Check if signer is an admin
        let mut is_admin = false;
        for i in 0..authority.admin_count {
            if authority.admins[i as usize] == ctx.accounts.admin.key() {
                is_admin = true;
                break;
            }
        }
        require!(is_admin, ErrorCode::Unauthorized);

        let clock = Clock::get()?;
        let proof = &mut ctx.accounts.proof;
        
        require!(
            proof.status == ProofStatus::Pending,
            ErrorCode::ProofAlreadyProcessed
        );

        proof.status = ProofStatus::Verified;
        proof.verification_date = clock.unix_timestamp;
        proof.verified_by = ctx.accounts.admin.key();

        msg!("Proof verified: {} by admin {}", proof.proof_id, ctx.accounts.admin.key());
        Ok(())
    }

    pub fn reject_proof(
        ctx: Context<VerifyProof>,
        reason: String,
    ) -> Result<()> {
        let authority = &ctx.accounts.program_authority;
        
        // Check if signer is an admin
        let mut is_admin = false;
        for i in 0..authority.admin_count {
            if authority.admins[i as usize] == ctx.accounts.admin.key() {
                is_admin = true;
                break;
            }
        }
        require!(is_admin, ErrorCode::Unauthorized);

        require!(reason.len() <= 200, ErrorCode::ReasonTooLong);

        let clock = Clock::get()?;
        let proof = &mut ctx.accounts.proof;
        
        require!(
            proof.status == ProofStatus::Pending,
            ErrorCode::ProofAlreadyProcessed
        );

        proof.status = ProofStatus::Rejected;
        proof.verification_date = clock.unix_timestamp;
        proof.verified_by = ctx.accounts.admin.key();
        proof.rejection_reason = reason;

        msg!("Proof rejected: {} by admin {}", proof.proof_id, ctx.accounts.admin.key());
        Ok(())
    }
}

// ============================================================================
// ACCOUNTS
// ============================================================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + ProgramAuthority::SPACE,
        seeds = [b"program_authority"],
        bump,
    )]
    pub program_authority: Account<'info, ProgramAuthority>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageAdmin<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"program_authority"],
        bump,
    )]
    pub program_authority: Account<'info, ProgramAuthority>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintProof<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + Proof::INIT_SPACE,
        seeds = [PROOF_SEED, owner.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub proof: Account<'info, Proof>,

    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA mint/freeze authority
    #[account(seeds = [b"authority"], bump)]
    pub mint_authority: UncheckedAccount<'info>,

    #[account(seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,

    /// CHECK: Collection mint
    pub collection_mint: UncheckedAccount<'info>,

    /// CHECK: Admin receives fee
    #[account(mut, address = program_authority.primary_admin)]
    pub admin: UncheckedAccount<'info>,

    /// CHECK: Metadata account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex metadata program
    #[account(address = mpl_token_metadata::ID)]
    pub metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct VerifyProof<'info> {
    #[account(mut)]
    pub proof: Account<'info, Proof>,
    
    pub admin: Signer<'info>,
    
    #[account(seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,
}

// ============================================================================
// STATE
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Proof {
    pub mint: Pubkey,
    pub owner: Pubkey,
    #[max_len(32)]
    pub proof_id: String,
    #[max_len(64)]
    pub title: String,
    #[max_len(500)]
    pub work_description: String,
    pub status: ProofStatus,
    pub submission_date: i64,
    pub verification_date: i64,
    #[max_len(32)]
    pub proof_type: String,
    pub verified_by: Pubkey,
    #[max_len(200)]
    pub rejection_reason: String,
    pub bump: u8,
}

#[account]
pub struct ProgramAuthority {
    pub primary_admin: Pubkey,
    pub admin_count: u8,
    pub admins: [Pubkey; 10],  // Support up to 10 admins
}

impl ProgramAuthority {
    // Manual space calculation for the account
    // 32 (primary_admin) + 1 (admin_count) + (32 * 10) (admins array)
    pub const SPACE: usize = 32 + 1 + (32 * 10);
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ProofStatus {
    Pending,
    Verified,
    Rejected,
}

impl Default for ProofStatus {
    fn default() -> Self {
        ProofStatus::Pending
    }
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Proof ID too long (max 32 characters)")]
    IdTooLong,
    
    #[msg("Title too long (max 64 characters)")]
    TitleTooLong,
    
    #[msg("URI too long (max 200 characters)")]
    UriTooLong,
    
    #[msg("Work description too long (max 500 characters)")]
    DescriptionTooLong,
    
    #[msg("Rejection reason too long (max 200 characters)")]
    ReasonTooLong,
    
    #[msg("Unauthorized: You are not an admin")]
    Unauthorized,
    
    #[msg("Proof has already been verified or rejected")]
    ProofAlreadyProcessed,
    
    #[msg("Maximum number of admins reached (10)")]
    MaxAdminsReached,
    
    #[msg("This address is already an admin")]
    AlreadyAdmin,
    
    #[msg("Admin not found")]
    AdminNotFound,
    
    #[msg("Cannot remove the primary admin")]
    CannotRemovePrimaryAdmin,
}