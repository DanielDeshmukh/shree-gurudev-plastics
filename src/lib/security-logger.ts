type LogLevel = "info" | "warn" | "error" | "security";

interface SecurityEvent {
  timestamp: string;
  level: LogLevel;
  event: string;
  details: Record<string, unknown>;
  ip?: string;
}

const logs: SecurityEvent[] = [];
const MAX_LOGS = 1000;

function addLog(level: LogLevel, event: string, details: Record<string, unknown>, ip?: string) {
  const entry: SecurityEvent = {
    timestamp: new Date().toISOString(),
    level,
    event,
    details,
    ip,
  };
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.pop();

  const prefix = `[SECURITY:${level.toUpperCase()}]`;
  const msg = `${prefix} ${event} ${JSON.stringify(details)}`;
  if (level === "error") console.error(msg);
  else if (level === "warn") console.warn(msg);
  else console.log(msg);
}

export const securityLogger = {
  loginAttempt(username: string, success: boolean, ip?: string) {
    addLog(success ? "info" : "warn", "LOGIN_ATTEMPT", { username, success }, ip);
  },

  unauthorizedAccess(path: string, ip?: string) {
    addLog("warn", "UNAUTHORIZED_ACCESS", { path }, ip);
  },

  pathTraversalAttempt(path: string, ip?: string) {
    addLog("security", "PATH_TRAVERSAL_ATTEMPT", { path }, ip);
  },

  priceManipulationAttempt(orderId: number, ip?: string) {
    addLog("security", "PRICE_MANIPULATION_ATTEMPT", { orderId }, ip);
  },

  adminAction(action: string, target: string, username: string) {
    addLog("info", "ADMIN_ACTION", { action, target, username });
  },

  rateLimitExceeded(path: string, ip?: string) {
    addLog("warn", "RATE_LIMIT_EXCEEDED", { path }, ip);
  },

  error(event: string, details: Record<string, unknown>) {
    addLog("error", event, details);
  },

  getRecent(count: number = 50): SecurityEvent[] {
    return logs.slice(0, count);
  },
};
