'use strict'

const h = require('hyperscript')

module.exports = function (opts = {}) {
	// Prepare
	const { document, content, text = {} } = this
	const {
		permalink = document.url,
		heading = document.title,
		subheading = document.subheading || document.description,
		author = document.author,
		cssClasses = (document.cssClasses || []),
		editUrl = document.editUrl,
		date,
		prev,
		next,
		up,
		parents = []
	} = opts

	// Render
	const classes = ['block'].concat(cssClasses)
	return h('article', { class: classes.join(' ') },
		h('header.block-header',
			(parents.length || null) && h('nav.parentcrumbs',
				h('ul', parents.map((parent) =>
					h('li',
						h('a.permalink', { href: parent.url },
							h('h3', parent.title)
						)
					)
				))
			),
			(permalink || h('h1', heading)) && h('a.permalink.hover-link', { href: permalink }, h('h1', heading)),
			(subheading || null) && h('h2', subheading),
			(date || null) && h('span.date', date),
			(author || null) && h('a.author', { href: `/people/${author}` }, author)
		),
		h('section.block-content', { innerHTML: content }),
		h('footer.block-footer', ((prev || up || next) || null) && h('nav.prev-next',
			(prev || null) && h('a.prev', { href: prev.url },
				h('span.icon'),
				h('span.title', prev.title)
			),
			(up || null) && h('a.up', { href: up.url },
				h('span.icon'),
				h('span.title', up.title)
			),
			(next || null) && h('a.next', { href: next.url },
				h('span.icon'),
				h('span.title', next.title)
			)
		)),
		(editUrl || null) && h('aside.block-edit',
			h('a', { href: editUrl }, text.edit || 'Edit and improve this page!')
		)
	)
}
