use super::UserLockInfo;
use super::ProjectLock;
use anchor_lang::prelude::*;
use anchor_spl::token::{ Mint};


#[derive(Accounts)]
pub struct InitUserLockInfo<'info> {
    #[account(
        init,
        payer = owner,
        space = 8+core::mem::size_of::<UserLockInfo>(),
        seeds = [crate::USER_LOCK_INFO, owner.key().as_ref(), project_lock.key().as_ref()],
        bump
    )]
    pub user_lock_info: Account<'info, UserLockInfo>,

    #[account(
        seeds = [crate::PROJECT_LOCK, token_mint.key().as_ref()],
        bump
    )]
    pub project_lock: Account<'info, ProjectLock>,

    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitUserLockInfo<'info> {
    pub fn process(&mut self) -> Result<()> {

        let user_lock_info = &mut self.user_lock_info;

        user_lock_info.user = self.owner.key();
        user_lock_info.token_mint = self.token_mint.key();
        user_lock_info.index = 0;
        user_lock_info.amount = 0;
        user_lock_info.accumulated_reward = 0;
        user_lock_info.reward_debt = 0;
        user_lock_info.receivedReward = 0;


        msg!("User lock info initialized");
        msg!("User: {}", user_lock_info.user);
        msg!("Token mint: {}", user_lock_info.token_mint);
        msg!("Index: {}", user_lock_info.index);
        msg!("Amount: {}", user_lock_info.amount);
        msg!("Accumulated reward: {}", user_lock_info.accumulated_reward);
        msg!("Reward debt: {}", user_lock_info.reward_debt);
        msg!("Received reward: {}", user_lock_info.receivedReward);
        msg!("User lock info initialized successfully!");

        Ok(())
    }
}
