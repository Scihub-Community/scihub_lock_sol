

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub authority: Signer<'info>, //签名用户
    #[account(mut)]
    pub staking_instance: Account<'info, StakingInstance>, //程序状态账户
    #[account(mut)]
    pub user_instance: Box<Account<'info, User>>, // 用户状态账户
    #[account(mut)]
    pub super_instance: Box<Account<'info, User>>, //上级状态账户
    #[account(mut)]
    pub user_super_gdtc_token_account: Box<Account<'info, TokenAccount>>, //上级的gdtc token账户
    #[account(mut)]
    pub user_gdtc_token_account: Account<'info, TokenAccount>, // 用户gdtc token账户
    #[account(mut)]
    pub gdtc_reward_out_account: Account<'info, TokenAccount>, //合约转出gdtc 的token账户
    
    /// CHECK: `pda_account` is a derived account from the program, and we ensure it's valid at runtime
    #[account(
        mut,
        seeds = [crate::LPTOKEN_SEED.as_ref()], 
        bump,
    )]
    pub pda_account: AccountInfo<'info>, //合约pda账户
    pub system_program: Program<'info, System>, //系统账户 programid
    pub token_program: Program<'info, Token>,   //token账户 可从sdk里导入
}



pub fn claim_rewards(ctx: Context<ClaimRewards>, staked_info_index: u64) -> Result<()> {
    // 获取账户实例
    let staking_instance = &mut ctx.accounts.staking_instance;
    let user_instance = &mut ctx.accounts.user_instance;
    let super_instance = &ctx.accounts.super_instance;

    // let user_gdtc_token_account = &mut ctx.accounts.user_gdtc_token_account;
    let gdtc_reward_out_account = &ctx.accounts.gdtc_reward_out_account;
    let user_super_gdtc_token_account = &mut ctx.accounts.user_super_gdtc_token_account;

    let program_id = ctx.program_id; // 获取当前合约的程序ID
                                     // 计算 staking_instance 的派生地址
    let (expected_staking_address, bump_seed) =
        Pubkey::find_program_address(&[crate::STAKING_SEED.as_ref()], program_id);

    // 确保 staking_instance 是由合约程序派生的
    if staking_instance.key() != expected_staking_address {
        return Err(ErrorCode::InvalidStakingInstance.into());
    }

    let (expected_pda_address, bump_seed) =
        Pubkey::find_program_address(&[crate::LPTOKEN_SEED.as_ref()], program_id);

    if expected_pda_address != gdtc_reward_out_account.owner.key() {
        return Err(ErrorCode::PdaAccountIsNotMatch.into());
    }

    //用户账户验证
    let (expected_user_address, bump_seed) = Pubkey::find_program_address(
        &[
            crate::USER_SEED.as_ref(),
            staking_instance.key().as_ref(),
            user_instance.user_address.key().as_ref(),
        ],
        program_id,
    );
    msg!(
        "expected_user_address is: {},user_instance: {}",
        expected_user_address.key(),
        user_instance.key()
    );
    // 确保 staking_instance 是由合约程序派生的
    if user_instance.key() != expected_user_address {
        return Err(ErrorCode::InvalidUserInstance.into());
    }

    //用户上级账户验证
    let (expected_user_superior_address, bump_seed) = Pubkey::find_program_address(
        &[
            crate::USER_SEED.as_ref(),
            staking_instance.key().as_ref(),
            user_super_gdtc_token_account.owner.key().as_ref(),
        ],
        program_id,
    );
    msg!(
        "expected_user_superior_address is: {},user_instance: {}",
        expected_user_superior_address.key(),
        super_instance.key()
    );
    // 确保 staking_instance 是由合约程序派生的
    if super_instance.key() != expected_user_superior_address {
        return Err(ErrorCode::InvalidUserInstance.into());
    }

    if staking_instance.reward_token_mint != gdtc_reward_out_account.mint {
        return Err(ErrorCode::MintAccountIsNotMatch.into());
    }

    // 获取当前时间戳
    let clock = Clock::get().map_err(|_| ErrorCode::ClockUnavailable)?;
    let current_timestamp = clock.unix_timestamp as u64;
    let index = staked_info_index as usize;
    if user_instance.user_address != ctx.accounts.user_gdtc_token_account.owner.key() {
        return Err(ErrorCode::UserAccountIsNotMatch.into());
    }
    if super_instance.user_address != user_super_gdtc_token_account.owner.key() {
        return Err(ErrorCode::UserAccountIsNotMatch.into());
    }

    // 检查用户是否有质押
    if !user_instance.staked_info[index].is_staked {
        msg!(
            "index: {},staked:{}",
            staked_info_index,
            user_instance.staked_info[index].is_staked
        );
        return Err(ErrorCode::NoStakingToClaimRewards.into());
        // return Ok(());
    }
    msg!(
        "index{},staked:{}",
        index,
        user_instance.staked_info[index].is_staked
    );
    if user_instance.user_superior_token_account != user_super_gdtc_token_account.key() {
        return Err(ErrorCode::MintAccountIsNotMatch.into());
    }

    // 更新奖励池并计算用户的奖励
    update_reward_pool(current_timestamp, staking_instance);

    store_pending_reward(staking_instance, user_instance, staked_info_index)?;

    // 更新用户的奖励债务
    // update_reward_debt(staking_instance, user_instance, staked_info_index);

    // 计算用户的奖励
    let mut accumulated_reward = user_instance.staked_info[index].accumulated_reward;
    if accumulated_reward == 0 {
        return Err(ErrorCode::NoRewardsToClaim.into());
    }

    // 检查奖励账户余额是否足够
    if gdtc_reward_out_account.amount < accumulated_reward {
        if current_timestamp >= user_instance.staked_info[index].stake_end_time
            && user_instance.user_address == ctx.accounts.authority.key()
        {
            if user_instance.staked_info[index].can_cancel_stake != true {
                user_instance.staked_info[index].can_cancel_stake = true;
                user_instance.total_deposited_amount = user_instance
                    .total_deposited_amount
                    .checked_sub(user_instance.staked_info[index].deposited_amount)
                    .ok_or(ErrorCode::Overflow)?;
            }
        }
        return Ok(());
    }

    let bump_seed = ctx.bumps.pda_account;
    let signer_seeds: &[&[&[u8]]] = &[&[crate::LPTOKEN_SEED.as_ref(), &[bump_seed]]];

    if super_instance.total_deposited_amount > 2000000000 {
        let transfer_instruction = spl_token::instruction::transfer(
            &ctx.accounts.token_program.key(),
            &ctx.accounts.gdtc_reward_out_account.key(),
            &ctx.accounts.user_super_gdtc_token_account.key(),
            &ctx.accounts.pda_account.key(),
            &[],
            accumulated_reward / 10,
        )?;

        // 执行带签名的 CPI 调用
        invoke_signed(
            &transfer_instruction,
            &[
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.gdtc_reward_out_account.to_account_info(),
                ctx.accounts.user_super_gdtc_token_account.to_account_info(),
                ctx.accounts.pda_account.to_account_info(),
            ],
            signer_seeds,
        )?;
        //取消上级百分之十从挖矿者奖励中拿出
        // accumulated_reward = accumulated_reward - (accumulated_reward / 10);
    }

    // 生成从 GDTC 托管账户到用户 LP Token 账户的转账指令
    let transfer_instruction = spl_token::instruction::transfer(
        &ctx.accounts.token_program.key(),
        &ctx.accounts.gdtc_reward_out_account.key(),
        &ctx.accounts.user_gdtc_token_account.key(),
        &ctx.accounts.pda_account.key(),
        &[],
        accumulated_reward,
    )?;

    // 执行带签名的 CPI 调用
    invoke_signed(
        &transfer_instruction,
        &[
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.gdtc_reward_out_account.to_account_info(),
            ctx.accounts.user_gdtc_token_account.to_account_info(),
            ctx.accounts.pda_account.to_account_info(),
        ],
        signer_seeds,
    )?;

    if current_timestamp >= user_instance.staked_info[index].stake_end_time {
        if user_instance.staked_info[index].can_cancel_stake == true {
            msg!(
                "can_cancel_stake,{},index : {}",
                user_instance.staked_info[index].can_cancel_stake,
                index
            );
            return Err(ErrorCode::NoRewardsToClaim.into());
        }
        user_instance.staked_info[index].can_cancel_stake = true;
        user_instance.total_deposited_amount = user_instance
            .total_deposited_amount
            .checked_sub(user_instance.staked_info[index].deposited_amount)
            .ok_or(ErrorCode::Overflow)?;
    }

    // 重置用户累计奖励
    user_instance.staked_info[index].accumulated_reward = 0;

    user_instance.staked_info[index].receivedReward = user_instance.staked_info[index]
        .receivedReward
        .checked_add(accumulated_reward)
        .ok_or(ErrorCode::Overflow)?;
    Ok(())
}

