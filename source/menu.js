'use strict'

const moment = require('moment')
const h = require('hyperscript')

module.exports = function (opts = {}) {
	const me = this
	const { document } = this
	const {
		activeCssClasses = ['active'],
		inactiveCssClasses = ['inactive'],
		activeItem = document,
		type = 'menu',
		useAnchors = false,
		showDate = false,
		showDescription = false,
		showContent = false,
		emptyText = 'empty',
		dateFormat = 'YYYY-MM-DD'
	} = opts

	function renderDate (date) {
		return (date && showDate) ? h('span', {
			class: `list-${type}-date`,
			property: 'dc:date'
		}, moment(date).format(dateFormat)) : ''
	}
	function renderLink (target, children) {
		return (
			!target || target.replace(/#.+$/, '') === document.url
				? children
				: h('a', {
					class: `list-${type}-link`,
					href: target
				}, children)
		)
	}

	function renderItem (item) {
		const {
			id,
			url,
			title,
			date,
			description,
			contentRenderedWithoutLayouts
		} = item.attributes

		const classes = [`list-${type}-item`]
			.concat(id === activeItem.id ? activeCssClasses : inactiveCssClasses)

		return h('li', {
			class: classes.join(' '),
			typeof: 'soic:page',
			about: url
		}, [
			h(`h4.list-${type}-title`, [
				renderLink(url, title),
				renderDate(date)
			]),
			(showDescription && description) ? h('div', {
				class: `list-${type}-description`,
				property: 'dc:description'
			}, description) : '',
			(showContent && contentRenderedWithoutLayouts) ? h('div', {
				class: `list-${type}-content`,
				property: 'dc:content',
				innerHTML: contentRenderedWithoutLayouts
			}) : ''
		])
	}

	function renderCollection (collection) {
		return h('ul', {
			class: `list-${type}-items`
		},
			collection.length
				? collection.map(renderItem)
				: [
					h('div', { class: `list-${type}-empty` }, emptyText)
				]
		)
	}

	function renderCategory (category) {
		if (!category.collection) {
			throw new Error(`the category ${JSON.stringify(category)} has no collection set`)
		}
		return h('li', {
			id: useAnchors ? `${category.projectId}-${category.id}` : '',
			class: `list-${type}-category`
		}, [
			h(`h3.list-${type}-title`, renderLink(category.url, category.title)),
			renderCollection(category.collection)
		])
	}

	function renderCategories (categories) {
		return h('ul', {
			class: `list-${type}-categories`
		}, categories.map(renderCategory))
	}

	function renderProject (project) {
		if (!project.collection) {
			throw new Error(`the project ${JSON.stringify(project)} has no collection set`)
		}
		return h('li', {
			id: useAnchors ? `${project.id}` : '',
			class: `list-${type}-project`
		}, [
			h(`h2.list-${type}-title`, renderLink(project.url, project.title)),
			renderCategories(Object.values(project.categories))
		])
	}

	function renderProjects () {
		return h('ul', {
			class: `list-${type}-projects`
		}, me.getProjects().map(renderProject))
	}

	function renderMenu () {
		try {
			if (opts.render === 'category') {
				if (this.document.projectId && this.document.categoryId) {
					return renderCollection(
						this.getCategory(this.document.projectId, this.document.categoryId).collection
					)
				}
				throw new Error('category menu could not be rendered as there was no category set for this document')
			}
			else if (opts.render === 'projects') {
				return renderProjects()
			}
			else {
				throw new Error('opts.render was an invalid value, must be either "category" or "projects"')
			}
		}
		catch (err) {
			throw new Error(
				'an error occured rendering the menu' +
				'\nhere are the projects: ' + require('util').inspect(this.getProjects()) +
				'\nhere was the error message: ' + err.message +
				'\nhere was the error stack:\n' + err.stack
			)
		}
	}

	return h('nav', { class: `list-${type}` }, [renderMenu.call(this)])
}
