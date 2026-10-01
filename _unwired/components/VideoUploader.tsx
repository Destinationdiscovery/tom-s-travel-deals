import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createMediaUpload } from "@/lib/admin-content.functions";

const TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_BYTES = 250 * 1024 * 1024;

export function VideoUploader({
  value,
  onChange,
  label = "Video file",
  hint = "MP4, WebM or MOV. Up to 250MB.",
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  hint?: string;
}) {
  const prepare = useServerFn(createMediaUpload);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    if (!TYPES.includes(file.type)) return setError("Only MP4, WebM and MOV videos are accepted.");
    if (file.size > MAX_BYTES) return setError("That video is over 250MB. Please use a smaller file.");
    setBusy(true);
    setProgress(10);
    try {
      const signed = await prepare({ data: { filename: file.name, contentType: file.type, size: file.size } });
      setProgress(35);
      const result = await supabase.storage.from("site").uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
      if (result.error) throw result.error;
      setProgress(100);
      onChange(signed.path);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="field">
    <span>{label}</span>
    <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ""; }} />
    <div className="adm-upload-actions">
      <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? `Uploading ${progress}%` : value ? "Replace video" : "Upload video"}</button>
      {value && <button className="linky" type="button" onClick={() => onChange(null)}>Remove</button>}
    </div>
    {error && <p className="adm-err">{error}</p>}
    <small className="adm-hint">{hint}</small>
  </div>;
}
