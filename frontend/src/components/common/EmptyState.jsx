import './EmptyState.css';

export default function EmptyState({ emoji = '⚾', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-emoji">{emoji}</div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
