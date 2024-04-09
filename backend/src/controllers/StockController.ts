import express, { Request, Response } from "express";
import { ByIdParams, PaginationQuery } from "../interfaces/base/req";
import { StockService } from "../services/StockService";

const stockService: StockService = new StockService();

export class StockController {
  routes = express.Router();

  constructor() {
    this.routes.get("/", this.fetchStocks);
    this.routes.get("/:id/", this.fetchStock);
  }

  private async fetchStocks(
    req: Request<any, any, any, PaginationQuery>,
    res: Response
  ) {
    try {
      const response = await stockService.index(req.query);

      res.send(response);
    } catch (error) {
      const errors = (error as any)?.message.split("\n");

      res.status(500).send({ message: errors });
    }
  }

  private async fetchStock(req: Request<ByIdParams, any, any>, res: Response) {
    try {
      const response = await stockService.byId(req.params.id);

      res.send(response);
    } catch (error) {
      const errors = (error as any)?.message.split("\n");

      res.status(500).send({ message: errors });
    }
  }
}
