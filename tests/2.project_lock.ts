// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { ScihubLock } from "../target/types/scihub_lock";
// import { PublicKey,Transaction } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";

// import {
//   getAssociatedTokenAddress,
//   createAssociatedTokenAccountInstruction,
// } from "@solana/spl-token";
// import {  } from "@solana/web3.js";

// describe("project_lock", () => {
//   // Configure the client to use the local cluster.
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.scihubLock as Program<ScihubLock>;
//   const wallet = provider.wallet as anchor.Wallet;

//   // 测试账户
//   let tokenMint: PublicKey = new PublicKey("A22hchYQ2Eiwe7k57ALGmDwN4oJYzn11oadKiuALaNZs");
//   let userTokenAccount: PublicKey = new PublicKey("8k6aewzBH2Ps96uKp3FqB6o9cfcs8GU3uT3YPPVWEHsc");
//   let lockTokenAccount: [PublicKey, number];
//   let scihubLock: PublicKey;
//   let projectLock: PublicKey;
//   let userLockInfo: PublicKey;
//   let userLock: PublicKey;


//   // it("Initialize ProjectLock", async () => {
//   //   // 获取 PDA
//   //   // [projectLock] = PublicKey.findProgramAddressSync(
//   //   //   [Buffer.from("project_lock"), tokenMint.toBuffer()],
//   //   //   program.programId
//   //   // );

//   //   // 初始化 ProjectLock
//   //   const tx = await program.methods
//   //     .initProjectLock()
//   //     .accounts({
//   //       tokenMint: tokenMint,
//   //     })
//   //     .rpc();

//   //   console.log("ProjectLock initialized:", tx);
//   // });


//   //等待5s

//   it("Wait for 5 seconds", async () => {
//     await new Promise(resolve => setTimeout(resolve, 5000));
//     console.log("Waited for 5 seconds");
//   });

//   it("print project_lock", async () => {
//         // 获取 PDA
//         [projectLock] = PublicKey.findProgramAddressSync(
//           [Buffer.from("project_lock"),tokenMint.toBuffer()],
//           program.programId
//         );

//         lockTokenAccount = await PublicKey.findProgramAddressSync(
//           [
//             projectLock.toBuffer(),
//             TOKEN_PROGRAM_ID.toBuffer(),
//             tokenMint.toBuffer(),
//           ],
//           ASSOCIATED_TOKEN_PROGRAM_ID
//         );

//         try {
//         // 判断token账户存在否，不存在则创建
//         const tokenAccount = await getAccount(provider.connection, lockTokenAccount[0]);
//        console.log("Token Account exists!");
//         } catch (error) {
       
//           const ata = await getAssociatedTokenAddress(
//             tokenMint,        // Mint
//             projectLock,      // PDA 作为 Owner
//             true              // `true` 表示允许 PDA（off-curve）
//           );
//           const ix = createAssociatedTokenAccountInstruction(
//             wallet.publicKey, // Payer
//             ata,              // ATA 地址
//             projectLock,      // Owner（PDA）
//             tokenMint,
//             TOKEN_PROGRAM_ID,
//             ASSOCIATED_TOKEN_PROGRAM_ID
//           );
          
//           // 3. 发送交易
//           const tx = new Transaction().add(ix);
//           const sig = await provider.sendAndConfirm(tx, []);
//           console.log("✅ ATA for PDA created:", sig);
        
//         }

//         // 获取并打印 scihubLock 账户内容
//         const projectLockAccount = await program.account.projectLock.fetch(projectLock);
       
//         console.log("ProjectLock Account Details:");
//         console.log("Token Mint: ", projectLockAccount.tokenMint.toBase58());
//         console.log("Total Amount: ", projectLockAccount.totalAmount.toString());
//         console.log("Is Active: ", projectLockAccount.isActive);
//     });


// });
