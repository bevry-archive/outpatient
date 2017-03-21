'use strict'

const renderBlock = require('./block')

module.exports = function (opts = {}) {
	const { document } = this
	const {
		cssClasses = (document.cssClasses || []),
		projectId = document.projectId,
		categoryId = document.categoryId
	} = opts

	const docs = this.getHelperConfig().docs
	const project = this.getProject(projectId)
	const category = this.getCategory(projectId, categoryId)

	const pageIndex = project.collection.models.findIndex((item) => item.id === document.id)
	const prevModel = project.collection.models[pageIndex - 1] || null
	const nextModel = project.collection.models[pageIndex + 1] || null

	const parents = (docs.url !== project.url && docs.title)
		? [docs].concat([project, category])
		: [project, category]
	const up = category
	const prev = prevModel && {
		url: prevModel.attributes.url,
		title: prevModel.attributes.title
	}
	const next = nextModel && {
		url: nextModel.attributes.url,
		title: nextModel.attributes.title
	}

	return renderBlock.call(this, {
		cssClasses: ['doc'].concat(cssClasses),
		parents,
		prev,
		next,
		up
	})
}
