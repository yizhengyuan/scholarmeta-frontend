import { Buffer } from 'buffer';
import React, { createContext, useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// 确保全局可用
window.Buffer = Buffer;

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  // 创建一个默认的 connection
  const defaultConnection = new Connection(
    'https://wispy-divine-butterfly.solana-mainnet.quiknode.pro/d7ff77e7359134eca1b79f7135b1833ae44f0ad9/',
    'confirmed'
  );

  const [web3State, setWeb3State] = useState({
    address: null,
    connected: false,
    wallet: null,
    networkName: null,
    error: null,
    connection: defaultConnection  // 初始化时使用默认 connection
  });

  // 检查钱包状态
  useEffect(() => {
    const checkConnection = async () => {
      if (window.solana?.isPhantom) {
        try {
          // 直接获取当前连接的账户
          const resp = await window.solana.connect({ onlyIfTrusted: true });
          if (resp.publicKey) {
            const connection = new Connection(
              'https://wispy-divine-butterfly.solana-mainnet.quiknode.pro/d7ff77e7359134eca1b79f7135b1833ae44f0ad9/',
              'confirmed'
            );
            
            setWeb3State({
              connected: true,
              address: resp.publicKey.toString(),
              wallet: window.solana,
              networkName: 'Solana Mainnet',
              connection: connection,
              error: null
            });
          }
        } catch (error) {
          // 如果没有已授权的连接，这里会抛出错误，这是正常的
          console.log("No trusted connection:", error);
        }
      }
    };
    
    checkConnection();
  }, []);

  // 监听钱包状态变化
  useEffect(() => {
    if (window.solana) {
      const handleWalletConnection = (publicKey) => {
        if (publicKey) {
          const connection = new Connection(
            'https://wispy-divine-butterfly.solana-mainnet.quiknode.pro/d7ff77e7359134eca1b79f7135b1833ae44f0ad9/',
            'confirmed'
          );
          
          setWeb3State({
            connected: true,
            address: publicKey.toString(),
            wallet: window.solana,
            networkName: 'Solana Mainnet',
            connection: connection,
            error: null
          });
        }
      };

      const handleWalletDisconnection = () => {
        setWeb3State({
          address: null,
          connected: false,
          wallet: null,
          networkName: null,
          error: null,
          connection: defaultConnection  // 断开连接时保持默认 connection
        });
      };

      // 添加事件监听器
      window.solana.on('connect', handleWalletConnection);
      window.solana.on('disconnect', handleWalletDisconnection);

      // 清理函数
      return () => {
        window.solana.removeListener('connect', handleWalletConnection);
        window.solana.removeListener('disconnect', handleWalletDisconnection);
      };
    }
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (!solana?.isPhantom) {
        throw new Error("Please install Phantom Wallet");
      }

      const resp = await solana.connect();
      // 连接成功后会触发 connect 事件，由事件监听器处理状态更新
      
    } catch (error) {
      console.error("Wallet connection failed:", error);
      // 直接抛出错误，让组件处理
      throw error;
    }
  };

  // 获取网络名称
  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai',
      56: 'BSC',
      97: 'BSC Testnet'
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  return (
    <Web3Context.Provider value={{ web3State, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};