const request = require("supertest");
const createApp = require("../../src/app");
const steggy = require("steggy");

jest.mock("steggy");

const app = createApp();

function createFakePng() {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...new Array(20).fill(0)
  ]);
}

describe("Integration: API routes", () => {
  describe("GET /api/health", () => {
    it("returns 200 and ok status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("POST /api/hide", () => {
    it("returns 200 with image attachment on success", async () => {
      steggy.conceal.mockReturnValue(() => Buffer.from("stego-image"));

      const res = await request(app)
        .post("/api/hide")
        .attach("image", createFakePng(), "test.png")
        .field("message", "hello");

      expect(res.status).toBe(200);
      expect(res.headers["content-disposition"]).toMatch(/attachment/);
    });

    it("returns 400 when message is missing", async () => {
      const res = await request(app)
        .post("/api/hide")
        .attach("image", createFakePng(), "test.png");

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("returns 415 for non-image file", async () => {
      const res = await request(app)
        .post("/api/hide")
        .attach("image", Buffer.from("not an image"), "test.txt")
        .field("message", "hello");

      expect(res.status).toBe(415);
      expect(res.body.error).toBe("Unsupported file type");
    });

    it("returns 413 for oversized file", async () => {
      const big = Buffer.alloc(6 * 1024 * 1024);
      const res = await request(app)
        .post("/api/hide")
        .attach("image", big, "big.png")
        .field("message", "hello");

      expect(res.status).toBe(413);
      expect(res.body.maxBytes).toBe(5242880);
    });

    it("returns 500 when steggy throws", async () => {
      steggy.conceal.mockReturnValue(() => {
        throw new Error("corrupt");
      });

      const res = await request(app)
        .post("/api/hide")
        .attach("image", createFakePng(), "test.png")
        .field("message", "hello");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Processing failed");
      expect(res.body.code).toBe("STEGGY_ERROR");
    });
  });

  describe("POST /api/reveal", () => {
    it("returns 200 with hidden message on success", async () => {
      steggy.reveal.mockReturnValue(() => "secret msg");

      const res = await request(app)
        .post("/api/reveal")
        .attach("image", createFakePng(), "test.png");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "secret msg" });
    });

    it("returns 400 when image is missing", async () => {
      const res = await request(app).post("/api/reveal");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Image is required");
    });

    it("returns 500 when steggy throws", async () => {
      steggy.reveal.mockReturnValue(() => {
        throw new Error("corrupt");
      });

      const res = await request(app)
        .post("/api/reveal")
        .attach("image", createFakePng(), "test.png");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Processing failed");
      expect(res.body.code).toBe("STEGGY_ERROR");
    });
  });

  describe("Rate limiting", () => {
    it("returns 429 after exceeding limit", async () => {
      const testApp = createApp();
      // Make many requests quickly to trigger rate limit
      for (let i = 0; i < 105; i++) {
        await request(testApp).get("/api/health");
      }
      const res = await request(testApp).get("/api/health");
      expect(res.status).toBe(429);
      expect(res.body.error).toBe("Too many requests");
      expect(res.body.retryAfter).toBeDefined();
    });
  });
});
