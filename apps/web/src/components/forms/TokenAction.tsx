'use client';

import { useEffect, useState } from 'react';
import { clientFetch, errorText } from '@/lib/api';

export function TokenAction({
  token,
  endpoint,
  title,
  success,
  missing,
}: {
  token: string;
  endpoint: string;
  title: string;
  success: string;
  missing: string;
}) {
  const [message, setMessage] = useState(token ? 'One moment…' : missing);
  const [tone, setTone] = useState(token ? 'notice' : 'notice bad');

  useEffect(() => {
    if (!token) return;
    let cancel = false;
    clientFetch(endpoint, { method: 'POST', auth: false, body: JSON.stringify({ token }) })
      .then(() => {
        if (!cancel) {
          setTone('notice');
          setMessage(success);
        }
      })
      .catch((error) => {
        if (!cancel) {
          setTone('notice bad');
          setMessage(errorText(error));
        }
      });
    return () => {
      cancel = true;
    };
  }, [token, endpoint, success]);

  return (
    <section className="section">
      <div className="container narrow">
        <h1>{title}</h1>
        <p className={tone} role="status">{message}</p>
      </div>
    </section>
  );
}
