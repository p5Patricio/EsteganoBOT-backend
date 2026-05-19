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
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
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
      buffer: Buffer.from("pdf content"),
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
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
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
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
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
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
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
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
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
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    });
    const res = mockRes();
    validateFile(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  describe("magic bytes validation", () => {
    it("accepts valid PNG magic bytes", () => {
      const req = mockReq({
        size: 100,
        mimetype: "image/png",
        originalname: "test.png",
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      });
      const res = mockRes();
      validateFile(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("accepts valid JPEG magic bytes", () => {
      const req = mockReq({
        size: 100,
        mimetype: "image/jpeg",
        originalname: "test.jpg",
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xdb]),
      });
      const res = mockRes();
      validateFile(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("rejects PNG extension with invalid magic bytes", () => {
      const req = mockReq({
        size: 100,
        mimetype: "image/png",
        originalname: "fake.png",
        buffer: Buffer.from("this is a text file, not a png"),
      });
      const res = mockRes();
      validateFile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(415);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid image format" });
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects JPEG extension with invalid magic bytes", () => {
      const req = mockReq({
        size: 100,
        mimetype: "image/jpeg",
        originalname: "fake.jpg",
        buffer: Buffer.from("not a jpeg"),
      });
      const res = mockRes();
      validateFile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(415);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid image format" });
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects empty buffer", () => {
      const req = mockReq({
        size: 0,
        mimetype: "image/png",
        originalname: "empty.png",
        buffer: Buffer.alloc(0),
      });
      const res = mockRes();
      validateFile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(415);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid image format" });
    });

    it("rejects buffer too small for magic bytes", () => {
      const req = mockReq({
        size: 2,
        mimetype: "image/png",
        originalname: "small.png",
        buffer: Buffer.from([0x89, 0x50]),
      });
      const res = mockRes();
      validateFile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(415);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid image format" });
    });
  });
});
