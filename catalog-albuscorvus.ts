import { cacheOrFetch } from "./index.ts";

export default async function (): Promise<Record<string, string>[]> {
  await Deno.mkdir("data/albuscorvus", { recursive: true });

  // Get index
  const ids: string[] = [];
  for (let i = 1; i <= 13; i++) {
    const index = await cacheOrFetch(
      `https://albuscorvus.shop/collection/knigi?page=${i}`,
      `data/albuscorvus/index2.${i}.html`,
    );
    index.matchAll(
      /data-product-id="(\d+)"/g,
    ).forEach(([_, id = ""]) => ids.push(id));
  }

  // Get individual book pages
  const books = [];
  for (const id of ids) {
    const data = JSON.parse(
      await cacheOrFetch(
        `https://albuscorvus.shop/products_by_id/${id}.json?without_many_variants=true&accessories=true`,
        `data/albuscorvus/item.${id}.json`,
      ),
    );

    const isbn = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 12268795
    )?.title;
    const auteur = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 12268791
    )?.title;
    const illustrateur = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 12268933
    )?.title;
    const traducteur = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 12268934
    )?.title;
    const nombre_de_page = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 12268794
    )?.title;
    const couverture = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 12268793
    )?.title;
    const dimention = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 50404823
    )?.title;
    const collection = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 20610936
    )?.title;
    const age = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 12268792
    )?.title;
    const poids = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 25290926
    )?.title;
    const age18plus = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 62485459
    )?.title;
    const agent_etranger = data.products[0].characteristics.find((prop: any) =>
      prop.property_id === 62485464
    )?.title;
    const redacteur_scientifique = data.products[0].characteristics.find((
      prop: any,
    ) => prop.property_id === 40847909)?.title;

    books.push({
      title: data.products[0].title,
      auteur,
      illustrateur,
      traducteur,
      age18plus,
      agent_etranger,
      redacteur_scientifique,
      collection,
      couverture,
      dimention,
      nombre_de_page,
      poids,
      isbn,
      url: "https://albuscorvus.shop" + data.products[0].url,
    });
  }

  return books;
}
