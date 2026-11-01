export interface BlogFontOption {
  value: string;
  label: string;
  stack: string;
}

export const blogFontOptions: BlogFontOption[] = [
  { value: 'inter', label: 'Inter', stack: '"Inter", "SF Pro Display", "Segoe UI", "Segoe UI Variable", system-ui, sans-serif' },
  { value: 'playfair-display', label: 'Playfair Display', stack: '"Playfair Display", "Times New Roman", serif' },
  { value: 'space-grotesk', label: 'Space Grotesk', stack: '"Space Grotesk", "Segoe UI", sans-serif' },
  { value: 'source-serif-4', label: 'Source Serif 4', stack: '"Source Serif 4", "Times New Roman", serif' },
  { value: 'merriweather', label: 'Merriweather', stack: '"Merriweather", Georgia, serif' },
  { value: 'nunito', label: 'Nunito', stack: '"Nunito", "Segoe UI", "Helvetica Neue", sans-serif' },
  { value: 'roboto-serif', label: 'Roboto Serif', stack: '"Roboto Serif", "Times New Roman", serif' },
  { value: 'libre-baskerville', label: 'Libre Baskerville', stack: '"Libre Baskerville", "Times New Roman", serif' },
  { value: 'cormorant-garamond', label: 'Cormorant Garamond', stack: '"Cormorant Garamond", "Times New Roman", serif' },
  { value: 'bai-jamjuree', label: 'Bai Jamjuree', stack: '"Bai Jamjuree", "Noto Sans", sans-serif' },
  { value: 'ibm-plex-sans', label: 'IBM Plex Sans', stack: '"IBM Plex Sans", "Helvetica Neue", sans-serif' },
  { value: 'libre-franklin', label: 'Libre Franklin', stack: '"Libre Franklin", "Segoe UI", sans-serif' },
];

export const defaultBlogFont = blogFontOptions[0].value;

export const getFontStack = (value?: string) => {
  const option = blogFontOptions.find((item) => item.value === value);
  return option ? option.stack : blogFontOptions[0].stack;
};
