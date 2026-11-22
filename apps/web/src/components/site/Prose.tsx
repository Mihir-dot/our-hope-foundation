import { sanitizeHtml } from '@/lib/format';

export function Prose({ text }: { text?: string }) {
  if (!text?.trim()) return null;
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return <div className="prose prose-page" dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />;
  }
  const paragraphs = text.split(/\n{2,}|\n/).filter((paragraph) => paragraph.trim());
  return (
    <div className="prose prose-page">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
      ))}
    </div>
  );
}
