use super::ScihubLock;
use anchor_lang::prelude::*;
// use anchor_spl::token::{Token, TokenAccount, Transfer, Mint, transfer};
// use anchor_spl::associated_token::AssociatedToken;
use std::str::FromStr;

#[derive(Accounts)]
pub struct InitScihubLock<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 1728,
        seeds = [crate::SCIHUB_LOCK],
        bump
    )]
    pub scihub_lock: Account<'info, ScihubLock>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitScihubLock<'info> {
    pub fn process(&mut self) -> Result<()> {
        let scihub_lock = &mut self.scihub_lock;
        
        // 设置所有者
        scihub_lock.owner = self.owner.key();
        // 初始化其他字段为默认值
        // mint:GxdTh6udNstGmLLk9ztBb6bkrms7oLbrJp5yzUaVpump
        scihub_lock.scihub_mint = Pubkey::from_str("GxdTh6udNstGmLLk9ztBb6bkrms7oLbrJp5yzUaVpump").unwrap();
        scihub_lock.project_name = String::from("DeSciHub");
        scihub_lock.project_description = String::from("DeSciHub is a decentralized Sci-Hub.");
        scihub_lock.project_website = String::from("https://www.scihub.fans/");
        scihub_lock.project_logo = String::from("https://x.com/SciHubFans/photo");
        scihub_lock.project_telegram = String::from("https://t.co/67N7cpQFen");
        scihub_lock.project_twitter = String::from("https://x.com/SciHubFans");
        // 记录初始化信息
        msg!("ScihubLock initialized by: {}", self.owner.key());
        msg!("ScihubMint: {}", scihub_lock.scihub_mint);
        msg!("Owner: {}", scihub_lock.owner);
        msg!("Project Name: {}", scihub_lock.project_name);
        msg!("Project Description: {}", scihub_lock.project_description);
        msg!("Project Website: {}", scihub_lock.project_website);
        msg!("Project Logo: {}", scihub_lock.project_logo);
        msg!("Project Telegram: {}", scihub_lock.project_telegram);
        msg!("Project Twitter: {}", scihub_lock.project_twitter);
        
        Ok(())
    }
}
