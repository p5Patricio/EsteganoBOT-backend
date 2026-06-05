const fs = require("fs");
const validateFile = require("../../src/middleware/validateFile");
const config = require("../../src/config");

jest.mock("fs");

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
    jest.clearAllMocks();
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
      path: "uploads/test.png",
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
      path: "uploads/test.pdf",
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
      path: "uploads/test.png",
    });
    // Mock magic bytes so it doesn't fail there
    fs.openSync.mockReturnValue(1);
    fs.readSync.mockImplementation((fd, buf) => {
      const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      pngMagic.copy(buf);
      return 8;
    });

    const res = mockRes();
    validateFile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid filename" });
  });

  describe("magic bytes validation", () => {
    it("accepts valid PNG magic bytes", () => {
      const req = mockReq({
        size: 100,
        mimetype: "image/png",
        originalname: "test.png",
        path: "uploads/test.png",
      });
      fs.openSync.mockReturnValue(1);
      fs.readSync.mockImplementation((fd, buf) => {
        const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        pngMagic.copy(buf);
        return 8;
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
        path: "uploads/test.jpg",
      });
      fs.openSync.mockReturnValue(1);
      fs.readSync.mockImplementation((fd, buf) => {
        const jpegMagic = Buffer.from([0xff, 0xd8, 0xff]);
        jpegMagic.copy(buf);
        return 3;
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
        path: "uploads/fake.png",
      });
      fs.openSync.mockReturnValue(1);
      fs.readSync.mockImplementation((fd, buf) => {
        const fakeMagic = Buffer.from("notapng!");
        fakeMagic.copy(buf);
        return 8;
      });

      const res = mockRes();
      validateFile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(415);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid image format" });
    });

    it("rejects when file reading fails", () => {
      const req = mockReq({
        size: 100,
        mimetype: "image/png",
        originalname: "error.png",
        path: "uploads/error.png",
      });
      fs.openSync.mockImplementation(() => {
        throw new Error("Disk error");
      });

      const res = mockRes();
      validateFile(req, res, next);
      expect(res.status).toHaveBeenCalledWith(415);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid image format" });
    });
  });
});
