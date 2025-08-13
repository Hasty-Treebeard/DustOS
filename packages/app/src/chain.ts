import {
  type ClientConfig,
  createPublicClient,
  fallback,
  http,
  webSocket,
} from "viem";
import { redstone } from "./mud/redstone"

const clientOptions = {
  chain: redstone,
  transport: fallback([webSocket(), http()]),
  pollingInterval: 2_000,
} as const satisfies ClientConfig;

export const publicClient = createPublicClient(clientOptions);