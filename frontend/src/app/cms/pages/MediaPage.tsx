import { useEffect, useState } from 'react';
import { TableToolbar } from '../components/TableToolbar';
import { Button } from '../../components/ui/button';
import { mockApi } from '../mock/mockApi';
import { Upload, Grid, List } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { SequoiaLoader } from '../components/SequoiaLoader';
import type { MockMediaItem } from '../mock/mockData';

export function MediaPage() {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MockMediaItem[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await mockApi.media.getAll({ search });
      setMedia(result.data);
      setLoading(false);
    };
    load();
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search media..." />
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setUploading(true);
              setTimeout(() => setUploading(false), 900);
            }}
            disabled={uploading}
            style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          >
            {uploading ? (
              <SequoiaLoader label="Uploading" size="sm" mode="inline" />
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
          <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200/70 bg-white/90 p-2 shadow-sm">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="mt-2 h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item._id} className="rounded-2xl border border-slate-200/70 bg-white/90 p-2 shadow-sm">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.alt || item.filename} className="w-full aspect-square object-cover rounded-xl" />
              ) : (
                <div className="w-full aspect-square bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-xs">{item.type}</span>
                </div>
              )}
              <p className="text-xs mt-2 truncate">{item.filename}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {media.map((item) => (
            <div key={item._id} className="flex items-center gap-4 p-4 border border-slate-200/70 bg-white/90 rounded-2xl shadow-sm">
              {item.type === 'image' && <img src={item.url} alt={item.alt || item.filename} className="w-16 h-16 object-cover rounded-xl" />}
              <div className="flex-1">
                <p className="font-medium">{item.filename}</p>
                <p className="text-sm text-muted-foreground">{(item.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
