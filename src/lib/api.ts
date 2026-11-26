export type ScanDocument = {
  source?: string;
  valuePath?: string;
  type?: string;
  mode?: string;
  rescan?: boolean;
  message?: string;
};

export type ScanResponse = {
  documents?: ScanDocument[];
  relations?: unknown[];
  checks?: unknown[];
};

const STORAGE_KEY = "DIGITIZER_API";

export function resolveApiBase(explicit?: string): string {
  const params = new URLSearchParams(location.search);
  const fromQuery = params.get("api");
  const value = (explicit || fromQuery || localStorage.getItem(STORAGE_KEY) || "http://127.0.0.1:8091").trim();
  return value.replace(/\/$/, "");
}

export function persistApiBase(base: string): void {
  localStorage.setItem(STORAGE_KEY, base.replace(/\/$/, ""));
}

export async function postScan(
  apiBase: string,
  opts: { dept: string; mode?: string; file: Blob; filename: string },
): Promise<ScanResponse> {
  const body = new FormData();
  body.append("dept", opts.dept);
  if (opts.mode) body.append("mode", opts.mode);
  body.append("file", opts.file, opts.filename);

  const res = await fetch(`${apiBase}/v1/scan`, { method: "POST", body });
  const text = await res.text();
  let data: ScanResponse & { error?: string };
  try {
    data = JSON.parse(text) as ScanResponse & { error?: string };
  } catch {
    throw new Error(text || res.statusText);
  }
  if (!res.ok) {
    throw new Error(data.error || text || res.statusText);
  }
  return data;
}
