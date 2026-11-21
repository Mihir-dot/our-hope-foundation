import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="container">
      <Spinner label="Loading the page" />
    </div>
  );
}
