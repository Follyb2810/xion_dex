import { useEffect, useState } from "react";
import { XionTransaction } from "@/helper/Xion";
import { useAuth } from "@/context/useAuth";

export interface Asset {
  denom: string;
  amount: string;
}

export function useAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);

      try {
        const mockAssets: Asset[] = [
        //   { denom: "XION", amount: "1000" },
          { denom: "ATOM", amount: "500" },
          { denom: "USDC", amount: "1500" },
          { denom: "BTC", amount: "0.75" },
          { denom: "ETH", amount: "3.25" },
        ];

        let realAssets: Asset[] = [];

        if (user?.walletAddress) {
          const xion = new XionTransaction();
          const balances = await xion.getAllTokenBalances(user.walletAddress);

          realAssets = balances.map(bal => ({
            denom: bal.denom.startsWith("u") ? bal.denom.slice(1).toUpperCase() : bal.denom.toUpperCase(),
            amount: (parseFloat(bal.amount) / 1_000_000).toString(),
          }));
        }

        const mergedAssets = [...realAssets, ...mockAssets];
        setAssets(mergedAssets);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch assets");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [user?.walletAddress]);

  return { assets, loading, error };
}
