import { IonButton, IonSpinner } from '@ionic/react';
import { motion } from 'motion/react';

interface StateViewProps {
  loading?: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StateView({ loading, title, message, actionLabel, onAction }: StateViewProps) {
  return (
    <div className="state-wrap">
      <motion.div
        className="surface-card state-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <div className="state-card-orb">{loading ? <IonSpinner name="crescent" /> : <span className="state-card-dot" />}</div>
        <h2>{title}</h2>
        <p className="muted-text">{message}</p>
        {actionLabel && onAction ? <IonButton className="state-card-button" onClick={onAction}>{actionLabel}</IonButton> : null}
      </motion.div>
    </div>
  );
}
