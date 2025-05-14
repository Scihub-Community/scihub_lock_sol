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
declare_id!("HqmtqTCGNjN7KvcMkKPEzVqLYwReXCSL2QhFvUsdse33");

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

