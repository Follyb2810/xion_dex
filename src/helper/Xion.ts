import { StargateClient } from "@cosmjs/stargate";


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
  async transferFund(){
    try {
       const client = await this.getStargateClient()
       return client.disconnect() 
    } catch (error) {
      console.log(error)
    }
  }
  async getChainId(){
    return (await this.getStargateClient()).getChainId();
  }
}
