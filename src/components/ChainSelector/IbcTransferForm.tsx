import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Send, Loader2 } from "lucide-react";
import useXion from "@/hook/useXion";
import useMeta from "@/hook/useMeta";
import NoContent from "@/components/shared/NoContent";
import { cn } from "@/components/lib/utils";


interface IbcTransferFormProps {
  className?: string;
  sourceChannel: string;
}

const IbcTransferForm: React.FC<IbcTransferFormProps> = ({ className, sourceChannel }) => {
  const { transferIbcToken } = useXion();
  const { bech32Address, isConnected } = useMeta();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [timeoutTimestamp, setTimeoutTimestamp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !bech32Address) {
      setError("Please connect your wallet.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await transferIbcToken(
        bech32Address,
        recipient,
        amount,
        "uxion",
        "transfer",
        sourceChannel,
        timeoutTimestamp ? Number(timeoutTimestamp) : undefined
      );
      setSuccess(`Transfer successful! Tx Hash: ${response.transactionHash}`);
      setRecipient("");
      setAmount("");
      setTimeoutTimestamp("");
    } catch (err:unknown) {
      if(err instanceof Error){
        setError(err.message || "Failed to process IBC transfer.");
        console.error("Error fetching chains:", err);
      }
      setError("Failed to process IBC transfer.");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !bech32Address) {
    return <NoContent message="Please connect your wallet to transfer tokens." />;
  }

  return (
    <Card className={cn("max-w-md w-full mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">IBC Token Transfer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g., osmo1..."
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (XION)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 1.5"
              step="0.000001"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="timeoutTimestamp">Timeout Timestamp (Optional, seconds)</Label>
            <Input
              id="timeoutTimestamp"
              type="number"
              value={timeoutTimestamp}
              onChange={(e) => setTimeoutTimestamp(e.target.value)}
              placeholder="e.g., 1735689600"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Transfer Tokens
              </>
            )}
          </Button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IbcTransferForm;