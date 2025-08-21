"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import { CampaignFormData } from "../types/campaign";
import { useCreateCampaign } from "../hooks/useCrowdfundingFactory";
import { CAMPAIGN_CONSTANTS } from "../contracts/addresses";

interface CreateCampaignProps {
  onSubmit?: (campaignData: CampaignFormData) => void;
}

export default function CreateCampaign({ onSubmit }: CreateCampaignProps) {
  const { address, isConnected } = useAccount();
  const { createCampaign, isPending, isConfirming, isConfirmed, error, hash } =
    useCreateCampaign();

  const [formData, setFormData] = useState<CampaignFormData>({
    projectMode: "launchpad",
    projectIcon: null,
    projectName: "",
    deadline: "",
    fundraisingGoal: "",
    tokenName: "",
    tokenSymbol: "",
    tokenSupply: "", // Keep for type compatibility but won't show in UI
    keepToken: "", // Keep for type compatibility but won't show in UI
    liquidityPoolPercentage: 45,
    projectIntroduction: "",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (
    field: keyof CampaignFormData,
    value: string | number | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleInputChange("projectIcon", file);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.projectName.trim()) errors.push("Project name is required");
    if (!formData.deadline) errors.push("Deadline is required");
    if (!formData.fundraisingGoal) errors.push("Funding goal is required");
    if (!formData.projectIntroduction.trim())
      errors.push("Project introduction is required");

    const fundingGoalNum = parseFloat(formData.fundraisingGoal);
    if (fundingGoalNum < 100) errors.push("Minimum funding goal is 100 USDC");
    if (fundingGoalNum > 10000000)
      errors.push("Maximum funding goal is 10M USDC");

    if (formData.projectMode === "launchpad") {
      if (!formData.tokenName.trim())
        errors.push("Token name is required for Launchpad mode");
      if (!formData.tokenSymbol.trim())
        errors.push("Token symbol is required for Launchpad mode");
    }

    // Check deadline is in future
    const selectedDate = new Date(formData.deadline);
    const now = new Date();
    if (selectedDate <= now) errors.push("Deadline must be in the future");

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isConnected) {
      setValidationErrors(["Please connect your wallet first"]);
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    try {
      // Convert form data to contract parameters
      const fundingGoalWei = parseUnits(formData.fundraisingGoal, 6); // USDC has 6 decimals
      const selectedDate = new Date(formData.deadline);
      const now = new Date();
      const durationSeconds = BigInt(
        Math.floor((selectedDate.getTime() - now.getTime()) / 1000)
      );

      // Create metadata URI (for now, just a JSON string)
      const metadata = {
        description: formData.projectIntroduction,
        image: formData.projectIcon ? formData.projectIcon.name : "",
        projectMode: formData.projectMode,
      };
      const metadataURI = `data:application/json,${encodeURIComponent(
        JSON.stringify(metadata)
      )}`;

      createCampaign({
        name: formData.projectName,
        metadataURI,
        fundingGoal: fundingGoalWei,
        duration: durationSeconds,
        creatorReservePercentage: BigInt(
          CAMPAIGN_CONSTANTS.CREATOR_RESERVE_PERCENTAGE
        ),
        liquidityPercentage: BigInt(formData.liquidityPoolPercentage),
        tokenName: formData.tokenName || formData.projectName,
        tokenSymbol:
          formData.tokenSymbol ||
          formData.projectName.substring(0, 4).toUpperCase(),
      });

      onSubmit?.(formData);
    } catch (error) {
      console.error("Error creating campaign:", error);
      setValidationErrors(["Failed to create campaign. Please try again."]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold">DAPP</h1>
          <div className="flex items-center space-x-2">
            <Wallet>
              <ConnectWallet className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
                <Avatar address={address} className="h-5 w-5" />
                <Name address={address} className="text-sm" />
              </ConnectWallet>
              <WalletDropdown>
                <div className="px-4 pt-3 pb-2">
                  <Avatar address={address} className="h-8 w-8" />
                  <Name address={address} className="font-semibold" />
                  <Address
                    address={address}
                    className="text-sm text-gray-600"
                  />
                </div>
                <WalletDropdownDisconnect className="hover:bg-gray-100" />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 text-sm">
                Please connect your wallet to create a campaign
              </p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="text-red-800 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Transaction Status */}
          {(isPending || isConfirming || isConfirmed || error) && (
            <div
              className={`border rounded-lg p-4 ${
                isConfirmed
                  ? "bg-green-50 border-green-200"
                  : error
                  ? "bg-red-50 border-red-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              {isPending && (
                <p className="text-blue-800 text-sm">
                  Confirm transaction in your wallet...
                </p>
              )}
              {isConfirming && (
                <p className="text-blue-800 text-sm">Transaction pending...</p>
              )}
              {isConfirmed && (
                <div className="text-green-800 text-sm">
                  <p>✅ Campaign created successfully!</p>
                  {hash && (
                    <p className="mt-1">
                      <a
                        href={`https://basescan.org/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        View on BaseScan
                      </a>
                    </p>
                  )}
                </div>
              )}
              {error && (
                <p className="text-red-800 text-sm">
                  ❌ {error.message || "Transaction failed"}
                </p>
              )}
            </div>
          )}
          {/* Project Mode Toggle */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              project mode
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleInputChange("projectMode", "launchpad")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.projectMode === "launchpad"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Launchpad
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("projectMode", "classic")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.projectMode === "classic"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Classic
              </button>
            </div>
          </div>

          {/* Upload Project Icon */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              upload project icon
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="projectIcon"
              />
              <label htmlFor="projectIcon" className="cursor-pointer">
                {formData.projectIcon ? (
                  <span className="text-sm text-gray-600">
                    {formData.projectIcon.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">img.jpg</span>
                )}
              </label>
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              project name
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => handleInputChange("projectName", e.target.value)}
              placeholder="DAPP"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Deadline */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Fundraising Goal */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              fundraising goal
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.fundraisingGoal}
                onChange={(e) =>
                  handleInputChange("fundraisingGoal", e.target.value)
                }
                placeholder="100,000"
                className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                USDC
              </span>
            </div>
          </div>

          {/* Show additional fields for Launchpad mode */}
          {formData.projectMode === "launchpad" && (
            <>
              {/* Token Name */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  token name
                </label>
                <input
                  type="text"
                  value={formData.tokenName}
                  onChange={(e) =>
                    handleInputChange("tokenName", e.target.value)
                  }
                  placeholder="DAPP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Token Symbol */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  token symbol
                </label>
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) =>
                    handleInputChange("tokenSymbol", e.target.value)
                  }
                  placeholder="DAPP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Liquidity Pool Parameters */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  liquidity pool parameters
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.liquidityPoolPercentage}
                    onChange={(e) =>
                      handleInputChange(
                        "liquidityPoolPercentage",
                        parseInt(e.target.value)
                      )
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider accent-purple-600"
                  />
                  <span className="text-sm font-medium text-purple-600 min-w-[45px] text-right">
                    {formData.liquidityPoolPercentage}%
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Project Introduction */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              project introduction
            </label>
            <textarea
              value={formData.projectIntroduction}
              onChange={(e) =>
                handleInputChange("projectIntroduction", e.target.value)
              }
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquet..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isConnected || isPending || isConfirming}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-full font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {!isConnected
              ? "Connect Wallet First"
              : isPending
              ? "Confirm in Wallet..."
              : isConfirming
              ? "Creating Project..."
              : isConfirmed
              ? "Project Created!"
              : "Create Project"}
          </button>
        </form>

        {/* Bottom Navigation */}
        <div className="flex justify-around py-4 border-t border-gray-100">
          <button className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
            <span className="text-xs text-gray-600">home</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-400">account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
