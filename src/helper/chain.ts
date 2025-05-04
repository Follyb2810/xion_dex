import { ChainRegistryClient } from "@chain-registry/client"


export interface IBCData {
    chain_1: {
      chain_name: string;
      client_id: string;
      connection_id: string;
    };
    chain_2: {
      chain_name: string;
      client_id: string;
      connection_id: string;
    };
    channels: Array<{
      chain_1: {
        channel_id: string;
        port_id: string;
      };
      chain_2: {
        channel_id: string;
        port_id: string;
      };
      ordering: 'ordered' | 'unordered';
      version: string;
      tags?: {
        status?: 'live' | 'upcoming' | 'killed';
        preferred?: boolean;
        dex?: string;
        properties?: string;
      };
    }>;
  }
  
  
  
  
export class ChainService {
  private client: ChainRegistryClient;
  private chainNames: string[];

  constructor() {
    this.chainNames = ["osmosis", "juno", "stargaze", "cosmoshub", "xion"];
    this.client = new ChainRegistryClient({

          chainNames: this.chainNames,
      ibcNamePairs: [
        ["osmosis", "stargaze"],
        ["osmosis", "xion"],
        // ["cosmoshub","xion" ],
      ],
      assetListNames: ["osmosis", "juno", "xion"],
      baseUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master",
    });
  }

  async initialize() {
    try {
      await this.client.fetchUrls();
      console.log("Chain registry client initialized .");
    } catch (error) {
      console.error("Failed to initialize chain registry client:", error);
      throw new Error("Unable to initialize chain registry client.");
    }
  }

  async getChain(chainName: string) {
    if (!this.chainNames.includes(chainName)) {
      throw new Error(`Chain ${chainName} is not supported.`);
    }
    try {
      const chain = await this.client.getChain(chainName);
      if (!chain) {
        throw new Error(`Chain ${chainName} not found in registry.`);
      }
      return chain;
    } catch (error) {
      console.error(`Error fetching chain ${chainName}:`, error);
      throw error;
    }
  }

  async getChainInfo(chainName: string) {
    if (!this.chainNames.includes(chainName)) {
      throw new Error(`Chain ${chainName} is not supported.`);
    }
    try {
      const info = await this.client.getChainInfo(chainName);
      if (!info) {
        throw new Error(`Chain info for ${chainName} not found.`);
      }
      return info;
    } catch (error) {
      console.error(`Error fetching chain info for ${chainName}:`, error);
      throw error;
    }
  }

  async getChainAssetList(chainName: string) {
    if (!this.chainNames.includes(chainName)) {
      throw new Error(`Chain ${chainName} is not supported.`);
    }
    try {
      const assetList = await this.client.getChainAssetList(chainName);
      if (!assetList) {
        throw new Error(`Asset list for ${chainName} not found.`);
      }
      return assetList;
    } catch (error) {
      console.error(`Error fetching asset list for ${chainName}:`, error);
      throw error;
    }
  }


  async getIbcChannels(chainName: string): Promise<{
    chain1: string;
    chain2: string;
    channelId: string;
    portId: string;
  }[]> {
    if (!this.chainNames.includes(chainName)) {
      throw new Error(`Chain ${chainName} is not supported.`);
    }
  
    try {
      const ibcData: IBCData[] = await this.client.getChainIbcData(chainName);
      if (!ibcData || ibcData.length === 0) {
        throw new Error(`IBC data for ${chainName} not found.`);
      }
      console.log({ibcData})
      return ibcData.flatMap((data) =>
        data.channels.map((channel) => ({
          chain1: data.chain_1.chain_name,
          chain2: data.chain_2.chain_name,
          channelId: channel.chain_1.channel_id,
          portId: channel.chain_1.port_id,
        }))
      );
    //   return ibcData.map((data:any) => ({
    //     chain1: data.chain_1.chain_name,
    //     chain2: data.chain_2.chain_name,
    //     channelId: data.channels[0]?.channel_id || "",
    //     portId: data.channels[0]?.port_id || "transfer",
    //   }));
    } catch (error) {
      console.error(`Error fetching IBC channels for ${chainName}:`, error);
      throw error;
    }
  }
  
}
