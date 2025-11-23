import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";

interface MarketData {
  type: "crypto" | "stock" | "commodity" | "forex";
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

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
      <div className="bg-muted/30 border-y border-border py-6">
        <div className="container mx-auto px-6">
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 w-40 bg-muted rounded-lg animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border-y border-border py-6">
      <div className="container mx-auto px-6">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          data-testid="market-ticker-container"
        >
          {marketData && marketData.length > 0 ? (
            <>
              {/* Show items twice for infinite scroll effect */}
              {[...marketData, ...marketData].map((asset, index) => (
                <Card
                  key={`${asset.symbol}-${index}`}
                  className="p-4 hover-elevate flex-shrink-0 w-44"
                  data-testid={`market-${asset.symbol.toLowerCase()}-${index}`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {asset.type}
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {asset.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {asset.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-lg font-bold text-foreground">
                        ${asset.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: asset.symbol.includes("/") ? 4 : 2,
                        })}
                      </p>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          asset.change24h >= 0
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
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
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No market data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
