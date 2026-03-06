export async function readSseStream(response: Response): Promise<string> {
  if (!response.body) {
    throw new Error('Empty response stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let eventBuffer = '';
  let fullText = '';

  const processEvent = (rawEvent: string) => {
    const lines = rawEvent
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload);
        const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof chunk === 'string') {
          fullText += chunk;
        }
      } catch {
        // ignore malformed events
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    eventBuffer += decoder.decode(value, { stream: true });
    const events = eventBuffer.split(/\r?\n\r?\n/);
    eventBuffer = events.pop() || '';
    for (const event of events) {
      processEvent(event);
    }
  }

  eventBuffer += decoder.decode();
  if (eventBuffer.trim()) {
    processEvent(eventBuffer);
  }

  return fullText;
}
