import { cacheOrFetch } from "./index.ts";

export default async function (): Promise<Record<string, string>[]> {
  await Deno.mkdir("data/pgbooks", { recursive: true });

  const ids = new Set();
  for (let page = 1; page <= 63; page++) {
    const url = `https://samtambooks.com/catalog/?PAGEN_7=${page}`;
    const html = await cacheOrFetch(url, `data/pgbooks/index.${page}.html`);
    for (const [_, id] of html.matchAll(/<a href="\/book\/([^"]+)\/">/g)) {
      ids.add(id);
    }
  }

  const books = [];
  for (const id of ids) {
    const url = `https://samtambooks.com/book/${id}/`;
    const html = await cacheOrFetch(url, `data/pgbooks/item.${id}.html`);

    const [_0, titre = ""] = html.match(
      /<h1 class=".*?">\s*([^<]+)\s*<\/h1>/,
    ) ?? [];

    const [_3, langue = "", traducteur = ""] = html.match(
      /<span>\s*перевод:\s*<\/span>\s*(.*?)\s*<a href="[^"]+">(.*?)<\/a>/,
    ) ?? [];

    const b = {
      titre,
      auteur: "",
      illustrateur: "",
      langue,
      traducteur,
      annee: "",
      serie: "",
      age: "",
      genre: "",
      editeur: "",
      dimensions: "",
      poids: "",
      pages: "",
      isbn: "",
      url,
    };
    books.push(b);
    for (
      const [_, key, rawValue] of html.matchAll(
        /<div class="detail-content_option">\s*<span>\s+([^<:]+):?\s+<\/span>\s+(.*?)\s+<\/div>/gs,
      )
    ) {
      const value = rawValue
        .replaceAll(/<.*?>/gs, "")
        .replaceAll(/\s+/gs, " ")
        .trim();
      switch (key) {
        case "Автор":
          b.auteur = value;
          break;
        case "Иллюстратор":
          b.illustrateur = value;
          break;
        case "серия":
          b.serie = value;
          break;
        case "рекомендуемый возраст":
          b.age = value;
          break;
        case "жанр":
          b.genre = value;
          break;
        case "издательство":
          b.editeur = value;
          break;
        case "размер":
          b.dimensions = value;
          break;
        case "Вес":
          b.poids = value;
          break;
        case "ISBN":
          b.isbn = value;
          break;
        case "год":
          b.annee = value;
          break;
        case "страниц":
          b.pages = value;
          break;

        // ignore this fields
        case "обложка":
        case "перевод":
        case "Бренд":
        case "Редактор":
          break;

        default:
          console.log(key, "=>", value);
          break;
      }
    }
  }

  return books;
}
