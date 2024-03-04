import { useEffect, useState } from "react";
import { getPerpetualProgramAndProvider, POOL_CONFIG } from "@/utils/constants";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
// import {  useGlobalStore } from "@/stores/store";
// import { shallow } from "zustand/shallow";
import { isVariant, Position, Side } from "../types";
import { ViewHelper } from "../viewHelpers";
import { PositionAccount } from "@/lib/PositionAccount";

//  fetches postions from store 
//  find if any new postions and add to store
//  should fetch every 10 secods , pnl, liquidationPrice 
export function usePositions() {
  
      // for now NO store 
  // const { positions, addPosition, removePosition, setPositions } = useGlobalStore(
  //   (state) => ({
  //     positions: state.positions,
  //     addPosition: state.addPosition,
  //     removePostion: state.removePosition,
  //     setPositions: state.setPositions,
  //   }),
  //   shallow
  // );

  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();


  const [positionAccounts, setPositionAccounts] = useState<PositionAccount[]>([])

  const fetchPositions = async () => {
    if (!wallet || !connection ) return;
    if (!publicKey) {
      return;
    }
    let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);
    
    let fetchedPositions = await perpetual_program.account.position.all([
      {
        memcmp: {
          offset: 8,
          bytes: publicKey.toBase58(),
        },
      },
    ]);

    fetchedPositions = fetchedPositions.filter(t => t.account.pool.toBase58() === POOL_CONFIG.poolAddress.toBase58())
    // check new positions added 
    //  Also note add new postions as soon as user takes postions or just call this function

    let { provider } = await getPerpetualProgramAndProvider(wallet as any);
    const View = new ViewHelper(connection, provider );
    let data : PositionAccount[] = [];

    for  (const accInfo of fetchedPositions) {
      // for now NO store 
      // if(!positions.has(accInfo.publicKey.toBase58())){
      //   addPosition(accInfo.publicKey.toBase58(), accInfo.account as unknown as Position)
      // }
      // console.log("fetchedPositions accInfo.account:",accInfo.account, accInfo.account.side,  isVariant(accInfo.account.side, 'long') , isVariant(accInfo.account.side, 'short'))
      let posAcc =  await PositionAccount.from(View,accInfo.publicKey, accInfo.account as unknown as Position);
      data.push(posAcc);
    }

    // console.log(">>>>> usePositions positionAccounts:",data, data.length)
    setPositionAccounts(data);
  };


  // useEffect(() => {
  //   (async () => {
  //     await fetchPositions()
  //   })()
  // }, [publicKey])
  

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(() => {
      console.log("usePositions timer again")
         fetchPositions()
      }, 30000);
      return () => clearInterval(interval);
  }, [publicKey])


  // also sends fetchPositions() as a callback
  return { positionAccounts, fetchPositions };
}
