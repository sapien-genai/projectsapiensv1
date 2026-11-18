/** Retry temporary intake failures; never log the lead's address or form body. */
export async function deliverLead(target: string, form: URLSearchParams, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(target, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(), signal: AbortSignal.timeout(10000),
      });
      await response.body?.cancel();
      if (response.ok) return true;
      if (response.status < 500 && response.status !== 429) return false;
    } catch { /* network/timeout failure: retry */ }
  }
  return false;
}
