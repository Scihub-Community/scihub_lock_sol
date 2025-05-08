use super::UserLockInfo;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer, Mint, transfer};
use anchor_spl::associated_token::AssociatedToken;
use super::error::ErrorCode;

#[derive(Accounts)]
pub struct InitUserLockInfo<'info> {
    #[account(
        init,
        payer = owner,
        space = 8+core::mem::size_of::<UserLockInfo>(),
        seeds = [crate::USER_LOCK_INFO, user.key().as_ref(), project_lock.key().as_ref()],
        bump
    )]
    pub user_lock_info: Account<'info, UserLockInfo>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitScihubLock<'info> {
    pub fn process(&mut self) -> Result<()> {

        let user_lock_info = &mut self.user_lock_info;

        user_lock_info.user = self.owner.key();
        user_lock_info.project_lock = self.project_lock.key();
        user_lock_info.index = 0;
        user_lock_info.amount = 0;

        msg!("User lock info initialized");
        msg!("User: {}", user_lock_info.user);
        msg!("Project lock: {}", user_lock_info.project_lock);
        msg!("Index: {}", user_lock_info.index);
        msg!("Amount: {}", user_lock_info.amount);

        Ok(())
    }
}
