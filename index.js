const alfy = require("alfy");
const query = alfy.input;
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const merge = require('merge')

const search = (items, ret) => {
	items.forEach(item => {
		if ((item.title && item.title.toLowerCase().indexOf(query.toLowerCase()) >= 0) || (item.url && item.url.toLowerCase().indexOf(query.toLowerCase()) >= 0)) {
			ret.push(item);
		}

		if (item.pages && item.pages.length) {
			search(item.pages, ret);
		}
	});

	return ret;
}

alfy.fetch('https://webpack.js.org/', {
	json: false
}).then(data => {
	const props = data.match(/data-props\=\"([^\"]+)\"/gm);

	const docs = {};

	props.forEach(prop => {
		try {
			const properties = JSON.parse(entities.decode(prop.replace(/data-props\="/, "").replace(/\"$/, "")));
			docs = merge(docs, properties);
		} catch (e) {}
	});

	const result = search(docs.sections, []).map(item => {
		return {
			title: item.title,
			subtitle: item.url,
			arg: `https://webpack.js.org/${item.url}`
		}
	});

	alfy.output(result);
});