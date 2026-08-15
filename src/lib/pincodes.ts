export interface PincodeInfo {
  pincode: string;
  area: string;
  available: boolean;
  estimatedDays: string;
  deliveryCharge: string;
}

const PINCODE_DB: Record<string, PincodeInfo> = {
  "401101": { pincode: "401101", area: "Bhayander East", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401102": { pincode: "401102", area: "Bhayander West", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401201": { pincode: "401201", area: "Naigaon East", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401202": { pincode: "401202", area: "Naigaon West", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401203": { pincode: "401203", area: "Nallasopara West", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401104": { pincode: "401104", area: "Vasai East", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401105": { pincode: "401105", area: "Vasai West", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401204": { pincode: "401204", area: "Vasai", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401103": { pincode: "401103", area: "Virar East", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401106": { pincode: "401106", area: "Virar West", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "400001": { pincode: "400001", area: "Mumbai Fort", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400003": { pincode: "400003", area: "Mumbai Kalbadevi", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400004": { pincode: "400004", area: "Mumbai Masjid", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400005": { pincode: "400005", area: "Mumbai Dhobitalao", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400010": { pincode: "400010", area: "Mumbai Dadar", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400012": { pincode: "400012", area: "Mumbai Parel", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400016": { pincode: "400016", area: "Mumbai Wadala", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400019": { pincode: "400019", area: "Mumbai Matunga", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400020": { pincode: "400020", area: "Mumbai Sion", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400022": { pincode: "400022", area: "Mumbai Mahim", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400030": { pincode: "400030", area: "Mumbai Bandra", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400049": { pincode: "400049", area: "Mumbai Andheri", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400050": { pincode: "400050", area: "Mumbai Andheri West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400053": { pincode: "400053", area: "Mumbai Juhu", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400054": { pincode: "400054", area: "Mumbai Goregaon", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400063": { pincode: "400063", area: "Mumbai Malad", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400064": { pincode: "400064", area: "Mumbai Kandivali", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400066": { pincode: "400066", area: "Mumbai Borivali", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400067": { pincode: "400067", area: "Mumbai Borivali West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400068": { pincode: "400068", area: "Mumbai Dahisar", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400089": { pincode: "400089", area: "Mumbai Kurla", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400091": { pincode: "400091", area: "Mumbai Ghatkopar", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400104": { pincode: "400104", area: "Thane", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400601": { pincode: "400601", area: "Thane West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400602": { pincode: "400602", area: "Thane", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "421301": { pincode: "421301", area: "Palghar", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "421302": { pincode: "421302", area: "Palghar East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
};

export function checkPincode(pincode: string): PincodeInfo | null {
  return PINCODE_DB[pincode] || null;
}

export function getDeliveryMessage(pincode: string): string {
  const info = checkPincode(pincode);
  if (!info) return "";
  if (info.area.startsWith("Bhayander") || info.area.startsWith("Naigaon")) {
    return `Great news! We deliver to ${info.area} — same-day delivery available. No delivery charge!`;
  }
  if (info.area.startsWith("Vasai") || info.area.startsWith("Virar") || info.area.startsWith("Nallasopara")) {
    return `We deliver to ${info.area} in ${info.estimatedDays}. Free delivery on orders above ₹5,000!`;
  }
  return `We deliver to ${info.area} in ${info.estimatedDays}. Contact us for delivery charges.`;
}
