/** Result of a save, shown right beside the Save button it belongs to. */
export type SaveNoteState = { id: string; ok: boolean; text: string } | null;

export function SaveNote({ note, id }: { note: SaveNoteState; id: string }) {
  if (!note || note.id !== id) return null;
  return (
    <span
      role="status"
      style={{
        fontSize: 13.5,
        alignSelf: "center",
        color: note.ok ? "var(--signal)" : "var(--red, #e23b3b)",
      }}
    >
      {note.text}
    </span>
  );
}
