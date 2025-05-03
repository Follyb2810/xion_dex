import { useEffect, useState } from "react";
import { XionTransaction } from "@/helper/Xion";
import { useAuth } from "@/context/useAuth";

export interface IAsset {
  rawDenom: string;       
  displayDenom: string;   
  amount: string;
}

export function useAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<IAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);

      try {
        if (user?.walletAddress) {
          const xion = new XionTransaction();
          const balances = await xion.getAllTokenBalancesWithDenoms(user.walletAddress);

          const formattedAssets = balances.map(bal => ({
            rawDenom: bal.rawDenom,
            displayDenom: bal.displayDenom,
            amount: (parseFloat(bal.amount) / 1_000_000).toString(),
          }));

          setAssets(formattedAssets);
        }
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