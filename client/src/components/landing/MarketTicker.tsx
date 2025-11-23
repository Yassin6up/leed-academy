import { useEffect } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

export function MarketTicker() {
  useEffect(() => {
    // Clear any existing widget
    const container = document.getElementById("tradingview-ticker");
    if (container) {
      container.innerHTML = "";
    }

    // Load TradingView script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";

    script.onload = () => {
      if (window.TradingView && window.TradingView.widget) {
        try {
          new window.TradingView.widget({
            symbols: [
              {
                proName: "CRYPTOCAP:BTC",
                title: "Bitcoin",
              },
              {
                proName: "CRYPTOCAP:ETH",
                title: "Ethereum",
              },
              {
                proName: "BINANCE:BNBUSDT",
                title: "BNB",
              },
              {
                proName: "NASDAQ:AAPL",
                title: "Apple",
              },
              {
                proName: "NASDAQ:GOOGL",
                title: "Google",
              },
              {
                proName: "NASDAQ:MSFT",
                title: "Microsoft",
              },
              {
                proName: "TVC:GOLD",
                title: "Gold",
              },
              {
                proName: "FX_IDC:EURUSD",
                title: "EUR/USD",
              },
              {
                proName: "FX_IDC:GBPUSD",
                title: "GBP/USD",
              },
              {
                proName: "FX_IDC:USDJPY",
                title: "USD/JPY",
              },
            ],
            showSymbolLogo: true,
            isTransparent: true,
            displayMode: "compact",
            locale: "en",
            largeChartUrl: "",
            container_id: "tradingview-ticker-widget",
          });
        } catch (error) {
          console.error("Error initializing TradingView widget:", error);
        }
      }
    };

    const tickerContainer = document.getElementById("tradingview-ticker");
    if (tickerContainer) {
      tickerContainer.appendChild(script);
    }

    return () => {
      const container = document.getElementById("tradingview-ticker");
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="bg-muted/40 border-y border-border py-1.5">
      <div className="container mx-auto px-6">
        <div
          id="tradingview-ticker"
          className="w-full"
          style={{ height: "44px" }}
        >
          <div
            id="tradingview-ticker-widget"
            style={{ height: "44px", overflow: "hidden" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
