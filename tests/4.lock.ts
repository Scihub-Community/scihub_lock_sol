import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { ScihubLock } from "../target/types/scihub_lock";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";

describe("lock", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
  
    const program = anchor.workspace.scihubLock as Program<ScihubLock>;
    const wallet = provider.wallet as anchor.Wallet;
  
    // 测试账户
    let tokenMint: PublicKey = new PublicKey("7MhHeWwnducQh9r3KD8ruEfgYBBS3NijzEqqs1ybhhCj");
    let userTokenAccount: PublicKey = new PublicKey("2dZudLyNcVEYzQ4aWq4XpHF3DiFoBkggKSTKEC1spurY");
    let lockTokenAccount: [PublicKey, number];
    let projectLock: PublicKey;
    let userLockInfo: PublicKey;
    let userLock: PublicKey;

  // 初始化
 it("Lock tx", async () => {

    try {



         // 获取 PDA
                [projectLock] = PublicKey.findProgramAddressSync(
                  [Buffer.from("project_lock"),tokenMint.toBuffer()],
                  program.programId
                );
        
                lockTokenAccount = await PublicKey.findProgramAddressSync(
                  [
                    projectLock.toBuffer(),
                    TOKEN_PROGRAM_ID.toBuffer(),
                    tokenMint.toBuffer(),
                  ],
                  ASSOCIATED_TOKEN_PROGRAM_ID
                );
        
            
                // 判断token账户存在否，不存在则创建
                const tokenAccount = await getAccount(provider.connection, lockTokenAccount[0]);
         //获取当前时间戳
    const currentTime = Math.floor(Date.now() / 1000);


    // 获取 PDA
    // 锁仓
    const tx = await program.methods
      .lock(new anchor.BN(2000_000_000),new anchor.BN(currentTime + 1000))
      .accounts({ 
    
        user: wallet.publicKey,
        tokenMint: tokenMint,
        userTokenAccount: userTokenAccount,
        lockTokenAccount: tokenAccount.address,
      }).preInstructions([
        anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 })
      ])
      .rpc();
    
    console.log("lock :", tx);
      } catch (err) {
        console.error("❌ Lock failed:", err);
      }
  });

  //等待5s
    it("Wait for 10 seconds", async () => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log("Waited for 10 seconds");
    });

    //打印 userLockInfo 账户内容
    it("Get UserLockInfo", async () => {

        [projectLock] = PublicKey.findProgramAddressSync(
            [Buffer.from("project_lock"), tokenMint.toBuffer()],
            program.programId
        );


        // 获取 PDA
        [userLockInfo] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_lock_info"),wallet.publicKey.toBuffer(),projectLock.toBuffer()],
            program.programId
        );
    
        // 获取并打印 userLockInfo 账户内容
        const userLockInfoAccount = await program.account.userLockInfo.fetch(userLockInfo);
        console.log("UserLockInfo Account Details:");
        console.log("Owner:", userLockInfoAccount.user.toString());
        console.log("Token Mint:", userLockInfoAccount.tokenMint.toString());
        console.log("Index:", userLockInfoAccount.index.toString());
        console.log("Amount:", userLockInfoAccount.amount.toString());

    });

    //打印 userLock 账户内容
    it("Get UserLock", async () => {

        [userLockInfo] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_lock_info"),wallet.publicKey.toBuffer(),projectLock.toBuffer()],
            program.programId
        );
        const userLockInfoAccount = await program.account.userLockInfo.fetch(userLockInfo);
       
        const index = new anchor.BN(userLockInfoAccount.index); // 通常是字符串
        const prevIndex = index.subn(1);
        // 获取 PDA
        [userLock] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_lock"),wallet.publicKey.toBuffer(),tokenMint.toBuffer(),
              prevIndex.toArrayLike(Buffer, "le", 8)
            ],
            program.programId
        );
    
        // 获取并打印 userLock 账户内容
        const userLockAccount = await program.account.userLock.fetch(userLock);
        console.log("UserLock Account Details:");
        console.log("Index:", userLockAccount.index.toString());
        console.log("User:", userLockAccount.user.toString());
        console.log("Token Mint:", userLockAccount.tokenMint.toString());
        console.log("Amount:", userLockAccount.amount.toString());
        console.log("Start Time:", userLockAccount.startTime.toString());
        console.log("End Time:", userLockAccount.endTime.toString());
    });


});
