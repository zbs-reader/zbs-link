import { IonIcon } from '@ionic/react';
import { gridOutline, homeOutline, pricetagsOutline } from 'ionicons/icons';
import { motion } from 'motion/react';
import { useHistory } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface BottomDockProps {
  active: 'home' | 'browse' | 'levels';
}

export function BottomDock({ active }: BottomDockProps) {
  const history = useHistory();
  const { t } = useLanguage();
  const items = [
    { id: 'home', label: t('nav.home'), icon: homeOutline, href: '/' },
    { id: 'levels', label: 'Boosty', icon: pricetagsOutline, href: '/levels' },
    { id: 'browse', label: t('nav.browse'), icon: gridOutline, href: '/authors' }
  ] as const;

  return (
    <nav className="bottom-dock bottom-dock-triple" aria-label={t('nav.mainNavigation')}>
      {items.map((item) => {
        const selected = active === item.id;

        return (
          <motion.button
            key={item.id}
            type="button"
            aria-label={item.label}
            className={`dock-button dock-button-rich ${selected ? 'active' : ''}`}
            onClick={() => history.push(item.href)}
            whileTap={{ scale: 0.96 }}
          >
            <span className="dock-button-icon">
              <IonIcon icon={item.icon} />
            </span>
            <span className="dock-button-label">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
