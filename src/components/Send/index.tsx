import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Send } from "lucide-react";
import { useToast } from "../../hook/useToast";
import { useAuth } from "@/context/useAuth";
import useXion from "@/hook/useXion";
import { IAsset, useAssets } from "@/hook/useAssets";
import useMeta from "@/hook/useMeta";
import { DeliverTxResponse } from "@cosmjs/cosmwasm-stargate";

interface FormData {
  receiverAddress: string;
  amount: string;
  note: string;
}

export default function SendToken() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { transferToken } = useXion();
  const toast = useToast();
  const { assets } = useAssets();
  const { bech32Address } = useMeta();
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);
  const [availableBalance, setAvailableBalance] = useState("0");
  const [formData, setFormData] = useState<FormData>({
    receiverAddress: "",
    amount: "0",
    note: "",
  });

  const { receiverAddress, amount, note } = formData;

  useEffect(() => {
    if (!selectedAsset) return;
    const asset = assets.find((a) => a.displayDenom === selectedAsset.displayDenom);
    setAvailableBalance(asset?.amount ?? "0");
  }, [selectedAsset, assets]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.walletAddress || !bech32Address || !transferToken) {
      toast.error("Wallet not connected properly.");
      return;
    }

    if (!receiverAddress || !amount || !selectedAsset) {
      toast.error("Recipient address, asset, and amount are required.");
      return;
    }

    if (parseFloat(amount) > parseFloat(availableBalance)) {
      toast.error(
        `Insufficient balance. Available: ${availableBalance} ${selectedAsset.displayDenom}`
      );
      return;
    }

    try {
      setIsLoading(true);
      const txPromise = transferToken(
        bech32Address,
        receiverAddress,
        amount,
        selectedAsset.rawDenom
      );

      toast.promise(txPromise, {
        loading: "Submitting transaction...",
        success: (data: DeliverTxResponse) =>
          <a href={`https://explorer.burnt.com/xion-testnet-2/tx/${data.transactionHash}`} target="_blank" rel="noopener noreferrer" className="underline">
            
            Transaction submitted. View it on explorer (hash: https://explorer.burnt.com/xion-testnet-2/tx/${data.transactionHash})
          </a>,
        error: "Transaction failed",
      });

      const response = await txPromise;

      if (response?.transactionHash) {
        toast.success("Transaction submitted successfully.");
        setFormData({ receiverAddress: "", amount: "0", note: "" });
        setSelectedAsset(null);
        setAvailableBalance("0");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Failed to send transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Send Assets</CardTitle>
          <CardDescription>Send crypto to any wallet address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend}>
            <div className="grid gap-6">
              {/* Asset Select */}
              <div className="grid gap-3">
                <Label htmlFor="asset">Asset</Label>
                <Select
                  onValueChange={(val) => {
                    const asset = assets.find((a) => a.displayDenom === val);
                    setSelectedAsset(asset ?? null);
                  }}
                  value={selectedAsset?.displayDenom ?? ""}
                >
                  <SelectTrigger id="asset">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset, i) => (
                      <SelectItem
                        key={`${i}-${asset.rawDenom}`}
                        value={asset.displayDenom}
                      >
                        {asset.displayDenom} ({asset.amount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient Address */}
              <div className="grid gap-3">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  name="receiverAddress"
                  placeholder="0x..."
                  required
                  value={receiverAddress}
                  onChange={handleChange}
                />
              </div>

              {/* Amount */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount">Amount</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: {availableBalance} {selectedAsset?.displayDenom}
                  </span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  step="0.0001"
                  min="0"
                  placeholder="0.0"
                  required
                  value={amount}
                  onChange={handleChange}
                />
              </div>

              {/* Note */}
              <div className="grid gap-3">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  name="note"
                  placeholder="Add a note to this transaction"
                  value={note}
                  onChange={handleChange}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !selectedAsset}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Transaction
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
