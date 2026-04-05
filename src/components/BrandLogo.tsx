import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const label = language === 'ru' ? '\u0417\u0411\u0421 \u041b\u0438\u043d\u043a' : 'ZBS Link';
  const background = isDark ? '#1D1D1D' : '#FFF8EE';
  const border = isDark ? 'none' : '#E4C59A';
  const text = isDark ? '#E49F4E' : '#C67A28';

  return (
    <svg className={className} width="220" height="56" viewBox="0 0 220 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
      <rect width="220" height="56" rx="14" fill={background} />
      {border !== 'none' ? <rect x="1" y="1" width="218" height="54" rx="13" stroke={border} strokeWidth="2" /> : null}
      <text x="18" y="37" fill={text} fontFamily="Segoe UI, Arial, sans-serif" fontSize="19" fontWeight="800" letterSpacing="0.2">{label}</text>
    </svg>
  );
}