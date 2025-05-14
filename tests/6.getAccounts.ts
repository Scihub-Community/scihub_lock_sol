import { Connection } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ScihubLock } from "../target/types/scihub_lock";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";

// 初始化连接和 programId
const connection = new Connection("https://api.devnet.solana.com"); // 或你自己的节点
const programId = new PublicKey("J82RZvfqaQ2uuk8wu1ziiwDtjyxkArmSvMXSfT6LSM7x");
const targetUser = new PublicKey("7dEiDwc8xzTnpbwxBjTbiLYBQ6PsVMPEkvXXttMB4ERy");

  const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
const program = anchor.workspace.scihubLock as Program<ScihubLock>;

async function main() {
   
    const USER_LOCK_ACCOUNT_SIZE = 104;

    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        // { dataSize: USER_LOCK_ACCOUNT_SIZE },
        {
            memcmp: {
              offset: 16, 
              bytes: targetUser.toBase58(), // 用户地址
            },
          },
      ],
    });
    // for (const acc of accounts) {

    //     console.log("Account:", acc.pubkey.toBase58());

    //     // const decoded = program.coder.accounts.decode("UserLock", acc.account.data);
    //     // console.log("🧾 PDA:", acc.pubkey.toBase58());
    //     // console.log("👤 User:", decoded.user.toBase58());
    //     // console.log("🪙 Token Mint:", decoded.tokenMint.toBase58());
    //     // console.log("💰 Amount:", decoded.amount.toString());
    //     // console.log("⏰ Start:", decoded.startTime.toString());
    //     // console.log("⏰ End:", decoded.endTime.toString());
    //     // console.log("——————————————");
    //   }
    const userLockAccount = await program.account.userLock.fetchMultiple(accounts.map(acc => acc.pubkey));
    for (let i = 0; i < userLockAccount.length; i++) {
        const decoded = userLockAccount[i];
        console.log("🧾 PDA:", accounts[i].pubkey.toBase58());
        console.log("👤 User:", decoded.user.toBase58());
        console.log("🪙 Token Mint:", decoded.tokenMint.toBase58());
        console.log("Index:", decoded.index.toString());
        console.log("💰 Amount:", decoded.amount.toString());
        console.log("⏰ Start:", decoded.startTime.toString());
        console.log("⏰ End:", decoded.endTime.toString());
        console.log("——————————————");
      }

    
}
  main();