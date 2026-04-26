import type { Request, Response } from 'express';
export declare const getTokens: (req: Request, res: Response) => Promise<void>;
export declare const getTokenDetail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTokenTrades: (req: Request, res: Response) => Promise<void>;
export declare const getChartData: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=tokenController.d.ts.map