declare module "pg" {
  export class Client {
    constructor(config?: {
      host?: string;
      port?: number;
      user?: string;
      password?: string;
      database?: string;
    });
    connect(): Promise<void>;
    end(): Promise<void>;
    query<Row extends Record<string, unknown> = Record<string, unknown>>(
      queryText: string,
    ): Promise<{ rows: Row[]; rowCount: number | null }>;
  }
}
