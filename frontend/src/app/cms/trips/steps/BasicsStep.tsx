import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { TripDraft } from '../TripStepper';
import { useEffect, useState } from 'react';
import { categoriesApi, countriesApi, regionsApi } from '../../../services/api';
import { cn } from '../../../components/ui/utils';

interface BasicsStepProps {
  data: TripDraft;
  updateData: (updates: Partial<TripDraft>) => void;
  errors?: Partial<Record<keyof TripDraft, string>>;
}

interface CategoryOption {
  _id: string;
  label: string;
}

interface RegionOption {
  _id: string;
  name: string;
}

interface CountryOption {
  _id: string;
  name: string;
}

export function BasicsStep({ data, updateData, errors }: BasicsStepProps) {
  const [slugEdited, setSlugEdited] = useState(Boolean(data.slug));
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<CategoryOption[]>([]);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (data.id || data._id) return;
    if (!data.title) return;
    if (slugEdited) return;
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    updateData({ slug });
  }, [data.title, data.slug, data.id, data._id, slugEdited, updateData]);

  useEffect(() => {
    let isActive = true;
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const result = await categoriesApi.getAll({ level: 0 });
        if (isActive) {
          setCategories(result);
        }
      } catch (error) {
        if (isActive) {
          setCategories([]);
        }
      } finally {
        if (isActive) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadRegions = async () => {
      setLoadingRegions(true);
      try {
        const result = await regionsApi.getAll();
        if (isActive) {
          setRegions(result);
        }
      } catch (error) {
        if (isActive) {
          setRegions([]);
        }
      } finally {
        if (isActive) {
          setLoadingRegions(false);
        }
      }
    };

    loadRegions();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const result = await countriesApi.getAll();
        if (isActive) {
          setCountries(result);
        }
      } catch (error) {
        if (isActive) {
          setCountries([]);
        }
      } finally {
        if (isActive) {
          setLoadingCountries(false);
        }
      }
    };

    loadCountries();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadSubcategories = async () => {
      if (!data.categoryId) {
        setSubcategories([]);
        if (data.subcategoryId || data.subcategoryLabel) {
          updateData({ subcategoryId: '', subcategoryLabel: '' });
        }
        return;
      }

      setLoadingSubcategories(true);
      try {
        const result = await categoriesApi.getAll({ parent: data.categoryId });
        if (isActive) {
          setSubcategories(result);
        }
      } catch (error) {
        if (isActive) {
          setSubcategories([]);
        }
      } finally {
        if (isActive) {
          setLoadingSubcategories(false);
        }
      }
    };

    loadSubcategories();
    return () => {
      isActive = false;
    };
  }, [data.categoryId, data.subcategoryId, data.subcategoryLabel, updateData]);

  useEffect(() => {
    if (!data.regionId && data.region && regions.length > 0) {
      const match = regions.find(
        (region) => region.name.toLowerCase() === data.region.toLowerCase()
      );
      if (match) {
        updateData({ regionId: match._id, regionLabel: match.name, region: match.name });
      }
    }
  }, [data.region, data.regionId, regions, updateData]);

  useEffect(() => {
    if (!data.countryId && data.country && countries.length > 0) {
      const match = countries.find(
        (country) => country.name.toLowerCase() === data.country.toLowerCase()
      );
      if (match) {
        updateData({ countryId: match._id, countryLabel: match.name, country: match.name });
      }
    }
  }, [countries, data.country, data.countryId, updateData]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
          Basic Information
        </h2>
        <p className="text-sm text-[var(--cms-muted-foreground)]">Essential details about your trip</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title *
          </Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Alpine High Route"
            className={cn(
              'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
              errors?.title && 'border-red-400 focus:border-red-400'
            )}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}
          />
          {errors?.title && <p className="text-xs text-red-500">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-sm font-medium">
            Slug *
          </Label>
          <Input
            id="slug"
            value={data.slug}
            onChange={(e) => {
              const nextSlug = e.target.value;
              updateData({ slug: nextSlug });
              setSlugEdited(Boolean(nextSlug));
            }}
            placeholder="everest-base-camp-trek"
            className="border-[var(--cms-border)] focus:border-[var(--cms-primary)] bg-[var(--cms-muted)]"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}
          />
          <p className="text-xs text-[var(--cms-muted-foreground)]">Auto-generated from title</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category *
          </Label>
          <Select
            value={data.categoryId}
            onValueChange={(value) => {
              const category = categories.find((item) => item._id === value);
              updateData({
                categoryId: value,
                categoryLabel: category?.label || '',
                subcategoryId: '',
                subcategoryLabel: '',
              });
            }}
          >
            <SelectTrigger
              className={cn(
                'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
                errors?.categoryId && 'border-red-400 focus:border-red-400'
              )}
            >
              <SelectValue placeholder={loadingCategories ? 'Loading categories...' : 'Select category'} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategory" className="text-sm font-medium">
            Subcategory *
          </Label>
          <Select
            value={data.subcategoryId}
            onValueChange={(value) => {
              const subcategory = subcategories.find((item) => item._id === value);
              updateData({
                subcategoryId: value,
                subcategoryLabel: subcategory?.label || '',
              });
            }}
            disabled={!data.categoryId || loadingSubcategories}
          >
            <SelectTrigger
              className={cn(
                'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
                errors?.subcategoryId && 'border-red-400 focus:border-red-400'
              )}
            >
              <SelectValue
                placeholder={
                  loadingSubcategories
                    ? 'Loading subcategories...'
                    : data.categoryId
                    ? 'Select subcategory'
                    : 'Select category first'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory._id} value={subcategory._id}>
                  {subcategory.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.subcategoryId && <p className="text-xs text-red-500">{errors.subcategoryId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">
            Country *
          </Label>
          <Select
            value={data.countryId}
            onValueChange={(value) => {
              const country = countries.find((item) => item._id === value);
              updateData({
                countryId: value,
                countryLabel: country?.name || '',
                country: country?.name || '',
              });
            }}
          >
            <SelectTrigger
              className={cn(
                'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
                errors?.country && 'border-red-400 focus:border-red-400'
              )}
            >
              <SelectValue placeholder={loadingCountries ? 'Loading countries...' : 'Select country'} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country._id} value={country._id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.country && <p className="text-xs text-red-500">{errors.country}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="region" className="text-sm font-medium">
            Region *
          </Label>
          <Select
            value={data.regionId}
            onValueChange={(value) => {
              const region = regions.find((item) => item._id === value);
              updateData({
                regionId: value,
                regionLabel: region?.name || '',
                region: region?.name || '',
              });
            }}
          >
            <SelectTrigger
              className={cn(
                'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
                errors?.region && 'border-red-400 focus:border-red-400'
              )}
            >
              <SelectValue placeholder={loadingRegions ? 'Loading regions...' : 'Select region'} />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region._id} value={region._id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.region && <p className="text-xs text-red-500">{errors.region}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium">
            Duration (days) *
          </Label>
          <Input
            id="duration"
            type="number"
            value={data.duration}
            onChange={(e) => updateData({ duration: e.target.value })}
            placeholder="14"
            className={cn(
              'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
              errors?.duration && 'border-red-400 focus:border-red-400'
            )}
          />
          {errors?.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty" className="text-sm font-medium">
            Difficulty *
          </Label>
          <Select value={data.difficulty} onValueChange={(value) => updateData({ difficulty: value })}>
            <SelectTrigger
              className={cn(
                'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
                errors?.difficulty && 'border-red-400 focus:border-red-400'
              )}
            >
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="challenging">Challenging</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          {errors?.difficulty && <p className="text-xs text-red-500">{errors.difficulty}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            Price (USD) *
          </Label>
          <Input
            id="price"
            type="number"
            value={data.price}
            onChange={(e) => updateData({ price: e.target.value })}
            placeholder="1850"
            className={cn(
              'border-[var(--cms-border)] focus:border-[var(--cms-primary)]',
              errors?.price && 'border-red-400 focus:border-red-400'
            )}
          />
          {errors?.price && <p className="text-xs text-red-500">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status *
          </Label>
          <Select
            value={data.status}
            onValueChange={(value: 'draft' | 'published' | 'archived') => updateData({ status: value })}
          >
            <SelectTrigger className="border-[var(--cms-border)] focus:border-[var(--cms-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-3 pt-8">
          <Switch
            id="featured"
            checked={data.featured}
            onCheckedChange={(checked) => updateData({ featured: checked })}
          />
          <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">
            Featured trip
          </Label>
        </div>
      </div>
    </div>
  );
}
