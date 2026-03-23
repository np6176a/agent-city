import { useEventStore } from '../state/eventStore';

export function TeachingPopup() {
  const { teachingContent, setTeachingContent } = useEventStore();

  if (!teachingContent) return null;

  return (
    <div className="fixed bottom-20 right-4 z-20 w-80 bg-gray-900/95 border border-violet-500 rounded-2xl p-5 flex flex-col gap-3 shadow-lg shadow-violet-500/20">
      <h4 className="text-violet-300 text-sm font-bold uppercase tracking-wide">
        {teachingContent.concept.replace(/_/g, ' ')}
      </h4>
      <h3 className="text-white text-base font-semibold">
        {teachingContent.title}
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        {teachingContent.explanation}
      </p>
      <button
        onClick={() => setTeachingContent(null)}
        className="self-end text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}
