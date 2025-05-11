// Define the CORS config type based on the JSON structure
export type CorsConfig = {
  allowedOrigins: string[];
  allowedHeaders: string[];
  allowedMethods: string[];
  exposedHeaders: string[];
  credentials: boolean;
};
