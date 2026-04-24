import { useEffect } from "react";

export default function NotificationManager() {
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission().catch((error) => {
        console.error("Notification permission error:", error);
      });
    }
  }, []);

  return null;
}