import { useEffect, useState } from "react";
import asciiArt from "../../assets/strong_bruce_ascii_art.txt?raw";

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState("ascii");

  useEffect(() => {
    const toBrandTimer = setTimeout(() => {
      setPhase("brand");
    }, 2300);

    const finishTimer = setTimeout(() => {
      onFinish?.();
    }, 7000);

    return () => {
      clearTimeout(toBrandTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const slices = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className={`splash-screen ${phase === "brand" ? "brand-phase" : ""}`}>
      <div className="splash-three-bg" />

      <div className="ascii-stage">
        <pre className="ascii-art">{asciiArt}</pre>

        <div className="ascii-slices" aria-hidden="true">
          {slices.map((slice) => (
            <div
              key={slice}
              className="ascii-slice"
              style={{
                "--slice-index": slice,
                "--slice-count": slices.length,
              }}
            />
          ))}
        </div>
      </div>

      <div className="brand-stage">
        <p className="brand-kicker">Welcome to</p>
        <h1>Strong Bruce Chatroom</h1>
        <p className="brand-subtitle">
          Real-time chat · Images · GIFs · Groups · Profiles
        </p>
      </div>
    </div>
  );
}