import { cacheOrFetch } from "./index.ts";

export default async function (): Promise<Record<string, string>[]> {
  const data = JSON.parse(
    await cacheOrFetch(
      "https://store.tildaapi.com/api/getproductslist/?storepartuid=938002298858&recid=724791072&c=1791194913606&getparts=true&getoptions=true&filters%5Bcharact%3A6830714%5D%5B0%5D=%D0%9A%D0%9D%D0%98%D0%93%D0%98&size=200&flag_root=withroot",
      "data/apricotbooks-1.json",
    ),
  );

  return data.products.map((b: Record<string, string>) => {
    return {
      titre: b.title,
      info: b.descr,
      desc: b.text,
      isbn: b.sku,
      url: b.url,
    };
  });
}
