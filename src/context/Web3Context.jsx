import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3State, setWeb3State] = useState({
    provider: null,
    signer: null,
    address: null,
    connected: false,
    chainId: null,
    networkName: null
  });

  // 检查是否已经连接
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            
            setWeb3State({
              provider,
              signer,
              address,
              connected: true,
              chainId: network.chainId,
              networkName: network.name
            });
          }
        } catch (error) {
          console.error("检查钱包连接失败:", error);
        }
      }
    };
    
    checkConnection();
  }, []);

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // 用户断开了连接
          setWeb3State({
            provider: null,
            signer: null,
            address: null,
            connected: false,
            chainId: null,
            networkName: null
          });
        } else if (accounts[0] !== web3State.address) {
          // 账户已更改
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          setWeb3State({
            provider,
            signer,
            address,
            connected: true,
            chainId: network.chainId,
            networkName: network.name
          });
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [web3State.address]);

  const connectWallet = async () => {
    try {
      // 模拟连接过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟连接成功
      setWeb3State({
        provider: {},
        signer: {},
        address: '0x' + Math.random().toString(36).substring(2, 15),
        connected: true,
        chainId: 1,
        networkName: 'Ethereum'
      });
      
      return { success: true };
    } catch (error) {
      console.error("连接钱包失败:", error);
      throw error;
    }
  };

  return (
    <Web3Context.Provider value={{ web3State, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};