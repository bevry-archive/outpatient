'use strict'

// no longer used
const h = require('hyperscript')

module.exports = function (opts) {
	const { avatar, heading, subheading, cssClasses = [], content } = opts
	cssClasses.unshift('subblock')
	cssClasses.push(avatar ? 'subblock-yesavatar' : 'subblock-noavatar')

	return h('section', {
		class: cssClasses.join(' ')
	}, [
		avatar && h('div', { class: 'avatar' }, [
			h('img', {
				class: 'avatar-image',
				src: avatar
			})
		]),
		h('div', { class: 'main' }, [
			h('header', { class: 'heading' }, [
				h('h1', heading),
				subheading ? h('h2', subheading) : ''
			]),
			h('section', { class: 'content', innerHTML: content })
		])
	])
}
