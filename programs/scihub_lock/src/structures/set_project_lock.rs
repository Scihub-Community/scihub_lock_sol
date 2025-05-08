use super::ProjectLock;
use super::ScihubLock;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use super::error::ErrorCode;

#[derive(Accounts)]
pub struct SetProjectLock<'info> {
    #[account(
        mut,
        seeds = [crate::PROJECT_LOCK, token_mint.key().as_ref()],
        bump,
        constraint = project_lock.token_mint == token_mint.key()
    )]
    pub project_lock: Account<'info, ProjectLock>,

    #[account(
        seeds = [crate::SCIHUB_LOCK],
        bump,
        has_one = owner @ ErrorCode::Unauthorized,
        constraint = scihub_lock.owner == owner.key()
    )]
    pub scihub_lock: Account<'info, ScihubLock>,

    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> SetProjectLock<'info> {
    pub fn process(&mut self,_is_active: bool) -> Result<()> {
        
        // 初始化项目锁仓
        let project_lock = &mut self.project_lock;
        project_lock.is_active = _is_active;

        // 记录初始化信息
        msg!("Project Lock initialized for token: {}", project_lock.token_mint);
        msg!("Total Amount: {}", project_lock.total_amount);
        msg!("Is Active: {}", project_lock.is_active);
        Ok(())
    }
}