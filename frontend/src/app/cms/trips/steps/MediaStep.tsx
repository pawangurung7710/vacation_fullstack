import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { TripDraft } from '../TripStepper';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { mediaApi, resolveMediaUrl } from '../../../services/api';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface MediaStepProps {
  data: TripDraft;
  updateData: (updates: Partial<TripDraft>) => void;
  errors?: Partial<Record<keyof TripDraft, string>>;
}

export function MediaStep({ data, updateData, errors }: MediaStepProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [brochureDialogOpen, setBrochureDialogOpen] = useState(false);
  const [brochureInput, setBrochureInput] = useState('');

  const openBrochureDialog = () => {
    setBrochureInput(data.brochureUrl || '');
    setBrochureDialogOpen(true);
  };

  const handleSaveBrochure = () => {
    updateData({ brochureUrl: brochureInput.trim() });
    setBrochureDialogOpen(false);
  };

  const handleMainImageUpload = async (file: File) => {
    try {
      setIsUploadingMain(true);
      const uploaded = await mediaApi.upload(file, { category: 'image' });
      const url = resolveMediaUrl(uploaded?.url);
      if (url) {
        updateData({ mainImage: url });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload image');
    } finally {
      setIsUploadingMain(false);
    }
  };

  const handleGalleryUpload = async (file: File) => {
    try {
      setIsUploadingGallery(true);
      const uploaded = await mediaApi.upload(file, { category: 'image' });
      const url = resolveMediaUrl(uploaded?.url);
      if (url) {
        const nextGallery = [...data.gallery, url];
        const prevHighlights =
          data.highlightGallery && data.highlightGallery.length >= data.gallery.length
            ? data.highlightGallery
            : data.gallery.map((image, idx) => ({
                image,
                caption: data.highlightGallery?.[idx]?.caption || '',
              }));
        updateData({
          gallery: nextGallery,
          highlightGallery: [...prevHighlights, { image: url, caption: '' }],
        });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload image');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleAddToGallery = () => {
    if (galleryUrl.trim()) {
      const nextGallery = [...data.gallery, galleryUrl.trim()];
      const prevHighlights =
        data.highlightGallery && data.highlightGallery.length >= data.gallery.length
          ? data.highlightGallery
          : data.gallery.map((image, idx) => ({
              image,
              caption: data.highlightGallery?.[idx]?.caption || '',
            }));
      updateData({
        gallery: nextGallery,
        highlightGallery: [...prevHighlights, { image: galleryUrl.trim(), caption: '' }],
      });
      setGalleryUrl('');
    }
  };

  const handleRemoveFromGallery = (index: number) => {
    const nextGallery = data.gallery.filter((_, i) => i !== index);
    const nextHighlights = data.highlightGallery
      ? data.highlightGallery.filter((_, i) => i !== index)
      : nextGallery.map((image) => ({ image, caption: '' }));
    updateData({
      gallery: nextGallery,
      highlightGallery: nextHighlights,
    });
  };

  return (
    <div className="space-y-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
      <div>
        <h2 className="text-xl font-semibold mb-1 text-[var(--cms-foreground)]">Media</h2>
        <p className="text-sm text-[var(--cms-muted-foreground)]">Upload images for your trip</p>
      </div>

      {/* Main Image */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Main Image *</Label>
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
            'border-[var(--cms-border)] hover:border-[var(--cms-primary)]',
            data.mainImage && 'border-solid',
            errors?.mainImage && 'border-red-400'
          )}
        >
          {data.mainImage ? (
            <div className="relative inline-block">
              <img
                src={data.mainImage}
                alt="Main"
                className="h-48 w-auto rounded-lg object-cover"
              />
              <button
                onClick={() => updateData({ mainImage: undefined })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[var(--cms-muted)] flex items-center justify-center">
                  <Upload className="h-6 w-6 text-[var(--cms-muted-foreground)]" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Drop image here or click to upload</p>
                <p className="text-xs text-[var(--cms-muted-foreground)]">Recommended: 1200x800px</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[var(--cms-border)]"
                  disabled={isUploadingMain}
                >
                  {isUploadingMain ? 'Uploading...' : 'Upload Image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handleMainImageUpload(file);
                      event.currentTarget.value = '';
                    }
                  }}
                />
                <div className="w-full max-w-sm">
                  <Input
                    placeholder="Paste image URL"
                    value={data.mainImage || ''}
                    onChange={(event) => updateData({ mainImage: event.target.value })}
                    className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {errors?.mainImage && <p className="text-xs text-red-500">{errors.mainImage}</p>}
      </div>

      {/* Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Gallery</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => galleryInputRef.current?.click()}
              className="border-[var(--cms-border)]"
              disabled={isUploadingGallery}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploadingGallery ? 'Uploading...' : 'Upload'}
            </Button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleGalleryUpload(file);
                  event.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            placeholder="Paste image URL"
            value={galleryUrl}
            onChange={(event) => setGalleryUrl(event.target.value)}
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddToGallery}
            className="border-[var(--cms-border)]"
          >
            Add URL
          </Button>
        </div>
        {data.gallery.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--cms-border)] rounded-lg p-8 text-center">
            <ImageIcon className="h-8 w-8 text-[var(--cms-muted-foreground)] mx-auto mb-2" />
            <p className="text-sm text-[var(--cms-muted-foreground)]">No images in gallery</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.gallery.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-[var(--cms-border)]"
                />
                <button
                  onClick={() => handleRemoveFromGallery(index)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
        {data.highlightGallery && data.highlightGallery.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--cms-foreground)]">Gallery Captions</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {data.highlightGallery.map((item, index) => (
                <div
                  key={index}
                  className="border border-[var(--cms-border)] bg-white/80 rounded-2xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 overflow-hidden rounded-xl border border-[var(--cms-border)]">
                      <img src={item.image} alt={`Caption ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.4em] text-[var(--cms-muted-foreground)]">Image {index + 1}</span>
                  </div>
                  <Input
                    placeholder="Add a caption"
                    value={item.caption || ''}
                    onChange={(event) => {
                      const nextHighlights = data.highlightGallery?.map((galleryItem, idx) =>
                        idx === index ? { ...galleryItem, caption: event.target.value } : galleryItem
                      );
                      updateData({
                        highlightGallery: nextHighlights,
                      });
                    }}
                    className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brochure */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Brochure</Label>
            <p className="text-xs text-[var(--cms-muted-foreground)]">
              Add a link to a downloadable brochure (e.g. a Cloudinary PDF). A "Download Brochure"
              button appears on the trip page only when a link is set.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openBrochureDialog}
            className="border-[var(--cms-border)] shrink-0"
          >
            <FileText className="mr-2 h-4 w-4" />
            {data.brochureUrl ? 'Edit Brochure Link' : 'Add Brochure Link'}
          </Button>
        </div>
        {data.brochureUrl ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--cms-border)] bg-white/80 px-3 py-2">
            <a
              href={data.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-[var(--cms-primary)] underline"
              title={data.brochureUrl}
            >
              {data.brochureUrl}
            </a>
            <button
              type="button"
              onClick={() => updateData({ brochureUrl: '' })}
              className="shrink-0 text-red-500 hover:text-red-600"
              aria-label="Remove brochure link"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-[var(--cms-border)] p-6 text-center">
            <FileText className="mx-auto mb-2 h-7 w-7 text-[var(--cms-muted-foreground)]" />
            <p className="text-sm text-[var(--cms-muted-foreground)]">No brochure link added</p>
          </div>
        )}
      </div>

      <Dialog open={brochureDialogOpen} onOpenChange={setBrochureDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Brochure link</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="trip-brochure-url">Brochure URL</Label>
            <Input
              id="trip-brochure-url"
              value={brochureInput}
              onChange={(event) => setBrochureInput(event.target.value)}
              placeholder="https://res.cloudinary.com/.../brochure.pdf"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBrochureDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveBrochure}>
              Save Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
