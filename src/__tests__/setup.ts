import "@testing-library/jest-dom";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
process.env.NEXT_PUBLIC_STELLAR_RPC_URL = "https://soroban-testnet.stellar.org";
process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID =
  "CANWI4UO2NHX3PJD6VDSHTXJHNPRBATL5VRBDCNQATUQW2LUWF4YM4JP";
process.env.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
process.env.NEXT_PUBLIC_HORIZON_URL = "https://horizon-testnet.stellar.org";
process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

// Silence console.error in tests (optional)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render")
    )
      return;
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
