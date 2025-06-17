import { Button, Card, Typography } from 'antd';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

export const Hero: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{ textAlign: 'center', margin: '50px 0' }}
    >
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Title level={2}>Welcome to Scihub Community Foundation</Title>
        <Paragraph>
          We are dedicated to advancing open-access scientific research through decentralized finance. Join our community by staking tokens, supporting projects, and earning rewards.
        </Paragraph>
        <Button type="primary" size="large" href="#lock-form">
          Start Staking Now
        </Button>
      </Card>
    </motion.div>
  );
};