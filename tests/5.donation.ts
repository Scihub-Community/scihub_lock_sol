// import * as anchor from "@coral-xyz/anchor";
// import { Program, BN } from "@coral-xyz/anchor";
// import { ScihubLock } from "../target/types/scihub_lock";
// import { PublicKey } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";

// describe("lock", () => {
//   // Configure the client to use the local cluster.
//   const provider = anchor.AnchorProvider.env();
//     anchor.setProvider(provider);
  
//     const program = anchor.workspace.scihubLock as Program<ScihubLock>;
//     const wallet = provider.wallet as anchor.Wallet;
  
//     // 测试账户
//     let tokenMint: PublicKey = new PublicKey("A22hchYQ2Eiwe7k57ALGmDwN4oJYzn11oadKiuALaNZs");
//     let userTokenAccount: PublicKey = new PublicKey("8k6aewzBH2Ps96uKp3FqB6o9cfcs8GU3uT3YPPVWEHsc");
//     let lockTokenAccount: [PublicKey, number];
//     let projectLock: PublicKey;
//     let userLockInfo: PublicKey;
//     let userLock: PublicKey;

//   // 初始化
//  it("Lock tx", async () => {

//     try {

//          // 获取 PDA
//                 [projectLock] = PublicKey.findProgramAddressSync(
//                   [Buffer.from("project_lock"),tokenMint.toBuffer()],
//                   program.programId
//                 );
        
//                 lockTokenAccount = await PublicKey.findProgramAddressSync(
//                   [
//                     projectLock.toBuffer(),
//                     TOKEN_PROGRAM_ID.toBuffer(),
//                     tokenMint.toBuffer(),
//                   ],
//                   ASSOCIATED_TOKEN_PROGRAM_ID
//                 );
        
            
//                 // 判断token账户存在否，不存在则创建
//                 const tokenAccount = await getAccount(provider.connection, lockTokenAccount[0]);


//     // 获取 PDA
//     // 锁仓
//     const tx = await program.methods.donation(
//       new anchor.BN(3000_000_000),
//     ).accounts({
//       user: wallet.publicKey,
//       tokenMint: tokenMint,
//       userTokenAccount: userTokenAccount,
//       lockTokenAccount: tokenAccount.address,
//     }).rpc();
    
//     console.log("donation :", tx);
//       } catch (err) {
//         console.error("❌ Lock failed:", err.logs);
//       }
//   });

//   //等待5s
//     it("Wait for 5 seconds", async () => {
//         await new Promise(resolve => setTimeout(resolve, 5000));
//         console.log("Waited for 5 seconds");
//     });

//     //打印 project_lock 账户内容

//     it("Get ProjectLock", async () => {
//         // 获取 PDA
//         [projectLock] = PublicKey.findProgramAddressSync(
//           [Buffer.from("project_lock"),tokenMint.toBuffer()],
//           program.programId
//         );
  
//         const projectLockAccount = await program.account.projectLock.fetch(projectLock);
       
//         console.log("ProjectLock Account Details:");
//         console.log("Token Mint: ", projectLockAccount.tokenMint.toBase58());
//         console.log("Reward Token Mint: ", projectLockAccount.rewardTokenMint.toBase58());
//         console.log("Total Amount: ", projectLockAccount.totalAmount.toString());
//         console.log("Is Active: ", projectLockAccount.isActive);
//         console.log("Accumulated Reward Per Share: ", projectLockAccount.accumulatedRewardPerShare.toString());
//         console.log("Last Reward Timestamp: ", projectLockAccount.lastRewardTimestamp.toString());
//         console.log("Reward Token Per Sec: ", projectLockAccount.rewardTokenPerSec.toString());
//     });
  
      
  




 



// });
