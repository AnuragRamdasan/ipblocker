import { describe, it, expect, vi } from "vitest";
import {
  getCountriesForShop,
  addCountryToShop,
  addWhitelistCountryToShop,
  addIpToShop,
  addCityToShop,
} from "../../app/models/countries";

// Mock fetch globally
global.fetch = vi.fn();

describe("Countries model", () => {
  const mockToken = "test-token";
  const mockCountry = "United States";
  const mockCountryCode = "US";
  const mockIps = ["192.168.1.1", "10.0.0.1"];
  const mockCities = ["New York", "Los Angeles"];

  beforeEach(() => {
    fetch.mockClear();
  });

  describe("getCountriesForShop", () => {
    it("should send a GET request with correct parameters", async () => {
      const mockResponse = {
        json: vi.fn().mockResolvedValue({
          countries: [{ country: mockCountry, country_code: mockCountryCode }],
        }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await getCountriesForShop(mockToken);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("ipblocker/countries.json"),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: mockToken,
          },
        },
      );
      expect(result).toEqual({
        countries: [{ country: mockCountry, country_code: mockCountryCode }],
      });
    });

    it("should throw an error if the request fails", async () => {
      const errorMessage = "Network error";
      fetch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(getCountriesForShop(mockToken)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe("addCountryToShop", () => {
    it("should send a POST request with correct parameters for blocking", async () => {
      const mockResponse = { ok: true };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await addCountryToShop(
        mockToken,
        mockCountry,
        mockCountryCode,
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("ipblocker/countries.json"),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: mockToken,
          },
          body: JSON.stringify({
            country: {
              country: mockCountry,
              country_code: mockCountryCode,
              type: "block",
            },
          }),
        },
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe("addWhitelistCountryToShop", () => {
    it("should send a POST request with correct parameters for whitelisting", async () => {
      const mockResponse = { ok: true };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await addWhitelistCountryToShop(
        mockToken,
        mockCountry,
        mockCountryCode,
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("ipblocker/countries.json"),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: mockToken,
          },
          body: JSON.stringify({
            country: {
              country: mockCountry,
              country_code: mockCountryCode,
              type: "whitelist",
            },
          }),
        },
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe("addIpToShop", () => {
    it("should send a POST request with correct parameters for adding IPs", async () => {
      const mockResponse = { ok: true };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await addIpToShop(mockToken, mockIps);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("ipblocker/ips.json"),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: mockToken,
          },
          body: JSON.stringify({
            country: { ips: mockIps },
          }),
        },
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe("addCityToShop", () => {
    it("should send a POST request with correct parameters for adding cities", async () => {
      const mockResponse = { ok: true };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await addCityToShop(mockToken, mockCities);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("ipblocker/cities.json"),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: mockToken,
          },
          body: JSON.stringify({
            cities: { cities: mockCities },
          }),
        },
      );
      expect(result).toBe(mockResponse);
    });
  });
});
