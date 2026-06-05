const errorHandler = require("../../src/middleware/errorHandler");
const logger = require("../../src/utils/logger");
const config = require("../../src/config");

jest.mock("../../src/utils/logger");
jest.mock("../../src/config", () => ({
  NODE_ENV: "production",
  MAX_FILE_SIZE_BYTES: 5242880,
}));

describe("errorHandler", () => {
  let req, res, next;

  beforeEach(() => {
    req = { path: "/test", method: "GET" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("sanitizes 500 errors in production", () => {
    const err = new Error("Database connection leaked credentials");
    err.status = 500;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it("shows error details for non-500 errors in production", () => {
    const err = new Error("Custom error message");
    err.status = 400;
    err.code = "BAD_REQUEST";

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Custom error message",
      code: "BAD_REQUEST",
    });
  });

  it("shows error details when not in production", () => {
    config.NODE_ENV = "development";
    const err = new Error("Sensitive error message");
    err.status = 500;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Sensitive error message",
    });
    
    // Reset back for other tests
    config.NODE_ENV = "production";
  });

  it("handles LIMIT_FILE_SIZE error correctly", () => {
    const err = { code: "LIMIT_FILE_SIZE" };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: "File too large",
    }));
  });
});
