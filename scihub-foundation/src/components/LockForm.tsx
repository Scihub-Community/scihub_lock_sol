import { useState, useEffect } from 'react'; // 引入 useEffect
import { Button, Card, Form, InputNumber, message, Spin } from 'antd'; // 引入 Spin 用于加载状态
import { Program, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from '@solana/spl-token'; // 引入 getAccount
import { ScihubLock } from '../types/scihub_lock';
import { motion } from 'framer-motion';
import { Buffer as BufferPolyfill } from 'buffer'
declare let Buffer: typeof BufferPolyfill;
globalThis.Buffer = BufferPolyfill;

// 请再次确认这个 PROGRAM_ID 是否与你的部署程序ID一致
const PROGRAM_ID = new PublicKey('J82RZvfqaQ2uuk8wu1ziiwDtjyxkArmSvMXSfT6LSM7x');
const TOKEN_MINT = new PublicKey('A22hchYQ2Eiwe7k57ALGmDwN4oJYzn11oadKiuALaNZs');

export const LockForm: React.FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [totalLockedAmount, setTotalLockedAmount] = useState<number | null>(null); // 新增状态来存储总锁仓量
    const [fetchingStats, setFetchingStats] = useState(true); // 新增状态来表示正在获取统计数据

    // 封装一个函数来获取总锁仓量，方便在 useEffect 和交易成功后调用
    const fetchTotalLockedAmount = async () => {
        setFetchingStats(true);
        try {
            if (!connection) {
                setTotalLockedAmount(0); // 没有连接时显示0
                return;
            }

            // 派生 project_lock PDA
            const [projectLock] = PublicKey.findProgramAddressSync(
                [Buffer.from('project_lock'), TOKEN_MINT.toBuffer()],
                PROGRAM_ID
            );

            // 获取 lockTokenAccount 的地址 (ProjectLock PDA的Associated Token Account)
            const lockTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, projectLock, true);

            // 尝试获取 lockTokenAccount 的信息
            const accountInfo = await connection.getAccountInfo(lockTokenAccount);

            if (accountInfo) {
                // 如果账户存在，则获取其 SPL Token 余额
                const tokenAccount = await getAccount(connection, lockTokenAccount);
                // tokenAccount.amount 是一个 BigInt，需要转换为数字并处理精度（假设9位小数）
                const amount = Number(tokenAccount.amount) / 1_000_000_000;
                setTotalLockedAmount(amount);
            } else {
                // 如果账户不存在，说明目前没有锁仓量
                setTotalLockedAmount(0);
            }
        } catch (error) {
            console.error("Failed to fetch total locked amount:", error);
            message.error("无法获取总锁仓量。");
            setTotalLockedAmount(null); // 获取失败时设为 null 或其他表示错误的值
        } finally {
            setFetchingStats(false);
        }
    };

    // 使用 useEffect 在组件加载时获取锁仓量，并设置定时刷新
    useEffect(() => {
        fetchTotalLockedAmount(); // 首次加载时获取

        const intervalId = setInterval(fetchTotalLockedAmount, 30000); // 每30秒刷新一次

        return () => clearInterval(intervalId); // 组件卸载时清除 interval
    }, [connection]); // 依赖 connection 对象，当连接变化时重新获取

    const onLock = async (values: { amount: number; duration: number }) => {
        if (!publicKey) {
            message.error('请连接您的钱包。');
            return;
        }
        setLoading(true);
        try {
            const program = new Program<ScihubLock>('scihub.json', PROGRAM_ID, { connection });
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
            // 这里 userLock 的生成逻辑可能需要根据您的合约来验证，特别是 new BN(0) 的部分
            const [userLock] = PublicKey.findProgramAddressSync(
                [Buffer.from('user_lock'), publicKey.toBuffer(), TOKEN_MINT.toBuffer(), new BN(0).toArrayLike(Buffer, 'le', 8)],
                PROGRAM_ID
            );

            const currentTime = Math.floor(Date.now() / 1000);
            const tx = await program.methods
                .lock(new BN(values.amount * 1_000_000_000), new BN(currentTime + values.duration))
                .accounts({
                    user: publicKey,
                    tokenMint: TOKEN_MINT,
                    userTokenAccount,
                    lockTokenAccount,
                    projectLock,
                    userLockInfo,
                    userLock, // 确保这个账户在合约中被正确处理和初始化
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .preInstructions([
                    // 只有当 userLockInfo 账户尚未存在时才需要初始化
                    // 您可以在此处添加一个检查来避免重复初始化
                    await program.methods
                        .initUserLockInfo()
                        .accounts({
                            user: publicKey,
                            tokenMint: TOKEN_MINT,
                            projectLock,
                            userLockInfo,
                            systemProgram: SystemProgram.programId,
                        })
                        .instruction(),
                ])
                .transaction();

            const txId = await sendTransaction(tx, connection, { skipPreflight: true });
            await connection.confirmTransaction(txId);
            message.success(`成功质押 ${values.amount} 个代币！交易 ID: ${txId}`);
            form.resetFields();
            // 交易成功后立即刷新总锁仓量
            await fetchTotalLockedAmount();
        } catch (error) {
            message.error('质押失败: ' + (error as Error).message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onDonate = async (values: { amount: number }) => {
        if (!publicKey) {
            message.error('请连接您的钱包。');
            return;
        }
        setLoading(true);
        try {
            const program = new Program<ScihubLock>('scihub.json', PROGRAM_ID, { connection });
            const [projectLock] = PublicKey.findProgramAddressSync(
                [Buffer.from('project_lock'), TOKEN_MINT.toBuffer()],
                PROGRAM_ID
            );
            const userTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
            const lockTokenAccount = await getAssociatedTokenAddress(TOKEN_MINT, projectLock, true);

            const tx = await program.methods
                .donation(new BN(values.amount * 1_000_000_000))
                .accounts({
                    user: publicKey,
                    tokenMint: TOKEN_MINT,
                    userTokenAccount,
                    lockTokenAccount,
                    projectLock,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .transaction();

            const txId = await sendTransaction(tx, connection, { skipPreflight: true });
            await connection.confirmTransaction(txId);
            message.success(`成功捐赠 ${values.amount} 个代币！交易 ID: ${txId}`);
            form.resetFields();
            // 交易成功后立即刷新总锁仓量
            await fetchTotalLockedAmount();
        } catch (error) {
            message.error('捐赠失败: ' + (error as Error).message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} id="lock-form">
            <Card title="质押与捐赠" style={{ marginBottom: 24 }}>
                {/* 显示总锁仓量 */}
                {fetchingStats ? (
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Spin size="small" /> 正在加载锁仓量...
                    </div>
                ) : (
                    totalLockedAmount !== null && (
                        <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 'bold' }}>
                            当前总锁仓量: {totalLockedAmount.toFixed(2)} Tokens
                        </div>
                    )
                )}

                <Form form={form} layout="vertical" onFinish={onLock}>
                    <Form.Item name="amount" label="金额 (代币)" rules={[{ required: true, message: '请输入金额' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="duration" label="锁仓时长 (秒)" rules={[{ required: true, message: '请输入时长' }]}>
                        <InputNumber min={60} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            质押代币
                        </Button>
                    </Form.Item>
                </Form>
                <Form layout="vertical" onFinish={onDonate}>
                    <Form.Item name="amount" label="捐赠金额 (代币)" rules={[{ required: true, message: '请输入金额' }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            捐赠
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </motion.div>
    );
};