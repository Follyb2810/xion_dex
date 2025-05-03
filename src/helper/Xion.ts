import { Coin, StargateClient } from "@cosmjs/stargate";


export class XionTransaction {
  private readonly XION_RPC_URL: string;
  private readonly CHAIN_ID: string;

  constructor() {
    this.CHAIN_ID =  "xion-testnet-2";
    this.XION_RPC_URL = "https://rpc.xion-testnet-2.burnt.com";
  }
  async  getStargateClient(){
    return await StargateClient.connect(this.XION_RPC_URL)
  }
  
  async getAllTokenBalances(address: string) {
    try {
      const client = await this.getStargateClient();
      const balances = await client.getAllBalances(address);
      console.log({balances})
      return balances; 
    } catch (error) {
      console.error("Error fetching token balances:", error);
      throw error;
    }
  }
  async transferFund(
    mnemonic: string,
    recipientAddress: string,
    amount: Coin[],
    memo = ""
  ): Promise<string> {
    console.log({memo,mnemonic,amount,recipientAddress})
    
    return  ''
  }

  async getChainId(){
    return (await this.getStargateClient()).getChainId();
  }
  async getIbcDenomTrace(ibcHash: string): Promise<string | null> {
    try {
      const res = await fetch(`https://api.xion-testnet-2.burnt.com/ibc/apps/transfer/v1/denom_traces/${ibcHash}`);
      const data = await res.json();
      return data?.denom_trace?.base_denom ?? null;
    } catch (err) {
      console.error("Failed to fetch IBC denom trace:", err);
      return null;
    }
  }

  async getAllTokenBalancesWithDenoms(address: string) {
    const balances = await this.getAllTokenBalances(address);
  
    const resolvedBalances = await Promise.all(
      balances.map(async (bal) => {
        const rawDenom = bal.denom;
        let displayDenom = rawDenom;
  
        if (rawDenom.startsWith("ibc/")) {
          const hash = rawDenom.split("/")[1];
          const resolved = await this.getIbcDenomTrace(hash);
          displayDenom = resolved?.toUpperCase() || rawDenom;
        } else if (rawDenom.startsWith("u")) {
          displayDenom = rawDenom.slice(1).toUpperCase();
        } else {
          displayDenom = rawDenom.toUpperCase();
        }
  
        return {
          rawDenom,       
          displayDenom,   
          amount: bal.amount,
        };
      })
    );
  
    return resolvedBalances;
  }
  
}
