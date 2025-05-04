import React, { useEffect, useState, useCallback } from "react";
import { IndexedTx } from "@cosmjs/stargate";
import useXion from "@/hook/useXion";
import useMeta from "@/hook/useMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NoContent from "../shared/NoContent";
import Loading from "../shared/Loading";

export const AddressTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<IndexedTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getAddressTransactionsHistory } = useXion();
  const { bech32Address } = useMeta();

  const fetchTransactions = useCallback(async () => {
    if (!bech32Address || !getAddressTransactionsHistory) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const txs = await getAddressTransactionsHistory(bech32Address);
      console.log("Fetched transactions:", txs);
      setTransactions(txs ?? []);
    } catch (err) {
      console.error("Transaction fetch error:", err);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [bech32Address, getAddressTransactionsHistory]);

  useEffect(() => {
    console.log("bech32Address:", bech32Address);
    fetchTransactions();
  }, [bech32Address]);

  if (loading) return <Loading />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!bech32Address) return <NoContent message="Please connect your wallet." />;
  if (transactions.length === 0) return <NoContent message="No transactions found." />;

  return (
    <div className="p-4 rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Latest Transactions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tx Hash</TableHead>
            <TableHead>Height</TableHead>
            <TableHead>Gas Used</TableHead>
            <TableHead>Gas Wanted</TableHead>
            <TableHead>Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.hash} className="hover:bg-gray-100 transition">
              <TableCell className="max-w-[200px] truncate">
                <span title={tx.hash}>{tx.hash} </span>
              </TableCell>
              <TableCell>{tx.height}</TableCell>
              <TableCell>{tx?.gasUsed.toString()}n</TableCell>
              <TableCell>{tx?.gasWanted.toString()}n </TableCell>
              <TableCell>{tx.code}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};