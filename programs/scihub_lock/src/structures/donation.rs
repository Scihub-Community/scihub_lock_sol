use super::UserLock;
use super::ProjectLock;
use super::UserDonation;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, transfer, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use super::ErrorCode;
use crate::COMPUTATION_DECIMALS;


#[derive(Accounts)]
pub struct Donation<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space =  8+core::mem::size_of::<UserDonation>(),
        seeds = [crate::USER_DONATION, user.key().as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub user_donation: Account<'info, UserDonation>,
    
    #[account(
        mut,
        seeds = [crate::PROJECT_LOCK, token_mint.key().as_ref()],
        bump,

        constraint = project_lock.is_active @ ErrorCode::ProjectLockNotActive,
        constraint = project_lock.reward_token_mint == token_mint.key() @ ErrorCode::TokenMintMismatch
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

impl<'info> Donation<'info> {
    pub fn process(&mut self, amount: u64) -> Result<()> {
        // 验证捐赠数量
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(amount <= self.user_token_account.amount, ErrorCode::InsufficientBalance);
 
        // 获取当前时间
        let current_timestamp = Clock::get()?.unix_timestamp;

        // 更新用户捐赠账户信息

        let user_donation = &mut self.user_donation;
        user_donation.user = self.user.key();
        //amount 之前捐赠过是否得累加
        let user_donation_amount = user_donation.amount;
        user_donation.amount = user_donation_amount.checked_add(amount).unwrap();
        user_donation.token_mint = self.token_mint.key();
        user_donation.timestamp = current_timestamp;

        // 更新 `accumulated_reward_per_share`
        if self.project_lock.total_amount  > 0 {
            // 每份奖励计算
            let reward_per_share = (amount as u128)
                .checked_mul(COMPUTATION_DECIMALS as u128) // 精度调整
                .unwrap_or(0)
                .checked_div(self.project_lock.total_amount as u128) // 每份奖励
                .unwrap_or(0) as u64;

            // 累加每份奖励的累计值
            self.project_lock.accumulated_reward_per_share = self.project_lock
                .accumulated_reward_per_share
                .checked_add(reward_per_share)
                .unwrap_or(self.project_lock.accumulated_reward_per_share); // 防止溢出
        }

        // 更新最后奖励时间戳为当前时间戳
        self.project_lock.last_reward_timestamp = current_timestamp as u64;



        // 打印捐赠信息
        msg!("Donation info: {:?}", user_donation);

        // 转移代币到锁仓账户
        transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.user_token_account.to_account_info(),
                    to: self.lock_token_account.to_account_info(),
                    authority: self.user.to_account_info(),
                },
            ),
            amount,
        )?;

        msg!("User {} donated {} tokens", self.user.key(), amount);

        Ok(())
    }
   
}
