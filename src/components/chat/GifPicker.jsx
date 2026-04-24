import { useState } from "react";

const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;

export default function GifPicker({ onSelectGif }) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [gifs, setGifs] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchGifs(e) {
    e.preventDefault();
    setMsg("");

    const q = keyword.trim();

    if (!q) {
      setMsg("請輸入 GIF 關鍵字");
      return;
    }

    if (!TENOR_API_KEY) {
      setMsg("找不到 Tenor API key，請確認 .env 是否有設定 VITE_TENOR_API_KEY");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        key: TENOR_API_KEY,
        client_key: "midterm_chatroom",
        q,
        limit: "12",
        media_filter: "tinygif,gif",
        contentfilter: "medium",
      });

      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Tenor API request failed");
      }

      const data = await response.json();

      const result = (data.results || []).map((item) => {
        const tinygif = item.media_formats?.tinygif;
        const gif = item.media_formats?.gif;

        return {
          id: item.id,
          title: item.content_description || "GIF",
          url: tinygif?.url || gif?.url || "",
          previewURL: tinygif?.url || gif?.url || "",
        };
      }).filter((item) => item.url);

      setGifs(result);

      if (result.length === 0) {
        setMsg("找不到 GIF");
      }
    } catch (error) {
      console.error(error);
      setMsg("搜尋 GIF 失敗");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(gif) {
    onSelectGif(gif);
    setOpen(false);
    setKeyword("");
    setGifs([]);
    setMsg("");
  }

  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((prev) => !prev)}>
        GIF
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            right: 0,
            width: "320px",
            maxHeight: "360px",
            overflowY: "auto",
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            background: "#ffffff",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.18)",
            zIndex: 20,
          }}
        >
          <form onSubmit={searchGifs} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="搜尋 GIF，例如 happy"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={loading}>
              Search
            </button>
          </form>

          {msg && <p style={{ margin: "8px 0 0 0" }}>{msg}</p>}
          {loading && <p style={{ margin: "8px 0 0 0" }}>搜尋中...</p>}

          <div
            style={{
              marginTop: "12px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => handleSelect(gif)}
                style={{
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <img
                  src={gif.previewURL}
                  alt={gif.title}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    display: "block",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}