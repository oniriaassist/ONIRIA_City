import Link from "next/link";
import BrandLogo from "../BrandLogo";

export function StaffAvatar({ name = "Staff" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "OS";

  return <span className="adminAvatar" aria-hidden="true">{initials}</span>;
}

export function AdminLoadingScreen({
  title = "Preparing your workspace",
  message = "Checking your secure staff session.",
  timedOut = false,
  onRetry,
}) {
  return (
    <main className="adminSessionScreen">
      <section className="adminSessionCard" aria-live="polite">
        <div className="adminSessionMark"><BrandLogo label="ROHO" /></div>
        <p>Staff Portal</p>
        <div className="adminSpinner" aria-hidden="true" />
        <h1>{timedOut ? "Connection is taking longer than expected" : title}</h1>
        <span>{timedOut ? "Please confirm the backend is running, then try again." : message}</span>
        {timedOut && (
          <button type="button" onClick={onRetry}>
            Try Again
          </button>
        )}
      </section>
    </main>
  );
}

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="adminPageHeader">
      <div>
        {eyebrow && <p>{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <span>{description}</span>}
      </div>
      {actions && <div className="adminPageActions">{actions}</div>}
    </header>
  );
}

export function StatusBadge({ value }) {
  const label = value || "Unknown";
  const key = label.toString().toLowerCase().replace(/\s+/g, "-");
  return <span className={`adminStatusBadge adminStatus-${key}`}>{label}</span>;
}

export function EmptyState({ title = "No records yet", description, actionLabel, onAction }) {
  return (
    <section className="adminEmptyState">
      <div className="adminEmptyIcon" aria-hidden="true">+</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export function ErrorState({ title = "Unable to load this view", message, onRetry }) {
  return (
    <section className="adminErrorCard" role="alert">
      <div>
        <p>{title}</p>
        <span>{message || "Something interrupted the request. Please try again."}</span>
      </div>
      <div className="adminErrorActions">
        {onRetry && <button type="button" onClick={onRetry}>Try Again</button>}
        <Link href="/admin">Return to Dashboard</Link>
      </div>
    </section>
  );
}

export function LoadingSkeleton({ type = "table", rows = 5 }) {
  if (type === "cards") {
    return (
      <div className="adminCards">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="adminMetricCard adminSkeletonCard" key={index}>
            <span className="adminSkeletonLine short" />
            <strong className="adminSkeletonLine number" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="adminTableWrap adminSkeletonTable">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="adminSkeletonRow" key={index}>
          <span className="adminSkeletonLine" />
          <span className="adminSkeletonLine" />
          <span className="adminSkeletonLine short" />
          <span className="adminSkeletonLine short" />
        </div>
      ))}
    </div>
  );
}
