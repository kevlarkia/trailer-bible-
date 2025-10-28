// Simple parser for the "Super Simple Categorization & Summary Prompt" template
// Detects: TRIGGER WORD: <KEYWORD> on its own line, then returns { keyword, payload }

function parseTriggerBlock(text) {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  let keyword = null;
  let triggerLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*TRIGGER\s+WORD:\s*(.+?)\s*$/i);
    if (m) {
      keyword = m[1].trim();
      triggerLine = i;
      break;
    }
  }
  if (!keyword || triggerLine < 0) return null;
  const payload = lines.slice(triggerLine + 1).join('\n').trim();
  return { keyword, payload };
}

module.exports = { parseTriggerBlock };
