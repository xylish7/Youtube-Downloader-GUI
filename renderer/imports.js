// Append every page to the main.html file using fetch() since
// HTML Imports (<link rel="import">) were removed in Chromium 79.

const links = Array.from(document.querySelectorAll('link[rel="import"]'));

const loads = links.map((link) =>
  fetch(link.getAttribute("href"))
    .then((r) => r.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const template = doc.querySelector(".page-template");
      const clone = document.importNode(template.content, true);
      document.body.appendChild(clone);
    }),
);

Promise.all(loads).then(() => {
  require("../app/app-navbar.js");
  require("../app/app-pageloader.js");
});
