import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="section container">
      <h1>Page not found</h1>
      <p>That address is not part of Our Hope Foundation.</p>
      <Link href="/">Go to the homepage</Link>
    </main>
  );
}
