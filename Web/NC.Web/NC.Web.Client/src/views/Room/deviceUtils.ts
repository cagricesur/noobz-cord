export function normalizeDeviceId(deviceId: string | undefined): string | undefined {
  if (!deviceId || deviceId === "default") {
    return undefined;
  }
  return deviceId;
}
