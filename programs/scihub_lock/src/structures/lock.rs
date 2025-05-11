use super::UserLock;
use super::ProjectLock;
use super::UserLockInfo;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, transfer, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use super::ErrorCode;

#[derive(Accounts)]
pub struct Lock<'info> {
    #[account(
        init,
        payer = user,
        space =  8+core::mem::size_of::<UserLock>(),
        seeds = [crate::USER_LOCK, user.key().as_ref(), token_mint.key().as_ref(), user_lock_info.index.to_le_bytes().as_ref()],
        bump
    )]
    
    pub user_lock: Account<'info, UserLock>,

    #[account(
        mut,
        seeds = [crate::USER_LOCK_INFO, user.key().as_ref(), project_lock.key().as_ref()],
        bump,
    )]
    pub user_lock_info: Account<'info, UserLockInfo>,

    
    #[account(
        mut,
        seeds = [crate::PROJECT_LOCK, token_mint.key().as_ref()],
        bump,
        
        constraint = project_lock.is_active @ ErrorCode::ProjectLockNotActive,
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

impl<'info> Lock<'info> {
    pub fn process(&mut self, amount: u64,end_time: i64) -> Result<()> {
        // 验证锁仓数量
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(amount <= self.user_token_account.amount, ErrorCode::InsufficientBalance);
 
        // // 获取当前时间
        let current_time = Clock::get()?.unix_timestamp;

        // // 初始化用户锁仓账户
        let user_lock = &mut self.user_lock;
        user_lock.index = self.user_lock_info.index; 
        user_lock.user = self.user.key();
        user_lock.token_mint = self.token_mint.key();
        user_lock.amount = amount;
        user_lock.start_time = current_time;
        user_lock.end_time = end_time;

        // 打印用户锁仓信息
        msg!("User lock: {:?}", user_lock);

        //打印用户锁仓信息,user_lock_infocannot be formatted using `{:?}
        msg!("Before User lock info: {:?}", self.user_lock_info);

        // 更新用户锁仓信息
        self.user_lock_info.amount = self.user_lock_info.amount.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        // 更新用户锁仓索引
        self.user_lock_info.index = self.user_lock_info.index.checked_add(1).ok_or(ErrorCode::Overflow)?;

        // 打印用户锁仓信息
        msg!("After User lock info: {:?}", self.user_lock_info);

        // 更新项目锁仓总量
        msg!("Before Project lock info: {:?}", self.project_lock);

        self.project_lock.total_amount = self.project_lock.total_amount.checked_add(amount).ok_or(ErrorCode::Overflow)?;
        // 打印项目锁仓信息
        msg!("After Project lock info: {:?}", self.project_lock);

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

        Ok(())
    }
   
}
