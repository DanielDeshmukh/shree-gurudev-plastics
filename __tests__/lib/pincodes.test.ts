import { describe, it, expect } from "vitest";
import { checkPincode, getDeliveryMessage } from "@/lib/pincodes";

describe("pincodes", () => {
  describe("checkPincode", () => {
    it("returns info for valid Bhayander West pincode", () => {
      const result = checkPincode("401101");
      expect(result).not.toBeNull();
      expect(result!.area).toBe("Bhayander West");
      expect(result!.available).toBe(true);
      expect(result!.estimatedDays).toBe("Same day");
    });

    it("returns info for valid Naigaon pincode", () => {
      const result = checkPincode("401207");
      expect(result!.area).toBe("Naigaon (Papdi)");
    });

    it("returns info for Mumbai pincode", () => {
      const result = checkPincode("400010");
      expect(result!.area).toBe("Dadar");
      expect(result!.estimatedDays).toBe("2-3 days");
    });

    it("returns null for unknown pincode", () => {
      expect(checkPincode("999999")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(checkPincode("")).toBeNull();
    });
  });

  describe("getDeliveryMessage", () => {
    it("returns same-day message for Bhayander", () => {
      const msg = getDeliveryMessage("401101");
      expect(msg).toContain("same-day delivery");
      expect(msg).toContain("Bhayander West");
    });

    it("returns free delivery message for Vasai", () => {
      const msg = getDeliveryMessage("401201");
      expect(msg).toContain("Free delivery on orders above");
    });

    it("returns contact message for Mumbai", () => {
      const msg = getDeliveryMessage("400010");
      expect(msg).toContain("Contact us for delivery charges");
    });

    it("returns empty string for unknown pincode", () => {
      expect(getDeliveryMessage("999999")).toBe("");
    });
  });
});
