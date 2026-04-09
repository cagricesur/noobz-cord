/** Cookie names for remembered conference input devices (deviceId only; not mic/cam on/off). */
export const COOKIE_CONFERENCE_MIC_DEVICE = "nc-conf-mic-device";
export const COOKIE_CONFERENCE_CAM_DEVICE = "nc-conf-cam-device";

export const conferenceDeviceCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
};
