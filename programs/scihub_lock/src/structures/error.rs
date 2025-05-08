use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    
    // #[msg("The PDA account does not match.")]
    // PdaAccountIsNotMatch,

    #[msg("Unauthorized.")]
    Unauthorized,

    #[msg("Invalid start time.")]
    InvalidStartTime,

    #[msg("Invalid end time.")]
    InvalidEndTime,

    #[msg("Invalid amount.")]
    InvalidAmount,

    #[msg("Project lock is not active.")]
    ProjectLockNotActive,

    #[msg("Project lock has ended.")]
    ProjectLockEnded,

    #[msg("Insufficient balance.")]
    InsufficientBalance,

    #[msg("Token mint mismatch.")]
    TokenMintMismatch,

    #[msg("Overflow occurred.")]
    Overflow,

    #[msg("Lock period not ended.")]
    LockPeriodNotEnded,

    #[msg("No tokens to unlock.")]
    NoTokensToUnlock,

    #[msg("Lock account not found.")]
    LockAccountNotFound,

    #[msg("Unlock account not found.")]
    UnlockAccountNotFound,

}

