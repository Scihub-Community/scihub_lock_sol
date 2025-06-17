import { Layout, Typography } from 'antd';
import { motion } from 'framer-motion';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export const Footer: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <AntFooter style={{ textAlign: 'center', background: 'transparent', padding: '24px 50px' }}>
        <Text>Scihub Community Foundation © 2025 | Powered by Solana</Text>
        <div style={{ marginTop: 8 }}>
          <a href="https://twitter.com/scihub" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px' }}>
            Twitter
          </a>
          <a href="https://discord.gg/scihub" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px' }}>
            Discord
          </a>
        </div>
      </AntFooter>
    </motion.div>
  );
};