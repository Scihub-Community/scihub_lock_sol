// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { ScihubLock } from "../target/types/scihub_lock";
// import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";


// //初始化并打印
// describe("scihub_lock", () => {
//   // Configure the client to use the local cluster.
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.scihubLock as Program<ScihubLock>;
//   const wallet = provider.wallet as anchor.Wallet;

//   let scihubLock: PublicKey;

//   it("Initialize ScihubLock", async () => {
//     // 获取 PDA
//     // [scihubLock] = PublicKey.findProgramAddressSync(
//     //   [Buffer.from("scihub_lock")],
//     //   program.programId
//     // );

//     // 初始化 ScihubLock
//     const tx = await program.methods
//       .initScihubLock()
//       .accounts({
//         owner: wallet.publicKey,
//       })
//       .rpc();

//     console.log("ScihubLock initialized:", tx);
    
//   });


//   it("Initialize ScihubLock", async () => {
//     // 获取 PDA
//     [scihubLock] = PublicKey.findProgramAddressSync(
//       [Buffer.from("scihub_lock")],
//       program.programId
//     );

//     // 获取并打印 scihubLock 账户内容
//     const scihubLockAccount = await program.account.scihubLock.fetch(scihubLock);
//     console.log("ScihubLock Account Details:");
//     console.log("Owner:", scihubLockAccount.owner.toString());
//     console.log("Scihub Mint:", scihubLockAccount.scihubMint.toString());
//     console.log("Project Name:", scihubLockAccount.projectName);
//     console.log("Project Description:", scihubLockAccount.projectDescription);
//     console.log("Project Website:", scihubLockAccount.projectWebsite);
//     console.log("Project Logo:", scihubLockAccount.projectLogo);
//     console.log("Project Telegram:", scihubLockAccount.projectTelegram);
//     console.log("Project Twitter:", scihubLockAccount.projectTwitter);
//   });


// });
