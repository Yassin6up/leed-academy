import { useEffect } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

export function MarketTicker() {
  useEffect(() => {
    // Load TradingView script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;

    const container = document.getElementById("tradingview-ticker");
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="bg-muted/40 border-y border-border py-3">
      <div className="container mx-auto px-6">
        <div id="tradingview-ticker">
          <div
            className="tradingview-widget-container"
            style={{ height: "60px" }}
          >
            <div
              className="tradingview-widget-container__widget"
              style={{ height: "calc(100% - 32px)" }}
            ></div>
            <script type="text/javascript">
              {`
                new window.TradingView.widget({
                  "symbols": [
                    {
                      "proName": "CRYPTOCAP:BTC",
                      "title": "Bitcoin"
                    },
                    {
                      "proName": "CRYPTOCAP:ETH",
                      "title": "Ethereum"
                    },
                    {
                      "proName": "BINANCE:BNBUSDT",
                      "title": "BNB"
                    },
                    {
                      "proName": "NASDAQ:AAPL",
                      "title": "Apple"
                    },
                    {
                      "proName": "NASDAQ:GOOGL",
                      "title": "Google"
                    },
                    {
                      "proName": "NASDAQ:MSFT",
                      "title": "Microsoft"
                    },
                    {
                      "proName": "TVC:GOLD",
                      "title": "Gold"
                    },
                    {
                      "proName": "FX_IDC:EURUSD",
                      "title": "EUR/USD"
                    },
                    {
                      "proName": "FX_IDC:GBPUSD",
                      "title": "GBP/USD"
                    },
                    {
                      "proName": "FX_IDC:USDJPY",
                      "title": "USD/JPY"
                    }
                  ],
                  "showSymbolLogo": true,
                  "isTransparent": false,
                  "displayMode": "compact",
                  "locale": "en",
                  "largeChartUrl": ""
                });
              `}
            </script>
          </div>
        </div>
      </div>
    </div>
  );
}
