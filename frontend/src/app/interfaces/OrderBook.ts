export enum OrderType {
  BUY = "BUY",
  SELL = "SELL",
}

export interface Order {
  userId: string;
  price: number;
  quantity: number;
}

export interface OptionalOrder {
  userId?: string;
  price?: number;
  quantity?: number;
}

export interface OrderBook {
  asks: {
    [price: string]: Order[];
  };
  bids: {
    [price: string]: Order[];
  };
}
