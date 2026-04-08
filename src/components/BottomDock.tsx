import { IonIcon } from '@ionic/react';
import { gridOutline, homeOutline, pricetagsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface BottomDockProps {
  active: 'home' | 'browse' | 'levels';
}

export function BottomDock({ active }: BottomDockProps) {
  const history = useHistory();
  const { t } = useLanguage();

  return (
    <nav className="bottom-dock bottom-dock-triple" aria-label={t('nav.mainNavigation')}>
      <button type="button" aria-label={t('nav.home')} className={`dock-button ${active === 'home' ? 'active' : ''}`} onClick={() => history.push('/')}>
        <IonIcon icon={homeOutline} />
      </button>
      <button type="button" aria-label="Boosty" className={`dock-button ${active === 'levels' ? 'active' : ''}`} onClick={() => history.push('/levels')}>
        <IonIcon icon={pricetagsOutline} />
      </button>
      <button type="button" aria-label={t('nav.browse')} className={`dock-button ${active === 'browse' ? 'active' : ''}`} onClick={() => history.push('/authors')}>
        <IonIcon icon={gridOutline} />
      </button>
    </nav>
  );
}
