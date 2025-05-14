import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { ScihubLock } from "../target/types/scihub_lock";



describe("stake with second user", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.scihubLock as Program<ScihubLock>;

  const secondUser = Keypair.generate(); // 你也可以从 secretKey 导入

  const mint = new PublicKey("A22hchYQ2Eiwe7k57ALGmDwN4oJYzn11oadKiuALaNZs");

  it("Stake with second user", async () => {
    // 1. 给第二账户空投 SOL（本地网络或 testnet）
    const txSig = await provider.connection.requestAirdrop(secondUser.publicKey, 1_000_000_000);
    await provider.connection.confirmTransaction(txSig);

    // 2. 获取第二账户的 token ATA（确保提前创建并有余额）
    const userTokenAccount = await anchor.utils.token.associatedAddress({
      mint,
      owner: secondUser.publicKey,
    });

    // 3. 派生所需 PDA
    const [projectLock] = PublicKey.findProgramAddressSync(
      [Buffer.from("project_lock"), mint.toBuffer()],
      program.programId
    );

    const [userLockInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_lock_info"), secondUser.publicKey.toBuffer(), projectLock.toBuffer()],
      program.programId
    );

    const [userLock] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_lock"), secondUser.publicKey.toBuffer(), mint.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const currentTime = Math.floor(Date.now() / 1000);

     it("Initialize ProjectLock", async () => {
   
    // 初始化 UserLockInfo
    const tx = await program.methods
      .initUserLockInfo()
      .accounts({
        tokenMint: mint,
      })
      .rpc();

    console.log("ProjectLock initialized:", tx);
  });



    // 4. 调用 stake/lock 方法
    await program.methods
      .lock(new anchor.BN(100_000_000),new anchor.BN(currentTime + 1000)) // 质押数量
      .accounts({
        tokenMint: mint,
        userTokenAccount,
        lockTokenAccount: projectLock, // 示例：你的项目锁仓账户（应为 PDA 管理）
        user: secondUser.publicKey,
      })
      .signers([secondUser])
      .rpc();

    console.log("✅ Second user staked successfully.");
  });
});