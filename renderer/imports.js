// Append every page to the main.html file

const links = document.querySelectorAll('link[rel="import"]');
    links.forEach(link => {
      let template = link.import.querySelector('.page-template')
      var clone = document.importNode(template.content, true);
      document.querySelector('body').appendChild(clone);
    });