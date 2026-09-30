export default async function (): Promise<Record<string, string>[]> {
  const index = JSON.parse(
    await Deno.readTextFile("polyandria/data/index.json"),
  );

  const books = [];
  for (const path of index) {
    const page = await Deno.readTextFile(
      `polyandria/data/book.${path.replaceAll("/", "_")}.html`,
    );
    const [_0, title] = page.match(/<h1>(.*?)<\/h1>/s) ?? [];
    const [_1, m] = page.match(/<!-- Свойства -->(.*)<\/dl>/s) ?? [];

    const info = {
      title,
      age_restrictions: "",
      author: "",
      illustrator: "",
      page: "", /////////////////////
      publication_year: "",
      total_circulation: "",
      // country: "",
      format: "",
      cover: "",
      illustrations: "",
      isbn: "",
      length: "",
      // langue or translator
      translation: "",
      url: "https://polyandria.ru" + path,
    };
    for (
      const chunck of m.split(/(?:<dt>)/)
        .map((s) => s && s.trim())
        .filter((s) => s)
    ) {
      const [_1, key, value] =
        chunck.match(/(.*?):?<\/dt>\s*<dd>\s*(.*?)\s*<\/dd>/s) ?? [];
      switch (key) {
        case "Возрастные ограничения":
          info.age_restrictions = value;
          break;
        case "Автор(ы)":
          info.author = value.replaceAll(/<[^>]+>/g, "").replaceAll(
            "&nbsp;",
            " ",
          );
          break;
        case "Иллюстратор":
          info.illustrator = value.replaceAll(/<[^>]+>/g, "").replaceAll(
            "&nbsp;",
            " ",
          );
          break;
        case "Страна":
          info.page = value;
          // info.page = parseInt(value);
          break;
        case "Год издания":
          info.publication_year = value;
          break;
        case "Суммарный тираж":
          info.total_circulation = value;
          break;
        case "Формат":
          info.format = value;
          break;
        case "Обложка":
          info.cover = value;
          break;
        case "Иллюстрации":
          //////////////////////////////////////
          info.illustrations = value;
          break;
        case "ISBN":
          info.isbn = value;
          break;
        case "Объём, стр.":
          /////////////////////
          info.length = value;
          break;
        case "Перевод":
          info.translation = value.replaceAll(/<[^>]+>/g, "").replaceAll(
            "&nbsp;",
            " ",
          );
          break;
      }
    }

    books.push(info);
  }

  return books;
}
