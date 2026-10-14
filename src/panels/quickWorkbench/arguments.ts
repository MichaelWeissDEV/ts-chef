import type { ArgConfig } from "../../chef/Operation";
import { resolveDefaultArgs } from "../../commands/argDefaults";
import { WebviewLimits } from "../../webview/security";

/** Same defaults and positional order as the recipe and pipeline editors. */
export function resolveArguments(defs: ArgConfig[] | undefined, values: Record<string, unknown>): unknown[] {
  if (!defs) throw new Error("Argument definitions unavailable");
  for (const key of Object.keys(values)) if (!defs.some(def => def.name === key)) throw new Error(`Unknown argument: ${key}`);
  const defaults = resolveDefaultArgs(defs);
  return defs.map((def, index) => {
    const value = Object.hasOwn(values, def.name) ? values[def.name] : defaults[index];
    const fail = () => { throw new Error(`Invalid argument: ${def.name} (${def.type})`); };
    const checkString = (v: unknown) => {
      if (typeof v !== "string" || v.length > Math.min(def.maxLength ?? Infinity, WebviewLimits.maxArgumentStringLength)) fail();
    };
    const options = Array.isArray(def.value) ? def.value : [];
    switch (def.type) {
      case "boolean": if (typeof value !== "boolean") fail(); break;
      case "number":
        if (typeof value !== "number" || !Number.isFinite(value) || value < (def.min ?? -Infinity) || value > (def.max ?? Infinity)) fail();
        break;
      case "option": if (!options.includes(value as never)) fail(); break;
      case "argSelector":
        if (!options.some(option => typeof option === "object" && option !== null && "name" in option && option.name === value)) fail();
        break;
      case "populateOption": case "populateMultiOption":
        if (!options.some(option => typeof option === "object" && option !== null && "value" in option && JSON.stringify(option.value) === JSON.stringify(value))) fail();
        break;
      case "label": if (value !== "") fail(); break;
      case "editableOption": case "editableOptionShort":
        if (typeof value === "string") checkString(value);
        else if (!options.some(option => typeof option === "object" && option !== null && "value" in option && JSON.stringify(option.value) === JSON.stringify(value))) fail();
        break;
      case "toggleString": {
        if (!value || typeof value !== "object" || Array.isArray(value)) return fail();
        const item = value as Record<string, unknown>;
        if (Object.keys(item).length !== 2 || !(def.toggleValues ?? ["Hex"]).includes(item.option as string)) fail();
        checkString(item.string);
        break;
      }
      case "string": case "text": case "binaryString": case "binaryShortString": case "shortString": checkString(value); break;
      default: return fail();
    }
    return structuredClone(value);
  });
}
