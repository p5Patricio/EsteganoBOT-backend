const logger = require("../../src/utils/logger");

describe("logger", () => {
  it("info logs structured message", () => {
    const spy = jest.spyOn(console, "log").mockImplementation();
    logger.info("test", { foo: "bar" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("error logs structured message", () => {
    const spy = jest.spyOn(console, "error").mockImplementation();
    logger.error("test", { foo: "bar" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("warn logs structured message", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation();
    logger.warn("test", { foo: "bar" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
