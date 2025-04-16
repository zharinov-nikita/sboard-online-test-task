export interface EnvInterface {
  PORT: number;
  GRPC_URL: string;
  DB_TYPE: 'postgres' | string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_DROP_SCHEMA: boolean;
  MINIO_ENDPOINT: string;
  MINIO_PORT: number;
  MINIO_PUBLIC_URL: string;
  MINIO_USE_SSL: boolean;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
}
