import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { watchlistApi, type WatchlistItem } from '@/lib/api/watchlist.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, TrendingUp, Activity, Plus, Loader2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BaseLayout } from '@/components/layouts/base-layout';

export default function WatchlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [addingSymbol, setAddingSymbol] = useState(false);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth/sign-in-3?redirect=/watchlist');
      return;
    }

    loadWatchlist();
  }, [user, navigate]);

  useEffect(() => {
    if (addDialogOpen && symbols.length === 0) {
      loadSymbols();
    }
  }, [addDialogOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadSymbols = async () => {
    setLoadingSymbols(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Try to get symbols from the stock search endpoint instead
      const response = await fetch('http://localhost:8083/api/datasets/stocks/search?query=', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Extract just the symbols from the search results
      const symbolList = data.map((stock: { symbol: string; name: string }) => stock.symbol);
      setSymbols(symbolList.filter((s: string) => s && s.trim() !== ''));
    } catch (error) {
      console.error('Failed to fetch symbols:', error);
      toast.error('Failed to load stock symbols');
      setSymbols([]);
    } finally {
      setLoadingSymbols(false);
    }
  };

  const loadWatchlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await watchlistApi.getUserWatchlist(user.id);
      setWatchlist(data);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    if (!user) return;

    try {
      await watchlistApi.removeFromWatchlist(user.id, symbol);
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      toast.success(`${symbol} removed from watchlist`);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      toast.error('Failed to remove from watchlist');
    }
  };

  const handleViewPrediction = (symbol: string) => {
    navigate(`/prediction/historical?symbol=${symbol}`);
  };

  const handleAddSymbol = async () => {
    if (!user || !newSymbol.trim()) return
    
    setAddingSymbol(true)
    try {
      await watchlistApi.addToWatchlist({ userId: user.id, symbol: newSymbol.toUpperCase() })
      const updatedWatchlist = await watchlistApi.getUserWatchlist(user.id)
      setWatchlist(updatedWatchlist)
      toast.success(`${newSymbol.toUpperCase()} added to watchlist`)
      setNewSymbol('')
      setAddDialogOpen(false)
      setDropdownOpen(false)
    } catch (error: any) {
      if (error.response?.data?.error?.includes('already in watchlist')) {
        toast.info(`${newSymbol.toUpperCase()} is already in your watchlist`)
      } else {
        toast.error('Failed to add to watchlist')
      }
    } finally {
      setAddingSymbol(false)
    }
  };

  const handleSelectSymbol = (symbol: string) => {
    setNewSymbol(symbol);
    setDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setNewSymbol(val);
    setDropdownOpen(val.length > 0);
  };

  const handleClear = () => {
    setNewSymbol('');
    setDropdownOpen(false);
  };

  const filteredSymbols = symbols.filter(s =>
    s.toLowerCase().startsWith(newSymbol.toLowerCase()) ||
    s.toLowerCase().includes(newSymbol.toLowerCase())
  );

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <p className="text-muted-foreground mt-2">
            Track your favorite stocks and monitor their performance
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>

      {watchlist.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start adding stocks to track their performance and get quick access to predictions.
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Stock
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Watched Stocks ({watchlist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.symbol}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.addedAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <TrendingUp className="h-3 w-3" />
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPrediction(item.symbol)}
                        >
                          Predict
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromWatchlist(item.symbol)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Stock Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock to Watchlist</DialogTitle>
            <DialogDescription>
              Enter a stock symbol to add it to your watchlist (e.g., AAPL, TSLA, GOOGL)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div ref={containerRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search symbol (e.g. AAPL, TSLA...)"
                  value={newSymbol}
                  onChange={handleInputChange}
                  onFocus={() => newSymbol.length > 0 && setDropdownOpen(true)}
                  className="pl-9 pr-9"
                  autoComplete="off"
                  autoFocus
                />
                {newSymbol && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {dropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-52 overflow-y-auto">
                  {loadingSymbols ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Loading symbols...
                    </div>
                  ) : filteredSymbols.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No symbols match "{newSymbol}"
                    </div>
                  ) : (
                    filteredSymbols.map(symbol => (
                      <button
                        key={symbol}
                        onMouseDown={() => handleSelectSymbol(symbol)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                          newSymbol === symbol && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        {symbol}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {newSymbol && !dropdownOpen && (
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-semibold text-foreground">{newSymbol}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSymbol} 
              disabled={!newSymbol.trim() || addingSymbol}
            >
              {addingSymbol ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Stock'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </BaseLayout>
  );
}
