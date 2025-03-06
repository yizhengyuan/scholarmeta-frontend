import { ethers } from 'ethers';

// 代币合约ABI (示例)
const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// 代币合约地址 (需要替换为实际地址)
const TOKEN_CONTRACT_ADDRESS = "0x123..."; // 替换为实际的代币合约地址

// 获取代币余额
export const getTokenBalance = async (provider, address) => {
  try {
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenABI, provider);
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();
    
    // 格式化余额，考虑小数位
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    
    return {
      balance: formattedBalance,
      symbol,
      raw: balance.toString()
    };
  } catch (error) {
    console.error("获取代币余额失败:", error);
    throw error;
  }
};

// 转账代币
export const transferToken = async (signer, toAddress, amount) => {
  try {
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenABI, signer);
    const decimals = await tokenContract.decimals();
    
    // 将输入的金额转换为代币的最小单位
    const amountInSmallestUnit = ethers.utils.parseUnits(amount.toString(), decimals);
    
    // 发送交易
    const tx = await tokenContract.transfer(toAddress, amountInSmallestUnit);
    
    // 等待交易确认
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  } catch (error) {
    console.error("代币转账失败:", error);
    throw error;
  }
};

// 检查网络是否支持
export const checkNetwork = async (provider) => {
  try {
    const network = await provider.getNetwork();
    
    // 这里可以定义支持的网络列表
    const supportedNetworks = [1, 56, 137]; // 例如: Ethereum Mainnet, BSC, Polygon
    
    return {
      isSupported: supportedNetworks.includes(network.chainId),
      networkName: network.name,
      chainId: network.chainId
    };
  } catch (error) {
    console.error("检查网络失败:", error);
    throw error;
  }
};