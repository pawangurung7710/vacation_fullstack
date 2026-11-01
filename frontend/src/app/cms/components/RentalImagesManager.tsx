import { useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { mediaApi, resolveMediaUrl } from '../../services/api';

/** Multi-image manager: upload (reuses mediaApi.upload like MediaStep.tsx) or paste a
 * URL, remove any image, and promote any non-first image to the front — the first
 * entry is always the main/hero image shown in the mobile app and product grid. */
export function RentalImagesManager({ images, onChange }: { images: string[]; onChange: (next: string[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const uploaded = await mediaApi.upload(file, { category: 'image' });
      const url = resolveMediaUrl(uploaded?.url);
      if (url) onChange([...images, url]);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAt = (index: number) => onChange(images.filter((_, i) => i !== index));

  const setAsMain = (index: number) => {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Images</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border-[var(--cms-border)]"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleUpload(file);
                event.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Paste image URL"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
        />
        <Button
          type="button"
          variant="outline"
          className="border-[var(--cms-border)]"
          onClick={() => {
            if (urlInput.trim()) {
              onChange([...images, urlInput.trim()]);
              setUrlInput('');
            }
          }}
        >
          Add
        </Button>
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          First image becomes the main/hero image shown in the app.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={`${img}-${i}`} className="relative">
              <img
                src={resolveMediaUrl(img)}
                alt=""
                className="w-full aspect-square rounded-lg object-cover border border-slate-200/70"
              />
              {i === 0 ? (
                <span className="absolute top-1 left-1 rounded-full bg-black/60 text-white text-xs px-2 py-0.5">
                  Main
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAsMain(i)}
                  className="absolute top-1 left-1 rounded-full bg-black/60 text-white text-xs px-2 py-0.5 hover:bg-black/80"
                >
                  Set as main
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
