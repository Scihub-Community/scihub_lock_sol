import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, message } from 'antd';
import { Program } from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { ScihubLock } from '../types/scihub_lock';
import { motion } from 'framer-motion';
import { getAssociatedTokenAddressSync, getAccount } from '@solana/spl-token';
import idl from '../types/scihub.json';
import { Buffer as BufferPolyfill } from 'buffer';

// Polyfill Buffer for browser environments
globalThis.Buffer = BufferPolyfill;

// Program and token constants
const PROGRAM_ID = new PublicKey('J82RZvfqaQ2uuk8wu1ziiwDtjyxkArmSvMXSfT6LSM7x');
const TOKEN_MINT = new PublicKey('A22hchYQ2Eiwe7k57ALGmDwN4oJYzn11oadKiuALaNZs');
const FOUNDATION_1 = new PublicKey('Cfy5rFwmU2fe43YbR79F1Nsm1REZ9DurQ3aoKhP6ANgt');
const FOUNDATION_2 = new PublicKey('di8tq1XvpWp232d9Keu2j7NHxi9t8SaAqDpybeWPKa8');

export const StatsPanel: React.FC = () => {
    const { connection } = useConnection();
    const [stats, setStats] = useState({
        totalAmount: 0,
        rewardPerSec: 0,
        foundation1Balance: 0,
        foundation2Balance: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!connection) {
                    setError('Connection not ready.');
                    setLoading(false);
                    return;
                }

                // Derive project lock PDA
                const [projectLockPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from('project_lock'), TOKEN_MINT.toBuffer()],
                    PROGRAM_ID
                );

                // Initialize Anchor program
                const program = new Program<ScihubLock>(idl as any, { connection });

                // Fetch project lock account
                let projectLockAccount = null;
                try {
                    projectLockAccount = await program.account.projectLock.fetch(projectLockPDA);
                    console.log('Project Lock Account Data:', projectLockAccount);
                } catch (fetchError: any) {
                    console.warn(`Could not fetch ProjectLock account at ${projectLockPDA.toBase58()}:`, fetchError.message);
                    setError(`ProjectLock account not found or uninitialized: ${fetchError.message}`);
                    setLoading(false);
                    return; // Exit early if projectLockAccount is not found
                }

                // Derive and fetch lock token account (ATA for projectLockPDA)
                const lockTokenAccount = getAssociatedTokenAddressSync(
                    TOKEN_MINT,
                    projectLockPDA,
                    true // Allow off-curve PDA as owner
                );

                let lockTokenBalance = 0;
                try {
                    const lockTokenAccountInfo = await getAccount(connection, lockTokenAccount);
                    lockTokenBalance = Number(lockTokenAccountInfo.amount) / 1_000_000_000; // 9 decimals
                } catch (error: any) {
                    console.warn(`Lock token account not found at ${lockTokenAccount.toBase58()}:`, error.message);
                    // Optionally, you could create the ATA here if needed, but for stats, we can proceed with 0 balance
                }

                // Fetch foundation wallet token balances
                const foundation1ATA = getAssociatedTokenAddressSync(TOKEN_MINT, FOUNDATION_1);
                const foundation2ATA = getAssociatedTokenAddressSync(TOKEN_MINT, FOUNDATION_2);

                let foundation1Balance = 0;
                let foundation2Balance = 0;

                try {
                    const foundation1Account = await getAccount(connection, foundation1ATA);
                    foundation1Balance = Number(foundation1Account.amount) / 1_000_000_000;
                } catch (error: any) {
                    console.warn(`Foundation 1 token account not found at ${foundation1ATA.toBase58()}:`, error.message);
                }

                try {
                    const foundation2Account = await getAccount(connection, foundation2ATA);
                    foundation2Balance = Number(foundation2Account.amount) / 1_000_000_000;
                } catch (error: any) {
                    console.warn(`Foundation 2 token account not found at ${foundation2ATA.toBase58()}:`, error.message);
                }

                // Update stats
                setStats({
                    totalAmount: projectLockAccount
                        ? Number(projectLockAccount.totalAmount) / 1_000_000_000
                        : 0,
                    rewardPerSec: projectLockAccount
                        ? Number(projectLockAccount.rewardTokenPerSec) / 1_000_000_000
                        : 0,
                    foundation1Balance,
                    foundation2Balance,
                });
            } catch (err: any) {
                console.error('Error fetching stats:', err);
                setError('Failed to fetch stats: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, [connection]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <Card title="Foundation Stats" style={{ marginBottom: 24 }} loading={loading}>
                {error && <div style={{ color: 'red', marginBottom: 16 }}>Error: {error}</div>}
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic
                            title="Total Staked"
                            value={stats.totalAmount.toFixed(2)}
                            suffix="Tokens"
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="Reward Rate"
                            value={stats.rewardPerSec.toFixed(6)}
                            suffix="Tokens/Sec"
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="Foundation 1 Balance"
                            value={stats.foundation1Balance.toFixed(2)}
                            suffix="Tokens"
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="Foundation 2 Balance"
                            value={stats.foundation2Balance.toFixed(2)}
                            suffix="Tokens"
                        />
                    </Col>
                </Row>
            </Card>
        </motion.div>
    );
};