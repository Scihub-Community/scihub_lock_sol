import { Button, Layout, Typography } from 'antd';
import { Wallet } from './wallet';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export const Header: React.FC = () => {
    const { publicKey } = useWallet();

    return (
        <AntHeader style={{ background: 'transparent', padding: '0 50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Title level={3} style={{ margin: 0, color: '#fff' }}>
                    <img src="/logo.jpg" alt="Scihub Foundation" style={{ height: '40px', marginRight: '10px' }} />
                    Scihub Community Foundation
                </Title>
            </motion.div>
            <Wallet isMobile={true}>
                {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 'Connect Wallet'}
            </Wallet>

        </AntHeader>
    );
};