export function renderFormattedMessage(
  content: string,
  onCardClick: (taskId: string) => void
) {
  // Regex para capturar #[Texto Visível](ID_REAL)
  const taskMentionRegex = /#\[([^\]]+)\]\(([^)]+)\)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = taskMentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    const label = match[1];  // Ex: "Teste de criação TST-01 (TST-01)"
    const taskId = match[2]; // Ex: "74c26a9e-3407-4b7a-aadc-bc2062bcbf08"

    parts.push(
      <button
        key={match.index}
        type="button"
        onClick={() => onCardClick(taskId)}
        className="inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-md text-xs font-semibold border border-indigo-400/30 transition-all cursor-pointer underline decoration-dotted"
        title="Clique para abrir detalhes da tarefa"
      >
        🏷️ #{label}
      </button>
    );

    lastIndex = taskMentionRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}