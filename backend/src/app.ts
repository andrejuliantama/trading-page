import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import * as http from "http";
import WebSocket from "ws";
import { OrderBook, OrderType, Order } from "./interfaces/order";
import { generateNewOrders, processOrderTrade } from "./utils/orderUtils";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.plugins();
  }

  protected plugins(): void {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.use(cors());
  }
}

const app = new App().app;

// Handle unknown routes
app.use((_, res) => {
  res.status(400).send({ message: "Route Not Found" });
});

// Error handler
app.use((err: Error, _: Request, res: Response) => {
  const message = err.message || "Internal Server Error";
  res.status(500).send({ message });
});

let port = Number(process.env.APP_PORT);
if (isNaN(port)) port = 8000;

const server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

http.createServer(server);
const webSocketServer = new WebSocket.Server({ server, path: "/ws" });

let orderBook: OrderBook = {
  asks: {},
  bids: {},
};

webSocketServer.on("connection", (socket: WebSocket) => {
  console.log("Client connected");

  socket.onmessage = (event: WebSocket.MessageEvent) => {
    const message = event.data.toString();
    console.log(`Received message: ${message}`);
    const transaction: { type: OrderType; order: Order } = JSON.parse(message);

    // add new bids/asks
    if (transaction.type === OrderType.BUY) {
      orderBook = {
        ...orderBook,
        asks: {
          ...orderBook.asks,
          [transaction.order.price]: generateNewOrders(
            transaction.type,
            orderBook.asks?.[transaction.order.price] ?? [],
            transaction.order
          ),
        },
      };
    } else {
      orderBook = {
        ...orderBook,
        bids: {
          ...orderBook.bids,
          [transaction.order.price]: generateNewOrders(
            transaction.type,
            orderBook.bids?.[transaction.order.price] ?? [],
            transaction.order
          ),
        },
      };
    }

    // check if there are matching asks and bids
    if (transaction.type === OrderType.BUY) {
      const matchingPrice = orderBook.bids?.[transaction.order.price];

      if (matchingPrice) {
        orderBook = {
          ...orderBook,
          bids: {
            ...orderBook.bids,
            [transaction.order.price]: processOrderTrade(
              transaction.type,
              orderBook.bids?.[transaction.order.price] ?? [],
              transaction.order
            ),
          },
        };
      }
    } else {
      const matchingPrice = orderBook.asks?.[transaction.order.price];

      if (matchingPrice) {
        orderBook = {
          ...orderBook,
          asks: {
            ...orderBook.asks,
            [transaction.order.price]: processOrderTrade(
              transaction.type,
              orderBook.asks?.[transaction.order.price] ?? [],
              transaction.order
            ),
          },
        };
      }
    }

    webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("sending message to ", client.url);
        client.send(JSON.stringify(orderBook));
      }
    });
  };

  // Handle client disconnection
  socket.on("close", () => {
    console.log("Client disconnected");
  });
});
