/** Styles for the dashboard Prospector screen. Kept here so the public site stylesheet is never touched. */
const CSS = `
.pr-form{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,2fr) minmax(0,1fr) auto;gap:12px;align-items:end}
.pr-form .field{margin-bottom:0}
.pr-opts{display:flex;flex-wrap:wrap;gap:8px 22px;margin-top:14px;font-size:13px;color:var(--mute);align-items:center}
.pr-opts label{display:flex;gap:8px;align-items:center;cursor:pointer}
.pr-note{border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:14px;color:var(--chalk);display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center}
.pr-note.is-ok{border-color:var(--signal)}
.pr-note.is-warn{border-color:var(--rec)}
.pr-bar{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;justify-content:space-between;margin:6px 0 14px}
.pr-bar-group{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.pr-seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.pr-seg button{background:transparent;border:0;color:var(--mute);font:inherit;font-size:12.5px;font-weight:600;padding:8px 13px;cursor:pointer}
.pr-seg button.on{background:var(--rec);color:#fff}
.pr-mini{font-size:13px;padding:9px 14px}
.pr-progress{height:5px;border-radius:999px;background:var(--line);overflow:hidden;margin-top:8px;width:100%}
.pr-progress i{display:block;height:100%;background:var(--rec);transition:width .3s ease}
.pr-filters{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}
.pr-filters .field{margin-bottom:0;min-width:160px}
.pr-lead{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1.3fr) minmax(0,.9fr);gap:10px 22px;border:1px solid var(--line);border-radius:12px;background:var(--deep);padding:16px 18px;margin-bottom:10px}
.pr-lead .field{margin-bottom:0}
.pr-lead-name{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pr-lead-name b{color:var(--chalk);font-size:16px}
.pr-lead-addr{color:var(--mute);font-size:13px;margin-top:4px;line-height:1.5}
.pr-lead-links{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:8px;font-size:12.5px;color:var(--mute)}
.pr-lead-links a{color:var(--signal);text-decoration:underline}
.pr-lead-label{display:block;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);margin-bottom:6px}
.pr-email{font-size:14px;word-break:break-word;color:var(--chalk)}
.pr-email a{color:var(--chalk)}
.pr-email-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pr-dim{color:var(--mute);font-size:13px}
.pr-chip{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--line);border-radius:999px;padding:3px 9px;color:var(--mute)}
.pr-chip.is-good{border-color:var(--signal);color:var(--signal)}
.pr-chip.is-hot{border-color:var(--rec);color:var(--rec)}
.pr-lead-notes{grid-column:1 / -1}
.pr-spin{display:inline-block;width:12px;height:12px;border:1.5px solid var(--mute);border-top-color:transparent;border-radius:50%;animation:pr-spin .8s linear infinite;vertical-align:-2px;margin-right:6px}
@keyframes pr-spin{to{transform:rotate(360deg)}}
@media(max-width:900px){.pr-form{grid-template-columns:1fr}.pr-lead{grid-template-columns:1fr}}
.pr-pick{display:inline-flex;align-items:center;margin-right:2px}
.pr-pick input{width:17px;height:17px;accent-color:var(--rec);cursor:pointer}
.pr-details{border-top:1px solid var(--line);padding-top:16px;margin-top:4px;display:grid;gap:16px}
.pr-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.pr-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}
.pr-grid2 .field{margin-bottom:0}
.pr-dnc{margin-top:14px}
.pr-log{display:grid;grid-template-columns:110px minmax(0,1fr) 170px auto;gap:10px;align-items:center;margin-bottom:12px}
.pr-log select,.pr-log input{width:100%;background:var(--ink);border:1px solid var(--line);border-radius:8px;padding:10px 12px;color:var(--chalk);font-family:'Inter',sans-serif;font-size:14px}
.pr-timeline{list-style:none;padding:0;margin:0;display:grid;gap:8px}
.pr-timeline li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:baseline;border-top:1px solid var(--line);padding-top:8px;font-size:14px;color:var(--chalk)}
.pr-footer-preview{white-space:pre-wrap;word-break:break-word;background:var(--ink);border:1px dashed var(--line);border-radius:8px;padding:12px 14px;font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1.6;color:var(--mute);margin:6px 0 0}
.pr-bulk{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;border:1px solid var(--rec);border-radius:12px;padding:12px 16px;margin-bottom:14px;background:var(--deep)}
.pr-bulk select,.pr-bulk input[type="date"]{background:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px 10px;color:var(--chalk);font-family:'Inter',sans-serif;font-size:13px}
.pr-bulk-group{display:flex;gap:8px;align-items:center}
@media(max-width:900px){.pr-grid,.pr-grid2{grid-template-columns:1fr}.pr-log{grid-template-columns:1fr}.pr-timeline li{grid-template-columns:1fr}}
`;

export function AdminProspectorStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}
