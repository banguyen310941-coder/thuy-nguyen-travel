/** Keep imported line breaks and separate sentences without changing tour copy. */
export function itineraryParagraphs(text: string): string[] {
  return text
    .replace(/([.!?…])\s+(?=[A-ZÀ-ỸĐ])/gu, '$1\n')
    .split(/\r?\n+/)
    .map(line => line.trim())
    .filter(Boolean);
}

export function TourItineraryPeriod({label, text}: {label: string; text: string}) {
  return <div className="tour-itinerary-period" style={{marginBottom: 20}}>
    <p style={{marginBottom: 8}}><b>{label}</b></p>
    {itineraryParagraphs(text).map((paragraph, index) =>
      <p key={index} style={{margin: '0 0 12px', lineHeight: 1.8}}>{paragraph}</p>
    )}
  </div>;
}
