import { CLUSTER, POOL_CONFIG } from '@/utils/constants';
import { getPythProgramKeyForCluster, PythConnection, PythHttpClient } from '@pythnetwork/client';
import { useConnection } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PythPriceState {
  prices: Map<string, number>;
  setPrices: (symbol: string, price: number) => void;
}


const usePriceStore = create<PythPriceState>()(
  devtools((set, get) => ({

    prices: new Map<string, number>(),
    setPrices: (symbol: string, price: number) => set((state) => {
      if(get().prices.get(symbol) === price) return {prices: get().prices}
      const nprices = new Map<string, number>(state.prices);
      nprices.set(symbol, price)
      return { prices: nprices }
    }),


  }),
    {
      serialize: {
        options: {
          map: true,
          set: true,
          function: true,
          date: true
        }
      } as any
    }
  )
);

export function usePythPrices() {
  const { connection } = useConnection();
  
  const prices = usePriceStore(state => state.prices);
  const setPrices = usePriceStore(state => state.setPrices);

  const tokens = POOL_CONFIG.tokens;

  const pythConnection = new PythConnection(connection, getPythProgramKeyForCluster('devnet'))

  const fetchPrices = async () => {
    if (!connection) return;

    const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(CLUSTER));
    const data = await pythClient.getData();

    for (let token of tokens) {
      const price = data.productPrice.get(token.pythTicker);
      setPrices(token.symbol, price?.aggregate.price!)
    }
    // setPrices(prices)
  }

  useEffect(() => {
    fetchPrices();

    if (connection) {
      pythConnection.onPriceChange((product, price) => {
        const token = tokens.find(f => f.pythTicker === product.symbol)
        if (token) {
          setPrices(token.symbol, price.price ?? 0)
        }  
      })
      pythConnection.start()
    }

    return () => { pythConnection.stop() }
  }, [connection])


  return { prices }
}
