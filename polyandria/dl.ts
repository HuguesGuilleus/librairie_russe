// await Deno.mkdir("data", { recursive: true });
// for (let page = 1; page <= 8; page++) {
// 	const url = `https://polyandria.ru/catalog/?PAGEN_1=${page}`,
// 		response = await fetch(url);
// 	console.log(url, response.status, response.statusText);
// 	await Deno.writeFile(`data/index.${page}.html`, await response.bytes());
// 	await new Promise((resolve) => setTimeout(resolve, 500));
// }

// <div class="book__item__name"><a href="/catalog/3-7/zemleroyka-nosik/" t

const index = [];
for (let page = 1; page <= 8; page++) {
	const file = await Deno.readTextFile(`data/index.${page}.html`);
	for (
		const [_, path] of file.matchAll(
			/<div class="book__item__name"><a href="([^"]+)"/g,
		)
	) {
		index.push(path);
		const url = "https://polyandria.ru" + path,
			response = await fetch(url);
		console.log(url, response.status, response.statusText);
		await Deno.writeFile(
			`data/book.${path.replaceAll("/", "_")}.html`,
			await response.bytes(),
		);
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
}
Deno.writeTextFile("data/index.json", JSON.stringify(index));
