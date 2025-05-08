use anchor_lang::prelude::*;

pub mod error;
pub mod init_scihub_lock;
pub mod init_project_lock;
pub mod set_project_lock;
pub mod lock;
pub mod unlock;

//合约全局结构
#[account]
#[derive(Debug)]
pub struct ScihubLock {
    pub owner: Pubkey, 
    pub scihub_mint: Pubkey, 
    pub project_name: String,
    pub project_description: String,
    pub project_website: String,
    pub project_logo: String,
    pub project_telegram: String,
    pub project_twitter: String, 
}

//
#[account]
#[derive(Debug)]
pub struct ProjectLock {
    pub token_mint: Pubkey, 
    pub total_amount: u64, // 锁仓总量
    pub is_active: bool, // 是否活跃
}

#[account]
#[derive(Debug)]
pub struct UserLockInfo {
    pub user: Pubkey, // 用户地址
    pub token_mint: Pubkey, // 代币地址
    pub index: u64, // 锁仓索引
    pub amount: u64, // 锁仓数量
}

//用户锁仓
#[account]
#[derive(Debug)]
pub struct UserLock {
    pub index: u64, // 锁仓索引
    pub user: Pubkey, // 用户地址
    pub token_mint: Pubkey, // 代币地址
    pub amount: u64, // 锁仓数量
    pub start_time: i64, // 开始时间
    pub end_time: i64, // 结束时间
}








