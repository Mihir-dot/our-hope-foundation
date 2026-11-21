import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <EmptyState
          title="That page is not here"
          body="It may have moved. Programs, resources, and search are good places to continue."
          actionHref="/"
          actionLabel="Back home"
        />
      </div>
    </section>
  );
}
