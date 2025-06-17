import { useEffect, useState } from 'react';
import { Button, Card, List, message } from 'antd';
import { Program, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { ScihubLock } from '../types/scihub_lock';
import { motion } from 'framer-motion';
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

const PROGRAM_ID = new PublicKey('FCcJEmiLoDBq1TBfraG5SP7KmEivDZubcVr2riLriNKQ');
const TOKEN_MINT = new PublicKey('A22hchYQ2Eiwe7k57ALGmDwN4oJYzn11oadKiuALaNZs');

export const AccountOverview: React.FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [userLockInfo, setUserLockInfo] = useState<any>(null);
    const [userLocks, setUserLocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!publicKey) return;
        const fetchUserData = async () => {
            try {
                const program = new Program<ScihubLock>(require('../types/scihub_lock'), PROGRAM_ID, { connection });
                const [projectLock] = PublicKey.findProgramAddressSync(
                    [Buffer.from('project_lock'), TOKEN_MINT.toBuffer()],
                    PROGRAM_ID
                );
                const [userLockInfoAddr] = PublicKey.findProgramAddressSync(
                    [Buffer.from('user_lock_info'), publicKey.toBuffer(), projectLock.toBuffer()],
                    PROGRAM_ID
                );
                const userLockInfoData = await program.account.userLockInfo.fetch(userLockInfoAddr);
                setUserLockInfo(userLockInfoData);

                const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
                    filters: [{ memcmp: { offset: 16, bytes: publicKey.toBase58() } }],
                });
                const userLockData = await program.account.userLock.fetchMultiple(accounts.map(acc => acc.pubkey));
                setUserLocks(userLockData.filter(Boolean));
            } catch (error) {
                message.error('Failed to fetch user data');
                console.error(error);
            }
        };
        fetchUserData();
    }, [publicKey, connection]);

    const onClaimReward = async () => {
        if (!publicKey) {
            message.error('Please connect your wallet');
            return;
        }
        setLoading(true);
        try {
            const program = new Program<ScihubLock>(require('../types/scihub_lock'), PROGRAM_ID, { connection });
            const [projectLock] = PublicKey.findProgramAddressSync(
                [Buffer.from('project_lock'), TOKEN_MINT.toBuffer()],
                PROGRAM_ID
            );
            const [userLockInfo] = PublicKey.findProgramAddressSync(
                [Buffer.from('user_lock_info'), publicKey.toBuffer(), projectLock.toBuffer()],
                PROGRAM_ID
            );
            const userRewardTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
            const projectRewardTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, projectLock, true);

            const tx = await program.methods
                .claimReward()
                .accounts({
                    user: publicKey,
                    tokenMint: TOKEN_MINT,
                    rewardTokenMint: TOKEN_MINT,
                    userRewardTokenAccount,
                    projectRewardTokenAccount,
                    projectLock,
                    userLockInfo,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .transaction();

            const txId = await sendTransaction(tx, connection, { skipPreflight: true });
            await connection.confirmTransaction(txId);
            message.success('Reward claimed successfully! Tx: ' + txId);
        } catch (error) {
            message.error('Claim failed: ' + (error as Error).message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onUnlock = async (index: number) => {
        if (!publicKey) {
            message.error('Please connect your wallet');
            return;
        }
        setLoading(true);
        try {
            const program = new Program<ScihubLock>(require('../types/scihub_lock'), PROGRAM_ID, { connection });
            const [projectLock] = PublicKey.findProgramAddressSync(
                [Buffer.from('project_lock'), TOKEN_MINT.toBuffer()],
                PROGRAM_ID
            );
            const [userLockInfo] = PublicKey.findProgramAddressSync(
                [Buffer.from('user_lock_info'), publicKey.toBuffer(), projectLock.toBuffer()],
                PROGRAM_ID
            );
            const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
            const lockTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, projectLock, true);
            const [userLock] = PublicKey.findProgramAddressSync(
                [Buffer.from('user_lock'), publicKey.toBuffer(), TOKEN_MINT.toBuffer(), new BN(index).toArrayLike(Buffer, 'le', 8)],
                PROGRAM_ID
            );

            const tx = await program.methods
                .unlock(new BN(index))
                .accounts({
                    user: publicKey,
                    tokenMint: TOKEN_MINT,
                    userTokenAccount,
                    lockTokenAccount,
                    projectLock,
                    userLockInfo,
                    userLock,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .transaction();

            const txId = await sendTransaction(tx, connection, { skipPreflight: true });
            await connection.confirmTransaction(txId);
            message.success(`Unlocked successfully! Tx: ${txId}`);
        } catch (error) {
            message.error('Unlock failed: ' + (error as Error).message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Card title="Your Account" style={{ marginBottom: 24 }}>
                {userLockInfo ? (
                    <>
                        <p>Total Staked: {Number(userLockInfo.amount) / 1_000_000_000} Tokens</p>
                        <p>Accumulated Rewards: {Number(userLockInfo.accumulatedReward) / 1_000_000_000} Tokens</p>
                        <p>Received Rewards: {Number(userLockInfo.receivedReward) / 1_000_000_000} Tokens</p>
                        <Button type="primary" onClick={onClaimReward} loading={loading} style={{ marginBottom: 16 }}>
                            Claim Rewards
                        </Button>
                        <List
                            header={<div>Your Locks</div>}
                            dataSource={userLocks}
                            renderItem={(lock: any, index) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="unlock"
                                            type="primary"
                                            onClick={() => onUnlock(Number(lock.index))}
                                            disabled={Number(lock.endTime) > Math.floor(Date.now() / 1000)}
                                        >
                                            Unlock
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={`Lock #${lock.index}`}
                                        description={`Amount: ${Number(lock.amount) / 1_000_000_000} Tokens, Ends: ${new Date(Number(lock.endTime) * 1000).toLocaleString()}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </>
                ) : (
                    <p>Connect your wallet to view account details.</p>
                )}
            </Card>
        </motion.div>
    );
};