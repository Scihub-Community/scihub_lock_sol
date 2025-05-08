use super::UserLock;
use super::ProjectLock;
use super::ScihubLock;
use super::UserLockInfo;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, transfer, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use super::error::ErrorCode;

#[derive(Accounts)]
pub struct Unlock<'info> {
    #[account(
        mut,
        seeds = [crate::USER_LOCK, user.key().as_ref(), project_lock.key().as_ref(), user_lock.index.to_le_bytes().as_ref()],
        bump,
        constraint = user_lock.user == user.key() @ ErrorCode::Unauthorized,
        constraint = user_lock.token_mint == token_mint.key() @ ErrorCode::TokenMintMismatch,
        constraint = Clock::get()?.unix_timestamp >= user_lock.end_time @ ErrorCode::LockPeriodNotEnded
    )]
    pub user_lock: Account<'info, UserLock>,

    #[account(
        mut,
        seeds = [crate::USER_LOCK_INFO, user.key().as_ref(), project_lock.key().as_ref()],
        bump,
        constraint = user_lock_info.user == user.key() @ ErrorCode::Unauthorized,
        constraint = user_lock_info.token_mint == token_mint.key() @ ErrorCode::TokenMintMismatch
    )]
    pub user_lock_info: Account<'info, UserLockInfo>,

    #[account(
        mut,
        seeds = [crate::PROJECT_LOCK, project_lock.token_mint.key().as_ref()],
        bump,
        constraint = project_lock.token_mint == token_mint.key() @ ErrorCode::TokenMintMismatch
    )]
    pub project_lock: Account<'info, ProjectLock>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = user_token_account.owner == user.key() @ ErrorCode::Unauthorized,
        constraint = user_token_account.mint == token_mint.key() @ ErrorCode::TokenMintMismatch
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = lock_token_account.owner == project_lock.key(),
        constraint = lock_token_account.mint == project_lock.token_mint.key()
    )]
    pub lock_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Unlock<'info> {
    pub fn process(&mut self) -> Result<()> {
        //todo: 解锁
        
        Ok(())
    }
}
