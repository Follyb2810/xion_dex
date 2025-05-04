import { AddressTransactions } from "@/components/History";
import BackHead from "@/components/shared/BacHead";

export default function HistoryPage() {
  return (
    <section className="w-full p-6">
      <BackHead text="Address Transaction History" />
      <AddressTransactions />
    </section>
  );
}
