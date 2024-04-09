interface iBaseService {
  index: (params: any) => Promise<any>;
  byId: (id: string) => Promise<any>;
  create: (params: any) => Promise<any>;
  update: (id: string, params: any) => Promise<any>;
  delete: (id: string, params: any) => Promise<any>;
  count?: (params: any) => Promise<number>;
}

export abstract class BaseService implements iBaseService {
  index: (params: any) => Promise<any>;
  byId: (id: string) => Promise<any>;
  create: (params: any) => Promise<any>;
  update: (id: string, params: any) => Promise<any>;
  delete: (id: string, params: any) => Promise<any>;
  count?: (params: any) => Promise<number>;
}
