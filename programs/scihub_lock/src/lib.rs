pub mod structures;
pub mod constants;

use constants::*;


use anchor_lang::prelude::*;


use structures::{
    init_scihub_lock::*,
    init_project_lock::*,
    set_project_lock::*,
    lock::*,
    unlock::*,
    error::ErrorCode::*,
    
};
declare_id!("BpVoZPrNT5ez8jPmtHoAVpmQsybKABhNR2oEbQv5S2UP");

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
    ) -> Result<()> {
        ctx.accounts.process()
    }
}

