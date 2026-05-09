const fs = require("fs-extra");
const { safeRemove } = require("../../src/utils/fileCleanup");

jest.mock("fs-extra");
jest.mock("../../src/utils/logger", () => ({
  error: jest.fn(),
}));

describe("safeRemove", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("removes the file when it exists", async () => {
    fs.remove.mockResolvedValue();
    await safeRemove("/tmp/test.png");
    expect(fs.remove).toHaveBeenCalledWith("/tmp/test.png");
  });

  it("does nothing when path is falsy", async () => {
    await safeRemove(null);
    expect(fs.remove).not.toHaveBeenCalled();
  });

  it("logs error when removal fails", async () => {
    const logger = require("../../src/utils/logger");
    fs.remove.mockRejectedValue(new Error("perm denied"));
    await safeRemove("/tmp/test.png");
    expect(logger.error).toHaveBeenCalled();
  });
});
