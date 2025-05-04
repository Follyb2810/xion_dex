import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import { Outlet } from "react-router-dom";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <section className="flex min-h-screen flex-col w-full">
      <Header />
      {children}
      <Outlet />
      <Footer />
    </section>
  );
}
