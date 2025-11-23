import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Zap, Coins, Globe2 } from "lucide-react";
import { SiBitcoin, SiEthereum, SiApple, SiGoogle, SiMicrosoft } from "react-icons/si";
import { useState, useRef, useEffect } from "react";

interface MarketData {
  type: "crypto" | "stock" | "commodity" | "forex";
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

const getAssetLogo = (symbol: string, type: string) => {
  switch (symbol) {
    case "BTC":
      return <SiBitcoin className="h-5 w-5 text-orange-500" />;
    case "ETH":
      return <SiEthereum className="h-5 w-5 text-purple-500" />;
    case "AAPL":
      return <SiApple className="h-5 w-5 text-gray-600 dark:text-gray-300" />;
    case "GOOGL":
      return <SiGoogle className="h-5 w-5 text-red-500" />;
    case "MSFT":
      return <SiMicrosoft className="h-5 w-5 text-blue-500" />;
    case "BNB":
      return <Coins className="h-5 w-5 text-yellow-500" />;
    case "GOLD":
      return <Zap className="h-5 w-5 text-yellow-600" />;
    case "EUR/USD":
    case "GBP/USD":
    case "USD/JPY":
      return <Globe2 className="h-5 w-5 text-blue-600" />;
    default:
      return <Coins className="h-5 w-5 text-gray-500" />;
  }
};

export function MarketTicker() {
  const { data: marketData, isLoading } = useQuery<MarketData[]>({
    queryKey: ["/api/market/data"],
    refetchInterval: 10000,
  });

  const [isHovering, setIsHovering] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (isHovering || !marketData || marketData.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const newPos = prev + 2;
        return newPos > maxScroll ? 0 : newPos;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isHovering, marketData]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  if (isLoading) {
    return (
      <div className="bg-muted/40 border-y border-border py-3">
        <div className="container mx-auto px-6">
          <div className="flex justify-center gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-32 bg-muted rounded animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 border-y border-border py-3">
      <div className="container mx-auto px-6">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-hidden scroll-smooth"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          data-testid="market-ticker-container"
        >
          {marketData && marketData.length > 0 ? (
            <>
              {/* Show items twice for infinite scroll effect */}
              {[...marketData, ...marketData].map((asset, index) => (
                <div
                  key={`${asset.symbol}-${index}`}
                  className="flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors"
                  data-testid={`market-${asset.symbol.toLowerCase()}-${index}`}
                >
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {getAssetLogo(asset.symbol, asset.type)}
                  </div>

                  {/* Symbol and Price */}
                  <div className="flex flex-col gap-0.5 min-w-max">
                    <p className="text-xs font-bold text-foreground leading-none">
                      {asset.symbol}
                    </p>
                    <p className="text-xs font-semibold text-foreground leading-none">
                      ${asset.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: asset.symbol.includes("/") ? 4 : 2,
                      })}
                    </p>
                  </div>

                  {/* Change Indicator */}
                  <div
                    className={`flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                      asset.change24h >= 0
                        ? "bg-green-500/15 text-green-600 dark:text-green-400"
                        : "bg-red-500/15 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {asset.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(asset.change24h).toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-2 text-muted-foreground text-sm">
              No market data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
