import React from "react";

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

/**
 * Faz o parse inline de elementos Markdown:
 * - Links: [texto](url)
 * - Código inline: `código`
 * - Negrito + Itálico: ***texto*** ou ___texto___
 * - Negrito: **texto** ou __texto__
 * - Itálico: *texto* ou _texto_
 * - Tachado: ~~texto~~
 */
export function parseInlineMarkdown(text: string, isUser = false): React.ReactNode[] {
  if (!text) return [];

  // 1 & 2: link [texto](url)
  // 3 & 4: inline code `code`
  // 5 & 6: ***bold italic***
  // 7 & 8: ___bold italic___
  // 9 & 10: **bold**
  // 11 & 12: __bold__
  // 13 & 14: *italic*
  // 15 & 16: _italic_
  // 17 & 18: ~~strikethrough~~
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\))|(`([^`]+)`)|(\*\*\*([^*]+)\*\*\*)|(___([^_]+)___)|(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*]+)\*)|(\b_([^_]+)_\b)|(~~([^~]+)~~)/g;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    const key = `inline-${match.index}`;

    if (match[1]) {
      // Link [text](url)
      result.push(
        <a
          key={key}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: isUser ? "#FFFFFF" : "#D68C70",
            textDecoration: "underline",
            fontWeight: 600,
          }}
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      // Inline code `code`
      result.push(
        <code
          key={key}
          style={{
            background: isUser ? "rgba(255, 255, 255, 0.2)" : "rgba(45, 58, 46, 0.08)",
            color: isUser ? "#FFFFFF" : "#2D3A2E",
            padding: "2px 5px",
            borderRadius: 4,
            fontSize: "0.88em",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {match[5]}
        </code>
      );
    } else if (match[6] || match[8]) {
      // Bold + Italic ***text*** or ___text___
      result.push(
        <strong key={key} style={{ fontWeight: 700 }}>
          <em>{match[7] || match[9]}</em>
        </strong>
      );
    } else if (match[10] || match[12]) {
      // Bold **text** or __text__
      result.push(
        <strong key={key} style={{ fontWeight: 700 }}>
          {match[11] || match[13]}
        </strong>
      );
    } else if (match[14] || match[15]) {
      // Italic *text* or _text_
      result.push(
        <em key={key} style={{ fontStyle: "italic" }}>
          {match[14] || match[16]}
        </em>
      );
    } else if (match[17]) {
      // Strikethrough ~~text~~
      result.push(
        <del key={key} style={{ textDecoration: "line-through", opacity: 0.8 }}>
          {match[18]}
        </del>
      );
    } else {
      result.push(match[0]);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

type Block =
  | { type: "code"; lang?: string; code: string }
  | { type: "h1" | "h2" | "h3" | "h4"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "hr" }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] }
  | { type: "p"; lines: string[] };

export function MarkdownRenderer({ content, isUser = false }: MarkdownRendererProps) {
  if (!content) return null;

  const rawLines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];

  let currentList: { type: "ol" | "ul"; items: string[] } | null = null;
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      blocks.push({ type: "p", lines: [...currentParagraphLines] });
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push({ ...currentList });
      currentList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // 1. Bloco de código fenced com ```
    if (trimmed.startsWith("```")) {
      if (!inCodeBlock) {
        flushParagraph();
        flushList();
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeBlockLines = [];
      } else {
        inCodeBlock = false;
        blocks.push({
          type: "code",
          lang: codeBlockLang,
          code: codeBlockLines.join("\n"),
        });
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // 2. Linha em branco
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // 3. Linha horizontal (--- ou *** ou ___)
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }

    // 4. Cabeçalhos (#, ##, ###, ####)
    if (trimmed.startsWith("#### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h4", text: trimmed.slice(5).trim() });
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
      continue;
    }

    // 5. Citações (> citação)
    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "blockquote", text: trimmed.slice(2).trim() });
      continue;
    }

    // 6. Lista ordenada (1. item ou 1) item)
    const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // 7. Lista não ordenada (- item, * item, • item, + item)
    const ulMatch = trimmed.match(/^[-*•+]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // 8. Linha de parágrafo comum
    if (currentList) {
      flushList();
    }
    currentParagraphLines.push(trimmed);
  }

  // Fim do loop - descarregar pendências
  if (inCodeBlock && codeBlockLines.length > 0) {
    blocks.push({
      type: "code",
      lang: codeBlockLang,
      code: codeBlockLines.join("\n"),
    });
  }
  flushParagraph();
  flushList();

  return (
    <div
      className="markdown-content"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        color: isUser ? "#FDFBF7" : "#2D3A2E",
        wordBreak: "break-word",
      }}
    >
      {blocks.map((block, idx) => {
        const isLast = idx === blocks.length - 1;

        switch (block.type) {
          case "code":
            return (
              <pre
                key={`code-${idx}`}
                style={{
                  background: isUser ? "rgba(0, 0, 0, 0.25)" : "rgba(45, 58, 46, 0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  overflowX: "auto",
                  fontSize: 12,
                  fontFamily: "ui-monospace, monospace",
                  margin: "4px 0",
                  border: isUser ? "none" : "1px solid rgba(45, 58, 46, 0.08)",
                  color: isUser ? "#FFFFFF" : "#2D3A2E",
                }}
              >
                <code>{block.code}</code>
              </pre>
            );

          case "h1":
            return (
              <h3
                key={`h1-${idx}`}
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 16,
                  fontWeight: 600,
                  margin: "8px 0 2px 0",
                  color: isUser ? "#FFFFFF" : "#2D3A2E",
                }}
              >
                {parseInlineMarkdown(block.text, isUser)}
              </h3>
            );

          case "h2":
            return (
              <h4
                key={`h2-${idx}`}
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 15,
                  fontWeight: 600,
                  margin: "6px 0 2px 0",
                  color: isUser ? "#FFFFFF" : "#2D3A2E",
                }}
              >
                {parseInlineMarkdown(block.text, isUser)}
              </h4>
            );

          case "h3":
            return (
              <h5
                key={`h3-${idx}`}
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  margin: "4px 0 2px 0",
                  color: isUser ? "#FFFFFF" : "#2D3A2E",
                }}
              >
                {parseInlineMarkdown(block.text, isUser)}
              </h5>
            );

          case "h4":
            return (
              <h6
                key={`h4-${idx}`}
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  margin: "4px 0 2px 0",
                  color: isUser ? "#FFFFFF" : "#2D3A2E",
                }}
              >
                {parseInlineMarkdown(block.text, isUser)}
              </h6>
            );

          case "blockquote":
            return (
              <blockquote
                key={`quote-${idx}`}
                style={{
                  borderLeft: isUser ? "3px solid rgba(255, 255, 255, 0.6)" : "3px solid #D68C70",
                  margin: "4px 0",
                  paddingLeft: 10,
                  fontStyle: "italic",
                  opacity: 0.9,
                }}
              >
                {parseInlineMarkdown(block.text, isUser)}
              </blockquote>
            );

          case "hr":
            return (
              <hr
                key={`hr-${idx}`}
                style={{
                  border: "none",
                  borderTop: isUser ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(45, 58, 46, 0.12)",
                  margin: "8px 0",
                }}
              />
            );

          case "ol":
            return (
              <ol
                key={`ol-${idx}`}
                style={{
                  paddingLeft: 22,
                  margin: "2px 0 6px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  listStyleType: "decimal",
                }}
              >
                {block.items.map((item, itemIdx) => (
                  <li key={`ol-item-${itemIdx}`} style={{ lineHeight: 1.5 }}>
                    {parseInlineMarkdown(item, isUser)}
                  </li>
                ))}
              </ol>
            );

          case "ul":
            return (
              <ul
                key={`ul-${idx}`}
                style={{
                  paddingLeft: 20,
                  margin: "2px 0 6px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  listStyleType: "disc",
                }}
              >
                {block.items.map((item, itemIdx) => (
                  <li key={`ul-item-${itemIdx}`} style={{ lineHeight: 1.5 }}>
                    {parseInlineMarkdown(item, isUser)}
                  </li>
                ))}
              </ul>
            );

          case "p":
          default:
            return (
              <p
                key={`p-${idx}`}
                style={{
                  margin: isLast ? 0 : "0 0 4px 0",
                  lineHeight: 1.55,
                }}
              >
                {block.lines.map((lineText, lineIdx) => (
                  <React.Fragment key={`line-${lineIdx}`}>
                    {parseInlineMarkdown(lineText, isUser)}
                    {lineIdx < block.lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
