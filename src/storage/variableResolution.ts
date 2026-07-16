import type { ScopedVariable } from "./store";

export interface VariableTemplateSource {
  loadAll(): ScopedVariable[];
}

/**
 * Resolve only the explicit `{{name}}` syntax. Shell/PowerShell `$name`
 * expressions are deliberately left untouched so untrusted source samples are
 * never silently rewritten. The store is loaded once per transformation.
 */
export function resolveVariableTemplates(
  text: string,
  source: VariableTemplateSource,
): string {
  const values = new Map<string, string>();
  for (const variable of source.loadAll()) {
    // PipelineStore order is workspace then global; first value therefore
    // preserves workspace precedence for duplicate names.
    if (!values.has(variable.name)) values.set(variable.name, variable.value);
  }
  return text.replace(/\{\{([^{}\r\n]{1,200})\}\}/g, (original, name: string) => {
    return values.get(name.trim()) ?? original;
  });
}
