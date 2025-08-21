import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MOCK_USDC_ABI } from '../contracts/abis';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';

// Hook to read USDC balance
export function useUSDCBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_USDC as `0x${string}`,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// Hook to read USDC allowance
export function useUSDCAllowance(
  owner: `0x${string}` | undefined,
  spender: `0x${string}` | undefined
) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_USDC as `0x${string}`,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!(owner && spender),
    },
  });
}

// Hook to approve USDC spending
export function useUSDCApprove() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const approve = (spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.MOCK_USDC as `0x${string}`,
      abi: MOCK_USDC_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Hook to get USDC decimals
export function useUSDCDecimals() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_USDC as `0x${string}`,
    abi: MOCK_USDC_ABI,
    functionName: 'decimals',
  });
}