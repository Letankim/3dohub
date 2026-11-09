/** Helpers for SFDT (Syncfusion Document Editor JSON). */

type Json = Record<string, unknown>;

/** Replace footnote inlines with plain superscript text so the document can still open. */
export function stripFootnotes(sfdt: Json): Json {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node.map((n) => {
        if (n && typeof n === 'object' && 'footnoteType' in (n as Json)) {
          return { text: '*', characterFormat: { baselineAlignment: 'Superscript' } };
        }
        return walk(n);
      });
    }
    if (node && typeof node === 'object') {
      const out: Json = {};
      for (const [k, v] of Object.entries(node as Json)) out[k] = walk(v);
      return out;
    }
    return node;
  };
  return walk(sfdt) as Json;
}

