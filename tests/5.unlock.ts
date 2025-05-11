// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { ScihubLock } from "../target/types/scihub_lock";
// import { PublicKey } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";

// describe("unlock", () => {
//   // Configure the client to use the local cluster.
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.scihubLock as Program<ScihubLock>;
//   const wallet = provider.wallet as anchor.Wallet;

//   // 测试账户
//   let tokenMint: PublicKey = new PublicKey("7MhHeWwnducQh9r3KD8ruEfgYBBS3NijzEqqs1ybhhCj");
//   let userTokenAccount: PublicKey = new PublicKey("2dZudLyNcVEYzQ4aWq4XpHF3DiFoBkggKSTKEC1spurY");
//   let lockTokenAccount: [PublicKey, number];
//   let projectLock: PublicKey;
//   let userLockInfo: PublicKey;
//   let userLock: PublicKey;

//   const index = new anchor.BN(0);
//   // 解锁
//   it("Unlock tx", async () => {
//     try {
//       // 获取 PDA
//       [projectLock] = PublicKey.findProgramAddressSync(
//         [Buffer.from("project_lock"), tokenMint.toBuffer()],
//         program.programId
//       );

//       lockTokenAccount = await PublicKey.findProgramAddressSync(
//         [
//           projectLock.toBuffer(),
//           TOKEN_PROGRAM_ID.toBuffer(),
//           tokenMint.toBuffer(),
//         ],
//         ASSOCIATED_TOKEN_PROGRAM_ID
//       );
//       // 获取 token 账户信息
//       const tokenAccount = await getAccount(provider.connection, lockTokenAccount[0]);

//       // 解锁
//       const tx = await program.methods
//         .unlock(index)
//         .accounts({
//           tokenMint,
//           userTokenAccount,
//           lockTokenAccount: tokenAccount.address,
//           user: wallet.publicKey,
//         })
//         .preInstructions([
//           anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 })
//         ])
//         .rpc();

//       console.log("unlock tx:", tx);
//     } catch (err) {
//       console.error("❌ Unlock failed:", err);
//     }
//   });

//   // 等待5s
//   it("Wait for 10 seconds", async () => {
//     await new Promise(resolve => setTimeout(resolve, 10000));
//     console.log("Waited for 10 seconds");
//   });

//   // 打印 userLockInfo 账户内容
//   it("Get UserLockInfo", async () => {
//     [projectLock] = PublicKey.findProgramAddressSync(
//       [Buffer.from("project_lock"), tokenMint.toBuffer()],
//       program.programId
//     );

//     // 获取 PDA
//     [userLockInfo] = PublicKey.findProgramAddressSync(
//       [Buffer.from("user_lock_info"), wallet.publicKey.toBuffer(), projectLock.toBuffer()],
//       program.programId
//     );

//     // 获取并打印 userLockInfo 账户内容
//     const userLockInfoAccount = await program.account.userLockInfo.fetch(userLockInfo);
//     console.log("UserLockInfo Account Details:");
//     console.log("Owner:", userLockInfoAccount.user.toString());
//     console.log("Token Mint:", userLockInfoAccount.tokenMint.toString());
//     console.log("Index:", userLockInfoAccount.index.toString());
//     console.log("Amount:", userLockInfoAccount.amount.toString());
//   });

// }); 