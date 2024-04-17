import { Order } from "@/interfaces/OrderBook";

export const sumOrderQuantity = (orders: Order[]): number => {
  return orders.reduce((total, order) => {
    return (total = total + order.quantity);
  }, 0);
};
