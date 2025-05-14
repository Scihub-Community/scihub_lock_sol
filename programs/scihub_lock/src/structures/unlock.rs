use super::UserLock;
use super::ProjectLock;

use super::UserLockInfo;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint,};
use anchor_spl::associated_token::AssociatedToken;
use super::error::ErrorCode;

use crate::COMPUTATION_DECIMALS;

#[derive(Accounts)]
#[instruction(prev_index: u64)]
pub struct Unlock<'info> {
    #[account(
        mut,
        seeds = [crate::USER_LOCK, user.key().as_ref(), token_mint.key().as_ref(), prev_index.to_le_bytes().as_ref()],
        bump,
        
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
        seeds = [crate::PROJECT_LOCK, token_mint.key().as_ref()],
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
    pub fn process(&mut self,bump_seed: u8,prev_index: u64) -> Result<()> {



        let user_lock = &self.user_lock;
        require!(user_lock.user == self.user.key(), ErrorCode::Unauthorized);
        require!(user_lock.token_mint == self.token_mint.key(), ErrorCode::TokenMintMismatch);
        require!(Clock::get()?.unix_timestamp >= user_lock.end_time, ErrorCode::LockPeriodNotEnded);

       
        let user_lock_info = &self.user_lock_info;
    
        // 获取锁仓数量
        let amount = user_lock.amount;
        require!(amount > 0, ErrorCode::NoTokensToUnlock);

        //判断到期时间
        // if Clock::get()?.unix_timestamp < self.user_lock.end_time {
        //     return Err(ErrorCode::LockPeriodNotEnded.into());
        // }

        // 打印解锁前的信息
        msg!("Before unlock - User lock info: {:?}", self.user_lock);
        msg!("Before unlock - User lock info: {:?}", self.user_lock_info);
        msg!("Before unlock - Project lock info: {:?}", self.project_lock);

        // 更新用户锁仓信息
        self.user_lock_info.amount = self.user_lock_info.amount.checked_sub(amount)
            .ok_or(ErrorCode::Overflow)?;

        // 更新项目锁仓总量
        self.project_lock.total_amount = self.project_lock.total_amount.checked_sub(amount)
            .ok_or(ErrorCode::Overflow)?;


            // 存储用户的待领取奖励
        store_pending_reward(&mut self.project_lock,&mut self.user_lock_info)?;

       
        // 生成 PDA 签名种子
        let signer_seeds: &[&[&[u8]]] = &[&[
            crate::PROJECT_LOCK,
            self.project_lock.token_mint.as_ref(),
            &[bump_seed]
        ]];

        // 转移代币回用户账户
        let transfer_instruction = spl_token::instruction::transfer(
            &self.token_program.key(),
            &self.lock_token_account.key(),
            &self.user_token_account.key(),
            &self.project_lock.key(),
            &[],
            amount,
        )?;

        // 执行带签名的 CPI 调用
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_instruction,
            &[
                self.token_program.to_account_info(),
                self.lock_token_account.to_account_info(),
                self.user_token_account.to_account_info(),
                self.project_lock.to_account_info(),
            ],
            signer_seeds,
        )?;

        // 清零用户锁仓账户
        self.user_lock.amount = 0;

        // 打印解锁后的信息
        
        msg!("After unlock - User lock info: {:?}", self.user_lock);
        msg!("After unlock - User lock info: {:?}", self.user_lock_info);
        msg!("After unlock - Project lock info: {:?}", self.project_lock);
        msg!("User {} unlocked {} tokens", self.user.key(), amount);

        Ok(())
    }
}


pub fn store_pending_reward(
    project_lock: &mut ProjectLock,
    user_lock_info: &mut UserLockInfo,
) -> Result<()> {
    
    
    // 计算用户在该池子的待领取奖励
    let pending_reward = (user_lock_info.amount as u128)
        .checked_mul(project_lock.accumulated_reward_per_share as u128)
        .and_then(|v| v.checked_div(COMPUTATION_DECIMALS as u128))
        .and_then(|v| v.checked_sub(user_lock_info.reward_debt as u128))
        .unwrap_or(0) as u64; // 最终将结果转换回 u64 类型，如果需要
                              // 如果待领取奖励为 0，直接返回
    if pending_reward == 0 {
        return Ok(());
    }

    // 更新该质押池的累计奖励
    user_lock_info.accumulated_reward = user_lock_info
        .accumulated_reward
        .checked_add(pending_reward)
        .unwrap_or(user_lock_info.accumulated_reward); // 防止溢出

    // 更新用户的 reward_debt 为最新的池子状态
    user_lock_info.reward_debt = (user_lock_info.amount as u128)
        .checked_mul(project_lock.accumulated_reward_per_share as u128)
        .and_then(|v| v.checked_div(COMPUTATION_DECIMALS as u128))
        .unwrap_or(user_lock_info.reward_debt as u128) as u64;
    Ok(())
}