import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CryptoPrice {
  symbol: string;
  price: string;
  change24h: number;
}

export function CryptoTicker() {
  const { data: prices, isLoading } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/crypto/prices"],
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="bg-muted/30 border-y border-border py-4">
        <div className="container mx-auto px-6">
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-32 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border-y border-border py-4">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prices?.map((crypto) => (
            <Card
              key={crypto.symbol}
              className="p-4 hover-elevate"
              data-testid={`crypto-${crypto.symbol.toLowerCase()}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {crypto.symbol}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    ${parseFloat(crypto.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    crypto.change24h >= 0
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {crypto.change24h >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(crypto.change24h).toFixed(2)}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
