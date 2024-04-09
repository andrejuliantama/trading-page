import { BaseService } from "./BaseService";

export class StockService implements BaseService {
  index: (params: any) => Promise<any>;
  byId: (id: string) => Promise<any>;
  create: (params: any) => Promise<any>;
  update: (id: string, params: any) => Promise<any>;
  delete: (id: string, params: any) => Promise<any>;
  count?: (() => Promise<number>) | undefined;
}
