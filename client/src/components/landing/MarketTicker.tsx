import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

export function MarketTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = `
      <div class="tradingview-widget-container" style="height: 44px;">
        <div class="tradingview-widget-container__widget" style="height: 100%;"></div>
      </div>
    `;

    // Load TradingView script
    if (!scriptRef.current) {
      scriptRef.current = document.createElement("script");
      scriptRef.current.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      scriptRef.current.async = true;

      scriptRef.current.onload = () => {
        if (window.TradingView && window.TradingView.widget) {
          try {
            new window.TradingView.widget({
              symbols: [
                { proName: "CRYPTOCAP:BTC", title: "Bitcoin" },
                { proName: "CRYPTOCAP:ETH", title: "Ethereum" },
                { proName: "BINANCE:BNBUSDT", title: "BNB" },
                { proName: "NASDAQ:AAPL", title: "Apple" },
                { proName: "NASDAQ:GOOGL", title: "Google" },
                { proName: "NASDAQ:MSFT", title: "Microsoft" },
                { proName: "TVC:GOLD", title: "Gold" },
                { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
                { proName: "FX_IDC:GBPUSD", title: "GBP/USD" },
                { proName: "FX_IDC:USDJPY", title: "USD/JPY" },
              ],
              showSymbolLogo: true,
              isTransparent: true,
              displayMode: "compact",
              locale: "en",
              largeChartUrl: "",
            });
          } catch (error) {
            console.error("TradingView widget error:", error);
          }
        }
      };

      containerRef.current.appendChild(scriptRef.current);
    }

    return () => {
      if (scriptRef.current && containerRef.current && scriptRef.current.parentNode === containerRef.current) {
        containerRef.current.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full bg-muted/40 border-y border-border py-0">
      <div className="w-full px-0" ref={containerRef} style={{ minHeight: "44px" }} />
    </div>
  );
}
