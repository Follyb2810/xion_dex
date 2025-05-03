import { useAuth } from "@/context/useAuth";
import useMeta from "@/hook/useMeta";
import { uxionToXion } from "@/helper/convert";
import { DeliverTxResponse } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useState } from "react";
// import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
// import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
// import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx";

export default function useXion() {
  const { bech32Address, isConnected, isConnecting, queryClient, signingClient, signArb } = useMeta();
  const { user } = useAuth();
  const [signArbResponse, setSignArbResponse] = useState<string>("");

  console.log({ user, isConnecting });

  useEffect(() => {
    console.log("Client details:", {
      type: signingClient?.constructor.name,
      rpc: signingClient?.getChainId(),
      granteeAddress: signingClient?.granteeAddress,
    });
    if (signingClient) {
      handleSign();
    }
  }, [signingClient]);

  const handleSign = async (): Promise<void> => {
    if (signingClient?.granteeAddress) {
      const response = await signArb?.(signingClient.granteeAddress, "abstraxion challenge");
      console.log(response, "from handle sign");
      if (response) setSignArbResponse(response);
    }
  };

  // const grantPermission = async () => {
  //   if (!signingClient || !bech32Address) {
  //     throw new Error("Wallet is not connected properly for granting.");
  //   }
  //   console.log('grantPermission 1')
    
  //   const grantee = signingClient.granteeAddress;
  //   if (!grantee) {
  //     throw new Error("No grantee address available.");
  //   }
  //   console.log('grantPermission 2')
    
  //   const now = new Date();
  //   const expiration = new Date(now.getTime() + 60 * 60 * 24 * 1000); // 1 day later
  //   console.log('grantPermission 3')
  //   // const timestamp = Timestamp.fromPartial({
  //     //   seconds: Math.floor(expiration.getTime() / 1000),
  //     //   nanos: 0,
  //     // });
  //     const timestamp = Timestamp.fromPartial({
  //       seconds: BigInt(Math.trunc(expiration.getTime() / 1000)),
  //       nanos: 0,
  //     });
  //     console.log('grantPermission 4')
      
      
  //     const grantMsg: MsgGrant = {
  //       granter: bech32Address,
  //       grantee: grantee,
  //       grant: {
  //         authorization: {
  //           typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
  //           value: GenericAuthorization.encode({
  //             msg: "/cosmos.bank.v1beta1.MsgSend",
  //         }).finish(),
  //       },
  //       expiration: timestamp,
  //     },
  //   };
  //   console.log('grantPermission 5')
    
  //   const fee = "auto"; 
  //   const result = await signingClient.signAndBroadcast(bech32Address, [
  //     {
  //       typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
  //       value: grantMsg,
  //     },
  //   ], fee);
    
  //   console.log('grantPermission 6')
  //   console.log("Grant result:", result);
  //   if (result.code !== 0) {
  //     throw new Error(`Grant failed: ${result.msgResponses}`);
  //   }
  //   console.log('grantPermission 7')
  //   return result
  // };
  
    // xion1rs2tnhe4mxpjnedhc84pc0v7mcy5gtmglx8896
      // xion148yayskhtz68wt72sdh9v372ux3a0n7qeu65sl7hcmxtqtaddnqqphlz5y

  const transferToken = async (
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    denom = "uxion"
  ) => {
    console.log({senderAddress,recipientAddress,amount,denom})
    if (!isConnected || !signingClient) {
      throw new Error("Wallet not connected properly.");
    }
    if (senderAddress !== bech32Address) {
      throw new Error("Sender address doesn't match connected wallet.");
    }
    if (!recipientAddress || Number(amount) <= 0) {
      throw new Error("Invalid recipient address or amount.");
    }
    if (!signArbResponse) {
      throw new Error("Grant signature not found. Please sign the transaction first.");
    }

    console.log('Proceeding with token transfer...');

    const balance = await queryClient?.getBalance(senderAddress, denom);
    const formattedAmount = Math.floor(Number(amount) * 1e6).toString();
    const totalNeeded = Number(formattedAmount) + 1000; 
    if (!balance || Number(balance.amount) < totalNeeded) {
      throw new Error(`Insufficient balance. Available: ${uxionToXion(balance?.amount || "0")} ${denom}`);
    }

    const funds = [{ denom, amount: formattedAmount }];
    const response: DeliverTxResponse = await signingClient.sendTokens(
      senderAddress,
      recipientAddress,
      funds,
      "auto"
    );

    console.log("Tokens transferred successfully:", response.transactionHash);
    return response;
  };

  const getMetaBalance = async (address: string, denom = "uxion") => {
    if (!queryClient) {
      throw new Error("Query client is not initialized.");
    }
    try {
      const bal = await queryClient.getBalance(address, denom);
      return bal?.amount ? uxionToXion(bal.amount) : undefined;
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const getWalletQuery = async () => {
    if (!queryClient) throw new Error("Query client not initialized.");
    try {
      const response = await queryClient.queryContractSmart("", { get_count: {} });
      console.log(response);
    } catch (error) {
      console.error("Error querying wallet:", error);
    }
  };

  return {
    transferToken,
    getMetaBalance,
    getWalletQuery,
    handleSign,
    signArbResponse,
    // grantPermission
  };
}
