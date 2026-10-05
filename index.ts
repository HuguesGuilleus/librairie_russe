#!/usr/bin/env deno run --allow-net --allow-write=data --allow-write=output

import { stringify } from "@std/csv/stringify";
import { exists } from "@std/fs";
import { html, htmlRoot, htmlSec } from "@huguesguilleus/html";

import albuscorvus from "./catalog-albuscorvus.ts";
import pgbooks from "./catalog-pgbooks.ts";
import samtambooks from "./catalog-samtambooks.ts";
import polyandria from "./catalog-polyandria.ts";

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
          "tr:hover{background:silver}",
          "td:empty{background:grey}",
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
              [...Object.entries(book)].map(([_, value = ""]) =>
                html(
                  "td",
                  !!value.match(/^https?:\/\//)
                    ? htmlSec`<a href="${value}">${value}</a>`
                    : value,
                )
              ),
            )
          ),
        ),
      ),
    ),
  );
}

export async function cacheOrFetch(
  url: string | Request,
  path: string,
): Promise<string> {
  if (await exists(path)) {
    return Deno.readTextFile(path);
  }
  const response = await fetch(url);
  console.log(response.url, "=>", response.status, response.statusText);
  const data = await response.text();
  await Deno.writeTextFile(path, data);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return data;
}

if (import.meta.main) {
  await Deno.mkdir("output", { recursive: true });
  await output(await albuscorvus(), "albuscorvus");
  await output(await pgbooks(), "pgbooks");
  await output(await polyandria(), "polyandria");
  await output(await samtambooks(), "samtambooks");
}
