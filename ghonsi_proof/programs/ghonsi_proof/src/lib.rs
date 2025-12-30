use anchor_lang::prelude::*;

declare_id!("1kHWND86rQvbYKLJaj19233kQpxDnbFRDzWGSfTa6xS");

#[program]
pub mod ghonsi_proof {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
