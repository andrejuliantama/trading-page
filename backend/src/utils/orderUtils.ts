import { Order, OrderType } from "../interfaces/order";

export const generateNewOrders = (
  type: OrderType,
  currentOrders: Order[],
  newOrder: Order
): Order[] => {
  const newOrders: Order[] = [...currentOrders];
  const matchingOrderIndex = currentOrders.findIndex(
    (currentOrder) => currentOrder.price === newOrder.price
  );

  // matching order found
  if (matchingOrderIndex > -1) {
    const updatedOrder: Order = {
      ...currentOrders[matchingOrderIndex],
      quantity: currentOrders[matchingOrderIndex].quantity + newOrder.quantity,
    };

    newOrders[matchingOrderIndex] = updatedOrder;
  } else {
    newOrders.push(newOrder);
  }

  return newOrders.sort((a, b) => {
    if (type === OrderType.BUY) {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });
};

export const processOrderTrade = (
  type: OrderType,
  currentOrders: Order[],
  newOrder: Order
): Order[] => {
  const newOrders: Order[] = [...currentOrders];
  // prevent processing user's own order
  const matchingOrderIndex = currentOrders.findIndex(
    (currentOrder) =>
      currentOrder.price === newOrder.price &&
      currentOrder.userId !== newOrder.userId
  );

  // matching order found
  if (matchingOrderIndex > -1) {
    const updatedOrder: Order = {
      ...currentOrders[matchingOrderIndex],
      quantity: currentOrders[matchingOrderIndex].quantity - newOrder.quantity,
    };

    newOrders[matchingOrderIndex] = updatedOrder;
  } else {
    newOrders.push(newOrder);
  }

  return newOrders.sort((a, b) => {
    if (type === OrderType.BUY) {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });
};
