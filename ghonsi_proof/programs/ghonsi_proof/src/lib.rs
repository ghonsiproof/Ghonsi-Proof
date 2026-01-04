use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{freeze_account, mint_to, FreezeAccount, Mint, Token, TokenAccount},
    metadata::{
        create_metadata_accounts_v3, CreateMetadataAccountsV3,
        mpl_token_metadata::{self, types::{Creator, DataV2}},
    },
};

declare_id!("1kHWND86rQvbYKLJaj19233kQpxDnbFRDzWGSfTa6xS");

pub const PROOF_SEED: &[u8] = b"proof";

#[program]
pub mod ghonsi_proof {
    use super::*;

    // NEW: Initialize the program and set the admin
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.program_authority.admin = ctx.accounts.admin.key();
        msg!("Program initialized. Admin: {}", ctx.accounts.admin.key());
        Ok(())
    }

    pub fn mint_proof(
        ctx: Context<MintProof>,
        proof_id: String,
        title: String,
        uri: String,
        date: String,
        proof_type: String,
    ) -> Result<()> {
        require!(proof_id.len() <= 32, ErrorCode::IdTooLong);
        require!(title.len() <= 64, ErrorCode::TitleTooLong);
        require!(uri.len() <= 200, ErrorCode::UriTooLong);

        let proof = &mut ctx.accounts.proof;
        proof.mint = ctx.accounts.mint.key();
        proof.owner = ctx.accounts.recipient.key();
        proof.proof_id = proof_id;
        proof.status = ProofStatus::Pending;
        proof.date = date;
        proof.proof_type = proof_type;
        proof.bump = ctx.bumps.proof;

        // Mint 1 token → NFT
        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            1,
        )?;

        // Make soulbound by permanently freezing the token account
        freeze_account(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                FreezeAccount {
                    account: ctx.accounts.token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                &[&[b"authority", &[ctx.bumps.mint_authority]]],
            ),
        )?;

        // Create Metaplex metadata
        let data_v2 = DataV2 {
            name: title,
            symbol: "PROOF".to_string(),
            uri,
            seller_fee_basis_points: 0,
            creators: Some(vec![Creator {
                address: ctx.accounts.program_authority.key(),
                verified: true,
                share: 100,
            }]),
            collection: None,
            uses: None,
        };

        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    mint_authority: ctx.accounts.mint_authority.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    update_authority: ctx.accounts.program_authority.to_account_info(),
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

        Ok(())
    }

    pub fn verify_proof(ctx: Context<VerifyProof>) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.admin.key(),
            ctx.accounts.program_authority.admin,
            ErrorCode::Unauthorized
        );

        ctx.accounts.proof.status = ProofStatus::Verified;
        Ok(())
    }
}

// NEW: Initialize context
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + 32,
        seeds = [b"program_authority"],
        bump,
    )]
    pub program_authority: Account<'info, ProgramAuthority>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintProof<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub recipient: SystemAccount<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + Proof::INIT_SPACE,
        seeds = [PROOF_SEED, recipient.key().as_ref()],
        bump,
    )]
    pub proof: Account<'info, Proof>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: This is safe because it's a PDA derived from ["authority"] and used only as mint/freeze authority
    #[account(seeds = [b"authority"], bump)]
    pub mint_authority: UncheckedAccount<'info>,

    /// CHECK: This is safe because it's a PDA derived from ["program_authority"] and used as metadata update authority
    #[account(seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,

    /// CHECK: Metadata account is correctly derived and constrained by seeds + program ID
    #[account(
        mut,
        seeds = [
            b"metadata",
            mpl_token_metadata::ID.as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        seeds::program = mpl_token_metadata::ID,
    )]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: This is the Metaplex Token Metadata program - verified by address
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

#[account]
pub struct Proof {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub proof_id: String,
    pub status: ProofStatus,
    pub date: String,
    pub proof_type: String,
    pub bump: u8,
}

impl Proof {
    pub const INIT_SPACE: usize = 32 + 32 + 4 + 32 + 1 + 4 + 32 + 4 + 32 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ProofStatus {
    Pending,
    Verified,
}

impl Default for ProofStatus {
    fn default() -> Self {
        ProofStatus::Pending
    }
}

#[account]
pub struct ProgramAuthority {
    pub admin: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Proof ID too long")]
    IdTooLong,
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("URI too long")]
    UriTooLong,
    #[msg("Unauthorized")]
    Unauthorized,
}