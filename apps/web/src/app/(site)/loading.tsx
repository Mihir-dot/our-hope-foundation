export default function Loading() {
  return (
    <div className="route-loader is-active route-loader-ssr" aria-busy="true">
      <div className="route-loader-spinner-wrap" role="status" aria-label="Loading">
        <span className="route-loader-spinner" />
      </div>
    </div>
  );
}
