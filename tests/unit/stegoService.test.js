const steggy = require("steggy");
const stegoService = require("../../src/services/stegoService");

jest.mock("steggy");
jest.mock("../../src/utils/logger");

describe("stegoService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("conceal", () => {
    it("calls steggy.conceal with empty password by default", async () => {
      const mockConcealInner = jest.fn().mockReturnValue(Buffer.from("stego-image"));
      steggy.conceal.mockReturnValue(mockConcealInner);

      const result = await stegoService.conceal(
        "secret message",
        Buffer.from("original-image")
      );

      expect(steggy.conceal).toHaveBeenCalledWith("");
      expect(mockConcealInner).toHaveBeenCalledWith(
        Buffer.from("original-image"),
        "secret message"
      );
      expect(result.toString()).toBe("stego-image");
    });

    it("calls steggy.conceal with provided password", async () => {
      const mockConcealInner = jest.fn().mockReturnValue(Buffer.from("protected-image"));
      steggy.conceal.mockReturnValue(mockConcealInner);

      const result = await stegoService.conceal(
        "secret message",
        Buffer.from("original-image"),
        "mypassword"
      );

      expect(steggy.conceal).toHaveBeenCalledWith("mypassword");
      expect(mockConcealInner).toHaveBeenCalledWith(
        Buffer.from("original-image"),
        "secret message"
      );
      expect(result.toString()).toBe("protected-image");
    });

    it("throws STEGGY_ERROR on steggy failure", async () => {
      const mockConcealInner = jest.fn().mockImplementation(() => {
        throw new Error("bad image");
      });
      steggy.conceal.mockReturnValue(mockConcealInner);

      await expect(
        stegoService.conceal("secret", Buffer.from("original"))
      ).rejects.toMatchObject({
        message: "Processing failed",
        code: "STEGGY_ERROR",
      });
    });
  });

  describe("reveal", () => {
    it("calls steggy.reveal with empty password by default", async () => {
      const mockRevealInner = jest.fn().mockReturnValue("hidden message");
      steggy.reveal.mockReturnValue(mockRevealInner);

      const result = await stegoService.reveal(Buffer.from("stego-image"));

      expect(steggy.reveal).toHaveBeenCalledWith("");
      expect(mockRevealInner).toHaveBeenCalledWith(Buffer.from("stego-image"));
      expect(result).toBe("hidden message");
    });

    it("calls steggy.reveal with provided password", async () => {
      const mockRevealInner = jest.fn().mockReturnValue("protected message");
      steggy.reveal.mockReturnValue(mockRevealInner);

      const result = await stegoService.reveal(Buffer.from("stego-image"), "mypassword");

      expect(steggy.reveal).toHaveBeenCalledWith("mypassword");
      expect(mockRevealInner).toHaveBeenCalledWith(Buffer.from("stego-image"));
      expect(result).toBe("protected message");
    });

    it("throws STEGGY_ERROR on steggy failure", async () => {
      const mockRevealInner = jest.fn().mockImplementation(() => {
        throw new Error("wrong password or bad image");
      });
      steggy.reveal.mockReturnValue(mockRevealInner);

      await expect(
        stegoService.reveal(Buffer.from("original"))
      ).rejects.toMatchObject({
        message: "Processing failed",
        code: "STEGGY_ERROR",
      });
    });
  });
});
