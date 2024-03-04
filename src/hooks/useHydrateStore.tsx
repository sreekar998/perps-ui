import { useGlobalStore } from '@/stores/store'
import { Custody, Pool, Position } from '@/types/index'
import { CLUSTER, DEFAULT_POOL, getPerpetualProgramAndProvider, POOL_CONFIG } from '@/utils/constants'
import { toUiDecimals } from '@/utils/displayUtils'
import { PoolConfig } from '@/utils/PoolConfig'
import { checkIfAccountExists } from '@/utils/retrieveData'
import { TokenAccount } from '@metaplex-foundation/js'
import { BN } from '@project-serum/anchor'
import { AccountLayout, getAssociatedTokenAddress, getMint, Mint, MintLayout } from '@solana/spl-token'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, TokenAccountBalancePair } from '@solana/web3.js'
import React, { useEffect } from 'react'



export const useHydrateStore = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // const addPosition = useGlobalStore(state => state.addPosition);

  const addCustody = useGlobalStore(state => state.addCustody);
  const setPoolData = useGlobalStore(state => state.setPool);
  const setLpMintData = useGlobalStore(state => state.setLpMintData);

  const setUserLpTokensBalance = useGlobalStore(state => state.setUserLpTokensBalance);


  useEffect(() => {
    const pool = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER);
    const subIds: number[] = [];
    (async () => {

      let { perpetual_program } = await getPerpetualProgramAndProvider();
      const accountInfo = await connection.getAccountInfo(pool.poolAddress)
      if (accountInfo) {
        const poolData = perpetual_program.coder.accounts.decode<Pool>('pool', accountInfo.data);
        setPoolData(poolData)
      }
      const subId = connection.onAccountChange(new PublicKey(pool.poolAddress), (accountInfo) => {
        const poolData = perpetual_program.coder.accounts.decode<Pool>('pool', accountInfo.data);
        setPoolData(poolData)
      })

      subIds.push(subId)
    })()
  
    return () => {
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [])

  useEffect(() => {
    const pool = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER);
    const subIds: number[] = [];
    (async () => {

      // let { perpetual_program } = await getPerpetualProgramAndProvider();
      const accountInfo = await connection.getAccountInfo(pool.lpTokenMint)
      if (accountInfo) {
       
        const lpMintData =  await getMint(connection, pool.lpTokenMint)
        setLpMintData(lpMintData)
      }
      const subId = connection.onAccountChange(new PublicKey(pool.lpTokenMint), (accountInfo) => {
        const rawMint = MintLayout.decode(accountInfo.data);
        
        setLpMintData({
          address: pool.lpTokenMint,
          mintAuthority: rawMint.mintAuthorityOption ? rawMint.mintAuthority : null,
          supply: rawMint.supply,
          decimals: rawMint.decimals,
          isInitialized: rawMint.isInitialized,
          freezeAuthority: rawMint.freezeAuthorityOption ? rawMint.freezeAuthority : null,
      })
      })

      subIds.push(subId)
    })()
  
    return () => {
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [])

  useEffect(() => {
    const custodies = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER).custodies;
    // const custodies = pools.map(t => t.custodies).flat();
    const subIds: number[] = [];

    (async () => {
      // if(!wallet) return
      let { perpetual_program } = await getPerpetualProgramAndProvider();
      for (const custody of custodies) {
        const accountInfo = await connection.getAccountInfo(custody.custodyAccount)
        if(accountInfo) {
          const custodyData = perpetual_program.coder.accounts.decode<Custody>('custody', accountInfo.data);
          addCustody(custody.custodyAccount.toBase58(), custodyData)
        }
        const subId = connection.onAccountChange(custody.custodyAccount, (accountInfo) => {
          const custodyData = perpetual_program.coder.accounts.decode<Custody>('custody', accountInfo.data);
          addCustody(custody.custodyAccount.toBase58(), custodyData)
        })
        subIds.push(subId)
      }
    })()

    return () => {
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [])

// for now NO store positions just usePositions
  // useEffect(() => {
  //   // const subIds: number[] = [];
  //   (async () => {
  //     if(!wallet || !wallet.publicKey) return;

  //     let { perpetual_program } = await getPerpetualProgramAndProvider();
  //     let fetchedPositions = await perpetual_program.account.position.all([
  //       {
  //         memcmp: {
  //           offset: 8,
  //           bytes: wallet.publicKey.toBase58(),
  //         },
  //       },
  //     ]);

  //     for (const position of fetchedPositions) {
  //         addPosition(position.publicKey.toBase58(), position.account as unknown as Position)
  //       const subId = connection.onAccountChange(position.publicKey, (accountInfo) => {
  //         const positionData = perpetual_program.coder.accounts.decode<Custody>('position', accountInfo.data);
  //         addCustody(position.publicKey.toBase58(), positionData)
  //       })
  //       subIds.push(subId)
  //     }
  //   })()
  //   return () => {
  //     subIds.forEach(subId => {
  //       connection.removeAccountChangeListener(subId);
  //     });
  //   }
  // }, [])

  useEffect(() => {
    const subIds: number[] = [];
    (async () => {
      if(!wallet || !wallet.publicKey) return;

      // let { perpetual_program } = await getPerpetualProgramAndProvider();

      const lpTokenAccount = await getAssociatedTokenAddress(POOL_CONFIG.lpTokenMint, wallet.publicKey);
      if (!(await checkIfAccountExists(lpTokenAccount, connection))) {
        setUserLpTokensBalance(new BN(0));
      } else {
        let accountInfo = await connection.getAccountInfo(lpTokenAccount);
        const decodedTokenAccountInfo = AccountLayout.decode(accountInfo!.data);
        setUserLpTokensBalance(new BN(decodedTokenAccountInfo.amount.toString()));

        const subId = connection.onAccountChange(lpTokenAccount, (accountInfo) => {
          // const data = perpetual_program.coder.accounts.decode<TokenAccountBalancePair>('TokenAmount', accountInfo.data);
          // setUserLpTokensBalance(balance.value.uiAmount!);
          // need to REDO here ????? 
          // let balance = await connection.getTokenAccountBalance(lpTokenAccount);
          const decodedTokenAccountInfo = AccountLayout.decode(accountInfo!.data);
          setUserLpTokensBalance(new BN(decodedTokenAccountInfo.amount.toString()));

        })
        subIds.push(subId)

      }
    })()

    return () => {
      subIds.forEach(subId => {
        connection.removeAccountChangeListener(subId);
      });
    }
  }, [wallet])


  return (
    <div>useHyderateStore</div>
  )
}
