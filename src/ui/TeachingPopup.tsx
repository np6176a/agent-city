import { useEventStore } from '../state/eventStore';

export function TeachingPopup() {
  const { teachingContent, setTeachingContent } = useEventStore();

  if (!teachingContent) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-20 w-80 rounded-2xl p-5 flex flex-col gap-3 shadow-lg"
      style={{
        backgroundColor: 'rgba(15, 15, 26, 0.95)',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        boxShadow: '0 0 24px rgba(167, 139, 250, 0.12)',
      }}
    >
      <h4 className="font-headline text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--violet)' }}>
        {teachingContent.concept.replace(/_/g, ' ')}
      </h4>
      <h3 className="text-white text-base font-headline font-bold">
        {teachingContent.title}
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        {teachingContent.explanation}
      </p>
      <button
        onClick={() => setTeachingContent(null)}
        className="self-end text-xs transition-colors"
        style={{ color: 'var(--violet)' }}
      >
        Dismiss
      </button>
    </div>
  );
}
