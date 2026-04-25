import { useEffect, useRef, useState } from "react";

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

export default function GifPicker({ onSelectGif, resetKey }) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [gifs, setGifs] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!open) return;
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setKeyword("");
    setGifs([]);
    setMsg("");
    setLoading(false);
  }, [resetKey]);

  async function searchGifs() {
    const q = keyword.trim();
    setMsg("");

    if (!q) {
      setMsg("請輸入 GIF 關鍵字");
      return;
    }

    if (!GIPHY_API_KEY) {
      setMsg("找不到 GIPHY API key，請確認 .env 是否有 VITE_GIPHY_API_KEY");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        api_key: GIPHY_API_KEY,
        q,
        limit: "12",
        rating: "g",
        lang: "zh-TW",
        bundle: "messaging_non_clips",
      });

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("GIPHY API request failed");
      }

      const data = await response.json();

      const results = (data.data || [])
        .map((item) => {
          const preview =
            item.images?.fixed_width_small?.url ||
            item.images?.fixed_height_small?.url ||
            item.images?.fixed_width?.url ||
            item.images?.fixed_height?.url ||
            item.images?.downsized?.url ||
            "";

          const sendURL =
            item.images?.downsized?.url ||
            item.images?.fixed_height?.url ||
            item.images?.fixed_width?.url ||
            item.images?.original?.url ||
            preview;

          return {
            id: item.id,
            title: item.title || "GIPHY GIF",
            gifURL: sendURL,
            previewURL: preview || sendURL,
            giphyURL: item.url || "",
          };
        })
        .filter((gif) => gif.gifURL);

      setGifs(results);

      if (results.length === 0) {
        setMsg("找不到 GIF");
      }
    } catch (error) {
      console.error("Search GIPHY GIF error:", error);
      setMsg("搜尋 GIF 失敗，請確認 API key 或網路連線");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectGif(gif) {
    onSelectGif?.(gif);
    setOpen(false);
    setKeyword("");
    setGifs([]);
    setMsg("");
  }

  function handleKeywordKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      searchGifs();
    }
  }

  return (
    <div className="gif-picker-wrapper" ref={pickerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        GIF
      </button>

      {open && (
        <div className="gif-picker-panel">
          <div className="gif-search-form">
            <input
              type="text"
              placeholder="搜尋 GIF，例如 happy"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
            />

            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                searchGifs();
              }}
            >
              Search
            </button>
          </div>

          <p className="giphy-powered">Powered by GIPHY</p>

          {loading && <p className="muted-text">搜尋中...</p>}
          {msg && <p className="menu-message">{msg}</p>}

          <div className="gif-grid">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                className="gif-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectGif(gif);
                }}
                title={gif.title}
              >
                <img src={gif.previewURL} alt={gif.title} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}