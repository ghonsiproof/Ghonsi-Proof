use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{freeze_account, mint_to, Mint, Token, TokenAccount},
    metadata::{
        create_metadata_accounts_v3,
        mpl_token_metadata::{self, types::{Creator, DataV2, Collection}},
    },
};

declare_id!("1kHWND86rQvbYKLJaj19233kQpxDnbFRDzWGSfTa6xS");

pub const PROOF_SEED: &[u8] = b"proof";
pub const MINT_FEE_LAMPORTS: u64 = 10_000_000; // 0.01 SOL

#[program]
pub mod ghonsi_proof {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.program_authority.admin = ctx.accounts.admin.key();
        msg!("Program initialized. Admin: {}", ctx.accounts.admin.key());
        Ok(())
    }

    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        new_title: String,
        new_uri: String,
    ) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.admin.key(),
            ctx.accounts.program_authority.admin,
            ErrorCode::Unauthorized
        );

        let data_v2 = DataV2 {
            name: new_title,
            symbol: "PROOF".to_string(),
            uri: new_uri,
            seller_fee_basis_points: 0,
            creators: Some(vec![Creator {
                address: ctx.accounts.program_authority.key(),
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
                    payer: ctx.accounts.admin.to_account_info(),
                    update_authority: ctx.accounts.program_authority.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                &[&[b"authority", &[ctx.bumps.mint_authority]]],
            ),
            data_v2,
            false,
            true,
            None,
        )?;

        msg!("Metadata updated for mint {}", ctx.accounts.mint.key());
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

        // Charge 0.01 SOL fee to admin
        let admin_key = ctx.accounts.program_authority.admin;
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.payer.key(),
            &admin_key,
            MINT_FEE_LAMPORTS,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.admin.to_account_info(),
            ],
        )?;

        let proof = &mut ctx.accounts.proof;
        proof.mint = ctx.accounts.mint.key();
        proof.owner = ctx.accounts.recipient.key();
        proof.proof_id = proof_id;
        proof.title = title.clone();
        proof.status = ProofStatus::Pending;
        proof.date = date;
        proof.proof_type = proof_type;
        proof.bump = ctx.bumps.proof;

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
pub struct UpdateMetadata<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"program_authority"],
        bump,
    )]
    pub program_authority: Account<'info, ProgramAuthority>,

    /// CHECK: This is the existing metadata account - derivation enforced by seeds
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,

    /// CHECK: PDA mint authority
    #[account(seeds = [b"authority"], bump)]
    pub mint_authority: UncheckedAccount<'info>,

    /// CHECK: Collection mint
    pub collection_mint: UncheckedAccount<'info>,

    /// CHECK: Metaplex program
    #[account(address = mpl_token_metadata::ID)]
    pub metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
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
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: PDA mint/freeze authority
    #[account(seeds = [b"authority"], bump)]
    pub mint_authority: UncheckedAccount<'info>,

    #[account(seeds = [b"program_authority"], bump)]
    pub program_authority: Account<'info, ProgramAuthority>,

    /// CHECK: Collection mint
    pub collection_mint: UncheckedAccount<'info>,

    /// CHECK: Admin receives fee (address = program_authority.admin)
    #[account(address = program_authority.admin)]
    pub admin: UncheckedAccount<'info>,

    /// CHECK: Metadata PDA
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

    /// CHECK: Metaplex program
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
    pub title: String,
    pub status: ProofStatus,
    pub date: String,
    pub proof_type: String,
    pub bump: u8,
}

impl Proof {
    pub const INIT_SPACE: usize = 
        32 + 32 +                    // mint + owner
        (4 + 32) + (4 + 64) +         // proof_id + title
        1 +                          // status
        (4 + 32) + (4 + 32) +         // date + proof_type
        1;                           // bump
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