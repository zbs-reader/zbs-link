import { IonButton, IonSpinner } from '@ionic/react';

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
      <div className="surface-card">
        {loading ? <IonSpinner name="crescent" /> : null}
        <h2>{title}</h2>
        <p className="muted-text">{message}</p>
        {actionLabel && onAction ? <IonButton onClick={onAction}>{actionLabel}</IonButton> : null}
      </div>
    </div>
  );
}
