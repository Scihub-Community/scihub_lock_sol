use super::ProjectLock;
use super::ScihubLock;
use anchor_lang::prelude::*;
use anchor_spl::token::{ Mint};
use super::error::ErrorCode;

#[derive(Accounts)]
pub struct InitProjectLock<'info> {
    #[account(
        init,
        payer = owner,
        space = 8+core::mem::size_of::<ProjectLock>(),
        seeds = [crate::PROJECT_LOCK, token_mint.key().as_ref()],
        bump
    )]
    pub project_lock: Account<'info, ProjectLock>,

    #[account(
        seeds = [crate::SCIHUB_LOCK],
        bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub scihub_lock: Account<'info, ScihubLock>,

    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitProjectLock<'info> {
    pub fn process(&mut self) -> Result<()> {
        //验证owner
        require!(self.owner.key() == self.scihub_lock.owner, ErrorCode::Unauthorized);

        // 初始化项目锁仓
        let project_lock = &mut self.project_lock;
        project_lock.token_mint = self.token_mint.key();
        project_lock.total_amount = 0;
        project_lock.is_active = true;

        project_lock.reward_token_per_sec = 0;
        project_lock.accumulated_reward_per_share = 0;
        project_lock.last_reward_timestamp = Clock::get()?.unix_timestamp as u64;


        // 记录初始化信息
        msg!("Project Lock initialized for token: {}", project_lock.token_mint);
        msg!("Total Amount: {}", project_lock.total_amount);
        msg!("Is Active: {}", project_lock.is_active);
        msg!("Reward Token Per Sec: {}", project_lock.reward_token_per_sec);
        msg!("Accumulated Reward Per Share: {}", project_lock.accumulated_reward_per_share);
        msg!("Last Reward Timestamp: {}", project_lock.last_reward_timestamp);
        msg!("Project Lock initialized successfully!");
        Ok(())
    }
}