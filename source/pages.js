'use strict'

// no longer used
const renderMenu = require('./menu')
const h = require('hyperscript')

module.exports = function (opts) {
	const {
		page = 1,
		limit = 10,
		items
	} = opts

	const itemsInPage = items.createChildCollection().setPaging({ limit, page }).query()
	const itemsInNextPage = items.createChildCollection().setPaging({ limit, page: page + 1 }).query()

	return h('nav', { class: 'paging-pages' }, [
		renderMenu.call(this, { items: itemsInPage }),
		page > 1 ? h('a', {
			class: 'prev',
			href: `?page=${page - 1}`
		}, 'previous') : '',
		itemsInNextPage.length ? h('a', {
			class: 'next',
			href: `?page=${page + 1}`
		}, 'next') : ''
	])
}
