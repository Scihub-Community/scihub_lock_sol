pub mod structures;
pub mod constants;

use constants::*;


use anchor_lang::prelude::*;


use structures::{
    init_scihub_lock::*,
    init_project_lock::*,
    init_user_lock_info::*,
    set_project_lock::*,
    lock::*,
    unlock::*,
    donation::*,
    claim_reward::*,
    ProjectLock,
    UserLockInfo,
    
};
declare_id!("J82RZvfqaQ2uuk8wu1ziiwDtjyxkArmSvMXSfT6LSM7x");


// pub fn update_reward(current_timestamp: u64, project_lock: &mut ProjectLock) {
   
//         // 如果没有份额，跳过此池
//         if project_lock.total_amount == 0 {
//             continue;
//         }

//         // 更新 `accumulated_reward_per_share`
//         if project_lock.total_shares > 0 {
//             // 每份奖励计算
//             let reward_per_share = (income as u128)
//                 .checked_mul(COMPUTATION_DECIMALS as u128) // 精度调整
//                 .unwrap_or(0)
//                 .checked_div(pool.total_shares as u128) // 每份奖励
//                 .unwrap_or(0) as u64;

//             // 累加每份奖励的累计值
//             pool.accumulated_reward_per_share = pool
//                 .accumulated_reward_per_share
//                 .checked_add(reward_per_share)
//                 .unwrap_or(pool.accumulated_reward_per_share); // 防止溢出
//         }

//         // 更新最后奖励时间戳为当前时间戳
//         pool.last_reward_timestamp = current_timestamp;
// }





#[program]
pub mod scihub_lock {
    use super::*;

    pub fn init_scihub_lock(ctx: Context<InitScihubLock>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn init_project_lock(
        ctx: Context<InitProjectLock>,
    ) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn init_user_lock_info(
        ctx: Context<InitUserLockInfo>,
    ) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn set_project_lock(
        ctx: Context<SetProjectLock>,
        is_active: bool,
    ) -> Result<()> {
        ctx.accounts.process(is_active)
    }

    pub fn lock(
        ctx: Context<Lock>,
        amount: u64,
        end_time: i64,
    ) -> Result<()> {
        ctx.accounts.process(amount,end_time)
    }

    pub fn unlock(
        ctx: Context<Unlock>,
        prev_index: u64
    ) -> Result<()> {
        let bump = ctx.bumps.project_lock;
        ctx.accounts.process(bump,prev_index)
    }
    
    pub fn donation(
        ctx: Context<Donation>,
        amount: u64
    ) -> Result<()> {
        ctx.accounts.process(amount)
    }
    
    pub fn claim_reward(
        ctx: Context<ClaimReward>,
    ) -> Result<()> {
        let bump = ctx.bumps.project_lock;
        ctx.accounts.process(bump)
    }
}

