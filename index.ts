import { stringify } from "@std/csv/stringify";
import polyandria from "./polyandria/parse.ts";
import { html, htmlRoot, htmlSec } from "@huguesguilleus/html";

export async function output(
  books: readonly Record<string, string>[],
  name: string,
) {
  await Deno.writeTextFile(
    `output/${name}.csv`,
    stringify(books, { columns: [...Object.keys(books[0])] }),
  );

  Deno.writeTextFile(
    `output/${name}.html`,
    htmlRoot(
      "html lang=ru",
      html(
        "head",
        htmlSec`<meta charset=utf-8>`,
        htmlSec`<meta name=viewport content="width=device-width,initial-scale=1">`,
        html("title", name),
        html(
          "style",
          "body{font-family:sans-serif}",
          "table{border-collapse:collapse;width:100%}",
          "table,th,td{border:1px solid}",
          "th,td{padding:.2ex}",
        ),
      ),
      html(
        "body",
        html("h1", name),
        html("p", "Nombre d'entrée: ", books.length + ""),
        html(
          "table",
          html(
            "tr",
            [...Object.keys(books[0])].map((key) => html("th", key)),
          ),
          ...books.map((book) =>
            html(
              "tr",
              [...Object.entries(book)].map(([key, value]) =>
                html("td", value ?? "")
              ),
            )
          ),
        ),
      ),
    ),
  );
}

await Deno.mkdir("output", { recursive: true });
output(await polyandria(), "polyandria");
