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

async function readJSON<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: T & { error?: string };
  try {
    data = JSON.parse(text) as T & { error?: string };
  } catch {
    throw new Error(text || res.statusText);
  }
  if (!res.ok) {
    throw new Error(data.error || text || res.statusText);
  }
  return data;
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
  return readJSON<ScanResponse>(res);
}

export async function getRelate(apiBase: string, dept: string): Promise<unknown> {
  const q = new URLSearchParams({ dept });
  const res = await fetch(`${apiBase}/v1/relate?${q}`);
  return readJSON<unknown>(res);
}
