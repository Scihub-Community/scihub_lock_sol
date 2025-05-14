// import * as anchor from "@coral-xyz/anchor";
// import { Program, BN } from "@coral-xyz/anchor";
// import { ScihubLock } from "../target/types/scihub_lock";
// import { PublicKey } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, getAccount } from "@solana/spl-token";

// describe("claim_reward", () => {
//   // Configure the client to use the local cluster.
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);
  
//   const program = anchor.workspace.scihubLock as Program<ScihubLock>;
//   const wallet = provider.wallet as anchor.Wallet;
  
//   // 测试账户
//   let tokenMint: PublicKey = new PublicKey("A22hchYQ2Eiwe7k57ALGmDwN4oJYzn11oadKiuALaNZs");
//   // 假设奖励代币和锁仓代币是同一个
//   let rewardTokenMint: PublicKey = tokenMint; 
//   let userTokenAccount: PublicKey = new PublicKey("8k6aewzBH2Ps96uKp3FqB6o9cfcs8GU3uT3YPPVWEHsc");
//   let userRewardTokenAccount: PublicKey;
//   let projectRewardTokenAccount: PublicKey;
//   let projectLock: PublicKey;
//   let userLockInfo: PublicKey;

//   // 获取账户地址
//   it("Get PDAs and token accounts", async () => {
//     try {
//       // 获取 PDA
//       [projectLock] = PublicKey.findProgramAddressSync(
//         [Buffer.from("project_lock"), tokenMint.toBuffer()],
//         program.programId
//       );
      
//       // 获取用户锁仓信息PDA
//       [userLockInfo] = PublicKey.findProgramAddressSync(
//         [Buffer.from("user_lock_info"), wallet.publicKey.toBuffer(), projectLock.toBuffer()],
//         program.programId
//       );
      
//       // 获取用户的奖励代币账户
//       const userRewardTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
//         provider.connection,
//         wallet as unknown as anchor.web3.Signer,
//         rewardTokenMint,
//         wallet.publicKey
//       );
//       userRewardTokenAccount = userRewardTokenAccountInfo.address;
      
//       // 获取项目的奖励代币账户
//       const seeds = [projectLock.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), rewardTokenMint.toBuffer()];
//       const [projectRewardTokenAccountPDA, _] = PublicKey.findProgramAddressSync(
//         seeds,
//         ASSOCIATED_TOKEN_PROGRAM_ID
//       );
//       projectRewardTokenAccount = projectRewardTokenAccountPDA;
      
//       console.log("PDAs and accounts initialized:");
//       console.log("Project Lock:", projectLock.toBase58());
//       console.log("User Lock Info:", userLockInfo.toBase58());
//       console.log("User Reward Token Account:", userRewardTokenAccount.toBase58());
//       console.log("Project Reward Token Account:", projectRewardTokenAccount.toBase58());
//     } catch (err) {
//       console.error("❌ Setup failed:", err);
//     }
//   });

//   // 领取奖励
//   it("Claim reward", async () => {
//     try {
//       // 调用领取奖励指令
//       const tx = await program.methods
//         .claimReward()
//         .accounts({
//           tokenMint: tokenMint,
//           rewardTokenMint: rewardTokenMint,
//           userRewardTokenAccount: userRewardTokenAccount,
//           projectRewardTokenAccount: projectRewardTokenAccount,
//         })
//         .preInstructions([
//           anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 })
//         ])
//         .rpc();
      
//       console.log("Claim reward transaction:", tx);
//     } catch (err) {
//       console.error("❌ Claim reward failed:", err);
//       // 如果有详细日志就打印出来
//       if (err.logs) {
//         console.error("Error logs:", err.logs);
//       }
//     }
//   });

//   // 等待5秒
//   it("Wait for 5 seconds", async () => {
//     await new Promise(resolve => setTimeout(resolve, 5000));
//     console.log("Waited for 5 seconds");
//   });

//   // 查询用户锁仓信息账户，查看已领取的奖励
//   it("Get UserLockInfo after claim", async () => {
//     try {
//       const userLockInfoAccount = await program.account.userLockInfo.fetch(userLockInfo);
//       console.log("UserLockInfo Account Details after claim:");
//       console.log("User:", userLockInfoAccount.user.toBase58());
//       console.log("Token Mint:", userLockInfoAccount.tokenMint.toBase58());
//       console.log("Amount:", userLockInfoAccount.amount.toString());
//       console.log("Reward Debt:", userLockInfoAccount.rewardDebt.toString());
//       console.log("Accumulated Reward:", userLockInfoAccount.accumulatedReward.toString());
//       console.log("Received Reward:", userLockInfoAccount.receivedReward.toString());
//     } catch (err) {
//       console.error("❌ Failed to fetch UserLockInfo after claim:", err);
//     }
//   });

 
// });
