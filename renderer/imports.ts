// Append every page to the main.html file using fetch() since
// HTML Imports (<link rel="import">) were removed in Chromium 79.

const links = Array.from(
  document.querySelectorAll<HTMLLinkElement>('link[rel="import"]'),
);

const loads = links.map((link) =>
  fetch(link.getAttribute("href") as string)
    .then((r) => r.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const template = doc.querySelector(
        ".page-template",
      ) as HTMLTemplateElement;
      return document.importNode(template.content, true);
    }),
);

Promise.all(loads).then((clones) => {
  clones.forEach((clone) => document.body.appendChild(clone));
  require("../app/app-navbar");
  require("../app/app-pageloader");
});
