// Define the Payload type for JWT
export interface Payload {
  id: string; // The auth's ID
  username: string; // The auth's username
  type?: string; // The token type
}
