import { unescape } from "@std/html";
import { cacheOrFetch } from "./index.ts";

export default async function (): Promise<Record<string, string>[]> {
  await Deno.mkdir("data/pgbooks", { recursive: true });

  const books = [];
  for (let i = 1; i <= 5; i++) {
    const page = await cacheOrFetch(
      `https://www.pgbooks.ru/books/js/all/?JS=Y&PAGEN_1=${i}`,
      `data/pgbooks/index.${i}.html`,
    );

    for (
      const [html] of page.matchAll(/<td valign="top">.*?<\/table><br \/>/gs)
    ) {
      const [_0, id = "", titre = ""] = html.match(
        /<div class="title"><a href="\/books\/book\/(\d+)\/">(.*?)<\/a><\/div>/,
      ) ?? [];

      const b = {
        titre,
        auteur: "",
        illustrateur: "",
        traducteur: "",
        serie: "",
        age: "",
        url: `https://www.pgbooks.ru/books/book/${id}/`,
      };
      books.push(b);

      const [_1, propsHTML = ""] = html.match(
        /" valign="top">(.*?)<\/table><br \/>/s,
      ) ?? [];

      for (
        const [_, rawKey, rawValue] of propsHTML.matchAll(
          /(.*?)(<a .*?)<br \/>/gs,
        )
      ) {
        const key = unescape(rawKey.replaceAll(/<[^>]+>/g, ""))
          .trim()
          .replace(/:$/, "");
        const value = unescape(rawValue.replaceAll(/<[^>]+>/g, "")).trim();
        switch (key) {
          case "Составитель": // compilateur
          case "Куратор": // currateur
          case "Автор": // auteur
            b.auteur = value;
            break;
          case "Иллюстратор":
            b.illustrateur = value;
            break;
          case "Переводчик":
            b.traducteur = value;
            break;
          case "Рекомендуемый возраст":
            b.age = value;
            break;
          case "Серия":
            b.serie = value;
            break;
          case "Дата выхода":
            break;
          default:
            console.log(key, "=>", value);
            break;
        }
      }
    }
  }

  return books;
}
