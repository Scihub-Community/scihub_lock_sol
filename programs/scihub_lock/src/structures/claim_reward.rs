use super::UserLockInfo;
use super::ProjectLock;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, transfer, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use super::ErrorCode;
use crate::COMPUTATION_DECIMALS;

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(
        mut,
        seeds = [crate::USER_LOCK_INFO, user.key().as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub user_lock_info: Account<'info, UserLockInfo>,
    
    #[account(
        mut,
        seeds = [crate::PROJECT_LOCK, token_mint.key().as_ref()],
        bump,
        constraint = project_lock.is_active @ ErrorCode::ProjectLockNotActive,
        constraint = project_lock.reward_token_mint == reward_token_mint.key() @ ErrorCode::TokenMintMismatch
    )]
    pub project_lock: Account<'info, ProjectLock>,

    pub token_mint: Account<'info, Mint>,
    pub reward_token_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = user_reward_token_account.owner == user.key() @ ErrorCode::Unauthorized,
        constraint = user_reward_token_account.mint == reward_token_mint.key() @ ErrorCode::TokenMintMismatch
    )]
    pub user_reward_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = project_reward_token_account.mint == project_lock.reward_token_mint
    )]
    pub project_reward_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> ClaimReward<'info> {
    pub fn process(&mut self,bump_seed: u8) -> Result<()> {
        // 获取当前时间戳
        let current_timestamp = Clock::get()?.unix_timestamp as u64;
        
        // 计算用户应得的奖励
        let pending_reward = self.calculate_pending_reward()?;
        
        // 检查是否有奖励可领取
        require!(pending_reward > 0, ErrorCode::NoRewardsToClaim);
        
        // 检查奖励账户余额是否足够
        require!(
            self.project_reward_token_account.amount >= pending_reward,
            ErrorCode::InsufficientRewardBalance
        );
        
        // 更新用户的奖励债务
        self.update_user_reward_debt(current_timestamp)?;
        
        // 准备PDA签名
        let signer_seeds: &[&[&[u8]]] = &[&[
            crate::PROJECT_LOCK,
            self.project_lock.token_mint.as_ref(),
            &[bump_seed]
        ]];
        // 转移奖励代币到用户账户
        transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.project_reward_token_account.to_account_info(),
                    to: self.user_reward_token_account.to_account_info(),
                    authority: self.project_lock.to_account_info(),
                },
                signer_seeds,
            ),
            pending_reward,
        )?;
        
        // 更新用户已领取的奖励
        self.user_lock_info.receivedReward = self.user_lock_info.receivedReward
            .checked_add(pending_reward)
            .unwrap_or(self.user_lock_info.receivedReward);
        
        msg!("User {} claimed {} reward tokens", self.user.key(), pending_reward);
        
        Ok(())
    }
    
    // 计算用户待领取的奖励
    fn calculate_pending_reward(&self) -> Result<u64> {
        // 如果用户没有锁仓数量，则没有奖励
        if self.user_lock_info.amount == 0 {
            return Ok(0);
        }
        
        // 计算用户应得的奖励
        let accumulated_reward_per_share = self.project_lock.accumulated_reward_per_share;
        
        // 计算用户新的奖励债务
        let user_reward_debt = (self.user_lock_info.amount as u128)
            .checked_mul(accumulated_reward_per_share as u128)
            .unwrap_or(0)
            .checked_div(COMPUTATION_DECIMALS as u128)
            .unwrap_or(0) as u64;
        
        // 计算待领取奖励 = 新的奖励债务 - 已记录的奖励债务
        let pending_reward = user_reward_debt.saturating_sub(self.user_lock_info.reward_debt);
        
        Ok(pending_reward)
    }
    
    // 更新用户的奖励债务
    fn update_user_reward_debt(&mut self, current_timestamp: u64) -> Result<()> {
        // 更新用户的奖励债务
        let new_reward_debt = (self.user_lock_info.amount as u128)
            .checked_mul(self.project_lock.accumulated_reward_per_share as u128)
            .unwrap_or(0)
            .checked_div(COMPUTATION_DECIMALS as u128)
            .unwrap_or(0) as u64;
        
        self.user_lock_info.reward_debt = new_reward_debt;
        self.user_lock_info.accumulated_reward = self.user_lock_info.accumulated_reward
            .checked_add(new_reward_debt)
            .unwrap_or(self.user_lock_info.accumulated_reward);
            
        Ok(())
    }
} 