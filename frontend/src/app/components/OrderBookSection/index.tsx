"use client";
import {
  OptionalOrder,
  Order,
  OrderBook,
  OrderType,
} from "@/app/interfaces/OrderBook";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { OrderBookSectionProps } from "./interface";
import { sumOrderQuantity } from "./util";

const OrderBookSection = (props: OrderBookSectionProps) => {
  const { currentPrice } = props;

  const [socket, setSocket] = useState<WebSocket>();
  const [price, setPrice] = useState<number>();
  const [orderBook, setOrderBook] = useState<OrderBook>({ asks: {}, bids: {} });
  const [order, setOrder] = useState<OptionalOrder>();

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    sessionId &&
      setOrder((prevOrder) => ({
        ...prevOrder,
        userId: sessionId,
      }));
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    ws.onmessage = (event) => {
      const data: OrderBook = JSON.parse(event.data);
      setOrderBook(data);
    };

    setSocket(ws);

    return () => {
      console.log("closing connection");
      setSocket(undefined);
      ws.close();
    };
  }, []);

  const handleOrder = (type: OrderType) => () => {
    socket?.send(JSON.stringify({ type, order }));
  };

  const handleSetToCurrentPrice = () => {
    setPrice(currentPrice);
  };

  const handlePriceOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setPrice(+value === 0 ? undefined : +value);
  };

  const handleAmountOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    price &&
      setOrder((prevOrder) => ({
        ...prevOrder,
        price: price,
        quantity: +value === 0 ? undefined : +value,
      }));
  };

  const handleTotalOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    price &&
      setOrder((prevOrder) => ({
        ...prevOrder,
        price: price,
        quantity: +value === 0 ? undefined : +value / price,
      }));
  };

  return (
    <div className="w-1/3">
      <div className="text-2xl font-bold">Order Book</div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex flex-col">
          <div>Price</div>
          <input
            className="bg-gray-900 p-2 rounded"
            placeholder="Price (USDT)"
            onChange={handlePriceOnChange}
            type="number"
            value={price}
          />
          <button
            className="text-xs mt-2 w-fit text-gray-600 self-end"
            onClick={handleSetToCurrentPrice}
          >
            Set to current price
          </button>
        </div>
        <div className="flex flex-col">
          <div>Amount</div>
          <input
            className="bg-gray-900 p-2 rounded"
            placeholder="Amount (ETH)"
            onChange={handleAmountOnChange}
            type="number"
            value={order?.quantity}
          />
        </div>
        <div className="flex justify-between">
          <div className="text-neutral-400">Available</div>
          <div>100.000 USDT</div>
        </div>
        <div className="flex flex-col">
          <div>Total</div>
          <input
            className="bg-gray-900 p-2 rounded"
            placeholder="Total (USDT)"
            onChange={handleTotalOnChange}
            type="number"
            value={
              order?.quantity && price ? order.quantity * price : undefined
            }
          />
        </div>

        <div className="flex justify-center gap-2 mt-2">
          <button
            className="px-12 py-3 bg-green-400 rounded"
            onClick={handleOrder(OrderType.BUY)}
          >
            BUY
          </button>
          <button
            className="px-12 py-3 bg-red-500 rounded"
            onClick={handleOrder(OrderType.SELL)}
          >
            SELL
          </button>
        </div>
      </div>
      <div className="text-center text-4xl my-4">{currentPrice}</div>
      <div className="flex gap-2 w-full mt-2">
        <div className="w-full">
          <div className="flex w-full justify-between">
            <div>Quantity</div>
            <div>Bids</div>
          </div>
          {Object.keys(orderBook.bids).map((price, i) => {
            console.log("bids");
            console.log(orderBook.bids[price]);
            return orderBook.bids?.[price] ? (
              <div
                key={"bid" + i}
                className="flex w-full justify-between text-green-400"
              >
                <div className="py-1">
                  {sumOrderQuantity(orderBook.bids?.[price] ?? [])}
                </div>
                <div className="py-1">{price}</div>
              </div>
            ) : (
              <></>
            );
          })}
        </div>
        <div className="w-full">
          <div className="flex w-full justify-between">
            <div>Asks</div>
            <div>Quantity</div>
          </div>
          {Object.keys(orderBook.asks).map((price, i) => {
            console.log("asks");
            console.log(orderBook.asks);
            return orderBook.asks?.[price] ? (
              <div
                key={"bid" + i}
                className="flex w-full justify-between text-red-400"
              >
                <div className="py-1">{price}</div>
                <div className="py-1">
                  {sumOrderQuantity(orderBook.asks[price])}
                </div>
              </div>
            ) : (
              <></>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderBookSection;
