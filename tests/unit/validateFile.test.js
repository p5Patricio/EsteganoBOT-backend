const validateFile = require("../../src/middleware/validateFile");
const config = require("../../src/config");

function mockReq(file, body = {}) {
  return { file, body };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const next = jest.fn();

describe("validateFile", () => {
  beforeEach(() => {
    next.mockClear();
  });

  it("returns 400 when no file is provided", () => {
    const req = mockReq(null);
    const res = mockRes();
    validateFile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Image is required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 413 when file exceeds max size", () => {
    const req = mockReq({
      size: config.MAX_FILE_SIZE_BYTES + 1,
      mimetype: "image/png",
      originalname: "test.png",
    });
    const res = mockRes();
    validateFile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      error: "File too large",
      maxBytes: config.MAX_FILE_SIZE_BYTES,
    });
  });

  it("returns 415 for unsupported MIME type", () => {
    const req = mockReq({
      size: 100,
      mimetype: "application/pdf",
      originalname: "test.pdf",
    });
    const res = mockRes();
    validateFile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({ error: "Unsupported file type" });
  });

  it("returns 415 for unsupported extension", () => {
    const req = mockReq({
      size: 100,
      mimetype: "image/png",
      originalname: "test.gif",
    });
    const res = mockRes();
    validateFile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({ error: "Unsupported file type" });
  });

  it("returns 400 for invalid filename", () => {
    const req = mockReq({
      size: 100,
      mimetype: "image/png",
      originalname: "test<>name.png",
    });
    const res = mockRes();
    validateFile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid filename" });
  });

  it("returns 400 when message is too long", () => {
    const req = mockReq(
      {
        size: 100,
        mimetype: "image/png",
        originalname: "test.png",
      },
      { message: "x".repeat(1001) }
    );
    const res = mockRes();
    validateFile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Message too long", maxChars: 1000 });
  });

  it("calls next when file and message are valid", () => {
    const req = mockReq(
      {
        size: 100,
        mimetype: "image/png",
        originalname: "test.png",
      },
      { message: "hello" }
    );
    const res = mockRes();
    validateFile(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.file.sanitizedName).toBe("test.png");
  });

  it("calls next for reveal route without message body", () => {
    const req = mockReq({
      size: 100,
      mimetype: "image/jpeg",
      originalname: "test.jpg",
    });
    const res = mockRes();
    validateFile(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
