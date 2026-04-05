import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const label = language === 'ru' ? 'ЗБС Линк' : 'ZBS Link';

  return (
    <span className={className} data-theme={theme} data-language={language} role="img" aria-label={label}>
      <span className="brand-logo-text">{label}</span>
    </span>
  );
}
