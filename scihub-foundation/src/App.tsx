import { Layout } from 'antd';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsPanel } from './components/StatsPanel';
import { LockForm } from './components/LockForm';
import { AccountOverview } from './components/AccountOverview';
import { Footer } from './components/Footer';
import './App.css';
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header />
      <Content style={{ padding: '0 50px', maxWidth: 1200, margin: '0 auto' }}>
        <Hero />
        <StatsPanel />
        <LockForm />
        <AccountOverview />
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;