export interface PincodeInfo {
  pincode: string;
  area: string;
  available: boolean;
  estimatedDays: string;
  deliveryCharge: string;
}

const PINCODE_DB: Record<string, PincodeInfo> = {
  "400010": { pincode: "400010", area: "Dadar", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400014": { pincode: "400014", area: "Dadar", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400022": { pincode: "400022", area: "Sion", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400053": { pincode: "400053", area: "Andheri", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400054": { pincode: "400054", area: "Santacruz West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400055": { pincode: "400055", area: "Santacruz East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400056": { pincode: "400056", area: "Vile Parle West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400057": { pincode: "400057", area: "Vile Parle East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400058": { pincode: "400058", area: "Andheri East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400059": { pincode: "400059", area: "Marol (Andheri East)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400060": { pincode: "400060", area: "Jogeshwari East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400063": { pincode: "400063", area: "Goregaon East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400064": { pincode: "400064", area: "Malad West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400065": { pincode: "400065", area: "Aarey Milk Colony", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400066": { pincode: "400066", area: "Borivali East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400067": { pincode: "400067", area: "Kandivali West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400068": { pincode: "400068", area: "Dahisar", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400069": { pincode: "400069", area: "Andheri East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400070": { pincode: "400070", area: "Kurla", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400071": { pincode: "400071", area: "Chembur", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400074": { pincode: "400074", area: "Chembur Extension", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400080": { pincode: "400080", area: "Mulund West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400081": { pincode: "400081", area: "Mulund East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400082": { pincode: "400082", area: "Bhandup", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400086": { pincode: "400086", area: "Ghatkopar West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400089": { pincode: "400089", area: "Chembur", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400091": { pincode: "400091", area: "Borivali", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400092": { pincode: "400092", area: "Borivali West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400097": { pincode: "400097", area: "Malad East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400101": { pincode: "400101", area: "Kandivali East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400102": { pincode: "400102", area: "Jogeshwari West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400104": { pincode: "400104", area: "Goregaon", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400601": { pincode: "400601", area: "Thane West", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400602": { pincode: "400602", area: "Thane (Naupada)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400603": { pincode: "400603", area: "Thane East (Kopri)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400604": { pincode: "400604", area: "Thane (Wagle Estate)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400605": { pincode: "400605", area: "Kalwa", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400606": { pincode: "400606", area: "Thane (Jekegram)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400607": { pincode: "400607", area: "Thane (Sandozbaugh)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400608": { pincode: "400608", area: "Thane (Balkum)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400610": { pincode: "400610", area: "Thane (Apna Bazar)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400612": { pincode: "400612", area: "Mumbra", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400614": { pincode: "400614", area: "Navi Mumbai (Belapur)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "400615": { pincode: "400615", area: "Thane (Kasarvadavali)", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "401101": { pincode: "401101", area: "Bhayander West", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401104": { pincode: "401104", area: "Mira Road", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401105": { pincode: "401105", area: "Bhayander East", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401107": { pincode: "401107", area: "Mira Road East", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401201": { pincode: "401201", area: "Vasai (Bassein)", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401202": { pincode: "401202", area: "Vasai Road", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401203": { pincode: "401203", area: "Nallasopara (Sopara)", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401204": { pincode: "401204", area: "Vasai (Vajreshwari)", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401206": { pincode: "401206", area: "Ganeshpuri", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401207": { pincode: "401207", area: "Naigaon (Papdi)", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401208": { pincode: "401208", area: "Vasai East", available: true, estimatedDays: "Same day", deliveryCharge: "Free" },
  "401209": { pincode: "401209", area: "Nallasopara East", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401301": { pincode: "401301", area: "Virar (Agashi)", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401302": { pincode: "401302", area: "Virar (Arnala)", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401303": { pincode: "401303", area: "Virar West", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401304": { pincode: "401304", area: "Virar (Nirmal)", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "401305": { pincode: "401305", area: "Virar East", available: true, estimatedDays: "1-2 days", deliveryCharge: "Free above ₹5,000" },
  "421301": { pincode: "421301", area: "Palghar", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" },
  "421302": { pincode: "421302", area: "Palghar East", available: true, estimatedDays: "2-3 days", deliveryCharge: "Contact us" }
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
  if (info.area.startsWith("Vasai") || info.area.startsWith("Virar") || info.area.startsWith("Nallasopara") || info.area.startsWith("Mira")) {
    return `We deliver to ${info.area} in ${info.estimatedDays}. Free delivery on orders above ₹5,000!`;
  }
  return `We deliver to ${info.area} in ${info.estimatedDays}. Contact us for delivery charges.`;
}
