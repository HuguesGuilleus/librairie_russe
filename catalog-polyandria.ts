import { cacheOrFetch } from "./index.ts";

export default async function (): Promise<Record<string, string>[]> {
  await Deno.mkdir("data/polyandria", { recursive: true });

  const paths = [];
  for (let page = 1; page <= 8; page++) {
    const index = await cacheOrFetch(
      `https://polyandria.ru/catalog/?PAGEN_1=${page}`,
      `data/polyandria/index.${page}.html`,
    );
    for (
      const [_, path] of index.matchAll(
        /<div class="book__item__name"><a href="([^"]+)"/g,
      )
    ) {
      paths.push(path);
    }
  }

  const books = [];
  for (const path of paths) {
    const page = await cacheOrFetch(
      "https://polyandria.ru" + path,
      `data/polyandria/book.${path.replaceAll("/", "_")}.html`,
    );
    const [_0, titre] = page.match(/<h1>(.*?)<\/h1>/s) ?? [];
    const [_1, m] = page.match(/<!-- Свойства -->(.*)<\/dl>/s) ?? [];

    const b = {
      titre,
      auteur: "",
      illustrateur: "",
      translation: "",
      pays: "",
      annee_publication: "",
      age: "",
      nb_exemplaire: "",
      format: "",
      cover: "",
      illustrations: "",
      nb_page: "",
      isbn: "",
      url: "https://polyandria.ru" + path,
    };
    books.push(b);

    for (
      const chunck of m.split(/(?:<dt>)/)
        .map((s) => s && s.trim())
        .filter((s) => s)
    ) {
      const [_1, key, value] =
        chunck.match(/(.*?):?<\/dt>\s*<dd>\s*(.*?)\s*<\/dd>/s) ?? [];
      switch (key) {
        case "Автор(ы)":
          b.auteur = value
            .replaceAll(/<[^>]+>/g, "")
            .replaceAll("&nbsp;", " ");
          break;
        case "Иллюстратор":
          b.illustrateur = value
            .replaceAll(/<[^>]+>/g, "")
            .replaceAll("&nbsp;", " ");
          break;
        case "Перевод":
          b.translation = value
            .replaceAll(/<[^>]+>/g, "")
            .replaceAll("&nbsp;", " ");
          break;
        case "Страна":
          b.pays = value;
          break;
        case "Год издания":
          b.annee_publication = value;
          break;
        case "Возрастные ограничения":
          b.age = value;
          break;
        case "Суммарный тираж":
          b.nb_exemplaire = value;
          break;
        case "Формат":
          b.format = value;
          break;
        case "Обложка":
          b.cover = value;
          break;
        case "Иллюстрации":
          b.illustrations = value;
          break;
        case "Объём, стр.":
          b.nb_page = value;
          break;
        case "ISBN":
          b.isbn = value;
          break;
        default:
          console.log("key:", key, "=>", value);
          break;
      }
    }
  }

  return books;
}
