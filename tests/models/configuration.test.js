import { describe, it, expect, vi } from "vitest";
import { addOrCreateConfig, getConfig } from "../../app/models/configuration";

// Mock fetch globally
global.fetch = vi.fn();

describe("Configuration model", () => {
  const mockToken = "test-token";
  const mockConfig = {
    key1: "value1",
    key2: "value2",
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  describe("addOrCreateConfig", () => {
    it("should send a POST request with correct parameters", async () => {
      const mockResponse = { ok: true };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await addOrCreateConfig(mockToken, mockConfig);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("configurations.json"),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: mockToken,
          },
          body: JSON.stringify({
            configuration: [
              { key: "key1", value: "value1" },
              { key: "key2", value: "value2" },
            ],
          }),
        },
      );
      expect(result).toBe(mockResponse);
    });

    it("should throw an error if the request fails", async () => {
      const errorMessage = "Network error";
      fetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(addOrCreateConfig(mockToken, mockConfig)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe("getConfig", () => {
    it("should send a GET request with correct parameters", async () => {
      const mockResponse = {
        json: vi.fn().mockResolvedValue({ configuration: mockConfig }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await getConfig(mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("configurations.json"),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: mockToken,
          },
        },
      );
      expect(result).toEqual(mockConfig);
    });

    it("should throw an error if the request fails", async () => {
      const errorMessage = "Network error";
      fetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(getConfig(mockToken)).rejects.toThrow(errorMessage);
    });
  });
});
