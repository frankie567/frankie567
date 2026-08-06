const elements = document.querySelectorAll("pre.mermaid");

if (elements.length > 0) {
  const { default: mermaid } = await import(
    "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
  );
  mermaid.initialize({ startOnLoad: false, theme: "dark" });

  await Promise.all(
    Array.from(elements, async (element, index) => {
      const { svg } = await mermaid.render(
        `mermaid-${index}`,
        element.textContent,
      );
      element.innerHTML = svg;
    }),
  );
}
