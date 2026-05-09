const steggy = require("steggy");
const stegoService = require("../../src/services/stegoService");

jest.mock("steggy");
jest.mock("../../src/utils/logger");

describe("stegoService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("conceal", () => {
    it("calls steggy.conceal with password and returns result buffer", async () => {
      const mockConcealInner = jest.fn().mockReturnValue(Buffer.from("stego-image"));
      steggy.conceal.mockReturnValue(mockConcealInner);

      const result = await stegoService.conceal(
        "secret",
        Buffer.from("original"),
        "test.png"
      );

      expect(steggy.conceal).toHaveBeenCalledWith("");
      expect(mockConcealInner).toHaveBeenCalledWith(
        Buffer.from("original"),
        "secret"
      );
      expect(result.toString()).toBe("stego-image");
    });

    it("throws STEGGY_ERROR on steggy failure", async () => {
      const mockConcealInner = jest.fn().mockImplementation(() => {
        throw new Error("bad image");
      });
      steggy.conceal.mockReturnValue(mockConcealInner);

      await expect(
        stegoService.conceal("secret", Buffer.from("original"), "test.png")
      ).rejects.toMatchObject({
        message: "Processing failed",
        code: "STEGGY_ERROR",
      });
    });
  });

  describe("reveal", () => {
    it("calls steggy.reveal with password and returns message", async () => {
      const mockRevealInner = jest.fn().mockReturnValue("hidden message");
      steggy.reveal.mockReturnValue(mockRevealInner);

      const result = await stegoService.reveal(Buffer.from("original"), "test.png");

      expect(steggy.reveal).toHaveBeenCalledWith("");
      expect(mockRevealInner).toHaveBeenCalledWith(Buffer.from("original"));
      expect(result).toBe("hidden message");
    });

    it("throws STEGGY_ERROR on steggy failure", async () => {
      const mockRevealInner = jest.fn().mockImplementation(() => {
        throw new Error("bad image");
      });
      steggy.reveal.mockReturnValue(mockRevealInner);

      await expect(
        stegoService.reveal(Buffer.from("original"), "test.png")
      ).rejects.toMatchObject({
        message: "Processing failed",
        code: "STEGGY_ERROR",
      });
    });
  });
});
