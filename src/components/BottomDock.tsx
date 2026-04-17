import { IonIcon, useIonRouter } from '@ionic/react';
import { gridOutline, homeOutline, pricetagsOutline } from 'ionicons/icons';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface BottomDockProps {
  active: 'home' | 'library' | 'levels';
}

export function BottomDock({ active }: BottomDockProps) {
  const router = useIonRouter();
  const location = useLocation();
  const { t } = useLanguage();
  const items = [
    { id: 'home', label: t('nav.home'), icon: homeOutline, href: '/' },
    { id: 'library', label: t('nav.library'), icon: gridOutline, href: '/library' },
    { id: 'levels', label: 'Boosty', icon: pricetagsOutline, href: '/levels' },
  ] as const;

  const goToRootSection = (href: string) => {
    if (location.pathname === href) {
      return;
    }

    router.push(href, 'root', 'replace');
  };

  return (
    <>
      <nav className="bottom-dock bottom-dock-triple" aria-label={t('nav.mainNavigation')}>
        {items.map((item) => {
          const selected = active === item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              aria-label={item.label}
              className={`dock-button dock-button-rich ${selected ? 'active' : ''}`}
              onClick={() => goToRootSection(item.href)}
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
      <div className="bottom-dock-mobile-spacer" aria-hidden="true" />
    </>
  );
}
