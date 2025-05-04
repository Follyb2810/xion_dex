import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import IbcTransferForm from "./IbcTransferForm";
import NoContent from "@/components/shared/NoContent";
import { ChainService } from "@/helper/chain";
import { cn } from "@/components/lib/utils";

interface ChainSelectorProps {
  className?: string;
}

interface ChainInfo {
  chainName: string;
  channels: Array<{ chain1: string; chain2: string; channelId: string; portId: string }>;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ className }) => {
  const [chains, setChains] = useState<ChainInfo[]>([]);
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChains = async () => {
      const chainService = new ChainService();
      try {
        await chainService.initialize();
        // const chainNames = ["osmosis", "juno", "stargaze", "cosmoshub", "xion"];
        const chainNames = ["osmosis", "stargaze",  "xion"];
        const chainData: ChainInfo[] = [];

        for (const chainName of chainNames) {
          const channels = await chainService.getIbcChannels(chainName);
          chainData.push({ chainName, channels });
        }

        setChains(chainData);
        console.log("Fetched chains and channels:", chainData);
      } catch (err: unknown) {
        if(err instanceof Error){
          setError("Failed to load chain data: " + (err.message || "Unknown error"));
          console.error("Error fetching chains:", err);
        }
        setError("Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchChains();
  }, []);

  const handleChainSelect = (chainName: string) => {
    setSelectedChain(chainName);
    setSelectedChannel(""); 
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn("max-w-md w-full mx-auto", className)}>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chains.length === 0) {
    return <NoContent message="No chains available." />;
  }

  const selectedChainData = chains.find((chain) => chain.chainName === selectedChain);
  const channels = selectedChainData?.channels || [];

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center bg-background", className)}>
      <Card className="max-w-md w-full mx-auto mb-6">
        <CardHeader>
          <CardTitle>Select Chain and Channel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Select onValueChange={handleChainSelect} value={selectedChain}>
              <SelectTrigger>
                <SelectValue placeholder="Select a chain" />
              </SelectTrigger>
              <SelectContent>
                {chains.map((chain) => (
                  <SelectItem key={chain.chainName} value={chain.chainName}>
                    {chain.chainName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedChain && channels.length > 0 && (
            <div>
              <Select onValueChange={handleChannelSelect} value={selectedChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.channelId} value={channel.channelId}>
                      {`${channel.chain2} (${channel.channelId})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedChannel && (
        <IbcTransferForm sourceChannel={selectedChannel} className="mt-4" />
      )}
    </div>
  );
};

export default ChainSelector;