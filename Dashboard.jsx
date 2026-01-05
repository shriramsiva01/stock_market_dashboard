import { useEffect, useState } from "react";

const API_KEY = "d5diu2pr01qur4isiek0d5diu2pr01qur4isiekg"; 

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔍 Fetch stock suggestions while typing (debounced)
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/search?q=${query}&token=${API_KEY}`
        );
        const data = await res.json();

        const filtered = data.result
          .filter((s) => s.type === "Common Stock")
          .slice(0, 5);

        setSuggestions(filtered);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // 📈 Fetch stock price
  const fetchStock = async (symbol) => {
    try {
      setLoading(true);
      setError("");
      setSuggestions([]);
      setQuery(symbol);

      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
      );
      const data = await res.json();

      if (data.c === 0 && data.pc === 0) {
        setError("No price data available for this stock");
        setStockData(null);
      } else {
        setStockData(data);
      }
    } catch (err) {
      setError("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
        maxWidth: 500,
        margin: "auto",
      }}
    >
      <h2>📊 Stock Market Dashboard</h2>

      {/* 🔎 Search Input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value.toUpperCase())}
        placeholder="Search stock (AAPL, TSLA...)"
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          marginBottom: 5,
        }}
      />

      {/* 🔽 Suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            border: "1px solid #ccc",
            borderTop: "none",
            background: "#fff",
          }}
        >
          {suggestions.map((s) => (
            <div
              key={s.symbol}
              onClick={() => fetchStock(s.symbol)}
              style={{
                padding: 8,
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{s.symbol}</strong> – {s.description}
            </div>
          ))}
        </div>
      )}

      {/* ⏳ Loading */}
      {loading && <p>Loading stock data...</p>}

      {/* ❌ Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 📉 Stock Data */}
      {stockData && (
        <div style={{ marginTop: 20 }}>
          <p>
            <b>Price:</b>{" "}
            {stockData.c !== 0 ? stockData.c : stockData.pc}{" "}
            <span style={{ color: "gray" }}>
              ({stockData.c !== 0 ? "Live" : "Last Close"})
            </span>
          </p>
          <p><b>High:</b> {stockData.h || "N/A"}</p>
          <p><b>Low:</b> {stockData.l || "N/A"}</p>
          <p><b>Change:</b> {stockData.d || 0}</p>
          <p style={{ color: "gray", fontSize: 12 }}>
            Last Updated:{" "}
            {new Date(stockData.t * 1000).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
