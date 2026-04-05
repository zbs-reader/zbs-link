import type { ReactNode } from 'react';
import { IonButton, IonHeader, IonIcon, IonToolbar } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  className?: string;
  centerContent?: ReactNode;
  endContent?: ReactNode;
  showBrandMeta?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  className,
  centerContent,
  endContent,
  showBrandMeta = false
}: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <IonHeader className={`app-header-shell${className ? ` ${className}` : ''}`}>
      <IonToolbar>
        <div className="app-header-inner">
          <div className="app-header-start">
            <Link to="/" className="header-brand-link" aria-label={t('common.brandHomeAria')}>
              <BrandLogo className="header-brand-logo-img" />
              {showBrandMeta && (title || subtitle) ? (
                <span className="header-brand-copy">
                  {title ? <span className="header-title-main">{title}</span> : null}
                  {subtitle ? <span className="header-subtitle">{subtitle}</span> : null}
                </span>
              ) : null}
            </Link>
          </div>

          {centerContent ? <div className="app-header-center">{centerContent}</div> : <div className="app-header-center" />}

          <div className="app-header-end">
            {endContent}
            <IonButton className="app-header-button" onClick={toggleLanguage} aria-label={t('common.toggleLanguage')}>
              <span className="header-language-chip">{language.toUpperCase()}</span>
            </IonButton>
            <IonButton className="app-header-button" onClick={toggleTheme} aria-label={t('common.toggleTheme')}>
              <IonIcon icon={theme === 'dark' ? sunnyOutline : moonOutline} />
            </IonButton>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
}