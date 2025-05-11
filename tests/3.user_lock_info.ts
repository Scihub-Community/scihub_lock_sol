// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { ScihubLock } from "../target/types/scihub_lock";
// import { PublicKey } from "@solana/web3.js";


// describe("user_lock_info", () => {
//   // Configure the client to use the local cluster.
//   const provider = anchor.AnchorProvider.env();
//     anchor.setProvider(provider);
  
//     const program = anchor.workspace.scihubLock as Program<ScihubLock>;
//     const wallet = provider.wallet as anchor.Wallet;
  
//     // 测试账户
//     let tokenMint: PublicKey = new PublicKey("7MhHeWwnducQh9r3KD8ruEfgYBBS3NijzEqqs1ybhhCj");
//     let userTokenAccount: PublicKey = new PublicKey("2dZudLyNcVEYzQ4aWq4XpHF3DiFoBkggKSTKEC1spurY");
//     let lockTokenAccount: PublicKey;
//     let scihubLock: PublicKey;
//     let projectLock: PublicKey;
//     let userLockInfo: PublicKey;
//     let userLock: PublicKey;

//   // 初始化
//  it("Initialize ProjectLock", async () => {
   

//     // 初始化 UserLockInfo
//     const tx = await program.methods
//       .initUserLockInfo()
//       .accounts({
//         tokenMint: tokenMint,
//       })
//       .rpc();

//     console.log("ProjectLock initialized:", tx);
//   });

//   //等待5s
//     it("Wait for 10 seconds", async () => {
//         await new Promise(resolve => setTimeout(resolve, 10000));
//         console.log("Waited for 10 seconds");
//     });

//     //打印 userLockInfo 账户内容
//     it("Get UserLockInfo", async () => {

//         [projectLock] = PublicKey.findProgramAddressSync(
//             [Buffer.from("project_lock"), tokenMint.toBuffer()],
//             program.programId
//         );


//         // 获取 PDA
//         [userLockInfo] = PublicKey.findProgramAddressSync(
//             [Buffer.from("user_lock_info"),wallet.publicKey.toBuffer(),projectLock.toBuffer()],
//             program.programId
//         );
    
//         // 获取并打印 userLockInfo 账户内容
//         const userLockInfoAccount = await program.account.userLockInfo.fetch(userLockInfo);
//         console.log("UserLockInfo Account Details:");
//         console.log("Owner:", userLockInfoAccount.user.toString());
//         console.log("Token Mint:", userLockInfoAccount.tokenMint.toString());
//         console.log("Index:", userLockInfoAccount.index.toString());
//         console.log("Amount:", userLockInfoAccount.amount.toString());

//     });



 



// });
