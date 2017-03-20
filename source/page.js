'use strict'

// no longer used
const h = require('hyperscript')

module.exports = function (opts) {
	const { item, collection } = opts
	const currentItem = item
	const elements = []

	collection.forEach(function (item, index) {
		if (item.id === currentItem.id) {
			const prevItem = collection.at(index - 1)
			const nextItem = collection.at(index + 1)

			if (prevItem) {
				elements.push(
					h('a', {
						class: 'prev',
						href: prevItem.get('url')
					},
						prevItem.get('title') || prevItem.get('name')
					)
				)
			}

			if (nextItem) {
				elements.push(
					h('a', {
						class: 'next',
						href: nextItem.get('url')
					},
						nextItem.get('title') || nextItem.get('name')
					)
				)
			}
		}
	})

	return h('nav', { class: 'paging-item' }, elements)
}
