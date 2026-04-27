import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { watchlistApi, type WatchlistItem } from '@/lib/api/watchlist.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function WatchlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth/sign-in-3?redirect=/watchlist');
      return;
    }

    loadWatchlist();
  }, [user, navigate]);

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

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <p className="text-muted-foreground mt-2">
            Track your favorite stocks and monitor their performance
          </p>
        </div>
        <Button onClick={() => navigate('/prediction/historical')}>
          Add New Stock
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
            <Button onClick={() => navigate('/prediction/historical')}>
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
    </div>
  );
}
