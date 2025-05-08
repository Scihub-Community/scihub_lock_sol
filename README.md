# Scihub Lock

基于 [Solana Anchor](https://github.com/coral-xyz/anchor) 框架开发的智能合约项目，包含 Rust 智能合约和 TypeScript 测试脚本。

## 目录结构

```
.
├── programs/           # Rust 智能合约源码（Anchor 项目）
│   └── scihub_lock/
│       ├── src/
│       │   └── lib.rs  # 主合约入口
│       └── Cargo.toml  # Rust 包配置
├── tests/              # TypeScript 测试脚本
│   └── scihub_lock.ts
├── package.json        # Node.js 项目配置
├── tsconfig.json       # TypeScript 配置
├── Anchor.toml         # Anchor 项目配置
└── ...
```

## 环境准备

1. **Rust & Solana CLI**
   - 安装 Rust: https://www.rust-lang.org/tools/install
   - 安装 Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools

2. **Anchor CLI**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

3. **Node.js & Yarn**
   - 推荐 Node.js 16+
   - 安装 Yarn: `npm install -g yarn`

4. **依赖安装**
   ```bash
   yarn install
   ```

## 构建与部署

### 构建合约

```bash
anchor build
```

### 本地部署

```bash
anchor localnet
```

### 部署到本地集群

```bash
anchor deploy
```

## 测试

项目使用 [Mocha](https://mochajs.org/) + [Chai](https://www.chaijs.com/) 进行 TypeScript 测试。

运行测试：

```bash
yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts
# 或者
anchor test
```

## 主要依赖

- [@coral-xyz/anchor](https://github.com/coral-xyz/anchor)
- [Mocha](https://mochajs.org/)
- [Chai](https://www.chaijs.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 配置说明

- `Anchor.toml` 配置了本地集群和钱包路径。
- `tsconfig.json` 配置了 TypeScript 编译选项。
- `Cargo.toml` 配置了 Rust 智能合约依赖。

## 贡献

欢迎提交 issue 和 PR！ 