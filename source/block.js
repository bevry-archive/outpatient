'use strict'

const h = require('hyperscript')

module.exports = function (opts = {}) {
	// Prepare
	const { document, content } = this
	const {
		permalink = document.url,
		heading = document.title,
		subheading = document.subheading,
		author = document.author,
		date,
		cssClasses = (document.cssClasses || []),
		prev,
		next,
		up,
		editUrl,
		parents = []
	} = opts

	// Render
	const classes = ['block'].concat(cssClasses)
	return h('article', {
		class: classes.join(' ')
	}, [
		h('header', {class: 'block-header'}, [
			parents.length ? h('nav', { class: 'parentcrumbs' }, [
				h('ul', parents.map((parent) => h('li', [
					h('a', {
						class: 'permalink',
						href: parent.url
					}, [
						h('h3', parent.title)
					])
				])
				))
			]) : null,
			permalink ? h('a', {
				class: 'permalink hover-link',
				href: permalink
			}, [
				h('h1', heading)
			]) : h('h1', heading),
			subheading ? h('h2', subheading) : '',
			date ? h('span', { class: 'date' }, date) : '',
			author ? h('a', {
				class: 'author',
				href: `/people/${author}`
			}, author) : ''
		]),
		h('section', { class: 'block-content', innerHTML: content }),
		h('footer', { class: 'block-footer' }, [
			(prev || up || next) ? h('nav', { class: 'prev-next' }, [
				prev ? h('a', {
					class: 'prev',
					href: prev.url
				}, [
					h('span', { class: 'icon' }),
					h('span', { class: 'title' }, prev.title)
				]) : '',
				up ? h('a', {
					class: 'up',
					href: up.url
				}, [
					h('span', { class: 'icon' }),
					h('span', { class: 'title' }, up.title)
				]) : '',
				next ? h('a', {
					class: 'next',
					href: next.url
				}, [
					h('span', { class: 'icon' }),
					h('span', { class: 'title' }, next.title)
				]) : ''
			]) : ''
		]),
		editUrl ? h('aside', { class: 'block-edit' }, [
			h('a', { href: editUrl }, 'Edit and improve this page!')
		]) : ''
	])
}
