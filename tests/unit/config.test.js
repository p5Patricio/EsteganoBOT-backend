describe("config validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses defaults when env is missing", () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.CORS_ORIGIN;
    const config = require("../../src/config");
    expect(config.PORT).toBe(3000);
    expect(config.NODE_ENV).toBe("development");
  });

  it("throws on invalid PORT", () => {
    process.env.PORT = "abc";
    expect(() => require("../../src/config")).toThrow("Invalid PORT");
  });

  it("throws on invalid RATE_LIMIT_WINDOW_MS", () => {
    process.env.RATE_LIMIT_WINDOW_MS = "abc";
    expect(() => require("../../src/config")).toThrow("Invalid RATE_LIMIT_WINDOW_MS");
  });

  it("throws on out-of-range PORT", () => {
    process.env.PORT = "99999";
    expect(() => require("../../src/config")).toThrow("Invalid PORT");
  });

  it("throws on too-small RATE_LIMIT_WINDOW_MS", () => {
    process.env.RATE_LIMIT_WINDOW_MS = "500";
    expect(() => require("../../src/config")).toThrow("Invalid RATE_LIMIT_WINDOW_MS");
  });
});
