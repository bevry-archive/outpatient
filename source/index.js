'use strict'

// Imports
const fsUtil = require('fs')
const pathUtil = require('path')
const strUtil = require('underscore.string')
const extendr = require('extendr')


// ---------------------------------
// Standard

// Humanize
function humanize (text = '') {
	return strUtil.humanize(
		text.replace(/^[-0-9]+/, '').replace(/\..+/, '')
	)
}


// ---------------------------------
// Helpers

// Get the prepared site/document title
// Often we would like to specify particular formatting to our page's title
// we can apply that formatting here
function getPreparedTitle () {
	// if we have a title, we should use it suffixed by the site's title
	if (this.document.title) {
		return `${this.document.title} | ${this.site.title}`
	}
	// if we don't have a title, then we should just use the site's title
	else {
		return this.site.title
	}
}

// Get the prepared site/document description
function getPreparedDescription () {
	// if we have a document description, then we should use that, otherwise use the site's description
	return this.document.description || this.site.description
}

// Get the prepared site/document keywords
function getPreparedKeywords () {
	// Merge the document keywords with the site keywords
	this.site.keywords.concat(this.document.keywords || []).join(', ')
}

// Get Version
function getVersion (v, places = 1) {
	return v.split('.').slice(0, places).join('.')
}

// Read File
function readFile (relativePath) {
	/* eslint no-sync:0 */
	const path = this.document.fullDirPath + '/' + relativePath
	const result = fsUtil.readFileSync(path)
	if (result instanceof Error) {
		throw result
	}
	else {
		return result.toString()
	}
}

// Code File
function codeFile (relativePath, language) {
	language = language || pathUtil.extname(relativePath).substr(1)
	const contents = this.readFile(relativePath)
	return `<pre><code class="${language}">${contents}</code></pre>`
}

function renderBlock (...args) {
	return require('./block').apply(this, args).outerHTML
}

function renderDocumentationLayout (...args) {
	return require('./documentation-layout').apply(this, args).outerHTML
}

function renderMenu (...args) {
	return require('./menu').apply(this, args).outerHTML
}

function renderGoogleSearch () {
	if (!this.services || !this.services.googleSearch ) return ''
	return (
		`<script async src="//www.google.com/cse/cse.js?cx=${this.services.googleSearch}"></script>` +
		'<div class="search"><gcse:search></gcse:search></div>'
	)
}

// Export
module.exports = function ({ config, docpadConfig }) {
	let projects = {} /* {
		project: {
			directory: '',
			categories: {
				category: {
					directory: ''
				}
			}
		}
	} */

	// Text
	function getText (a, b, force = true) {
		const text = (this && this.text) || docpadConfig.templateData.text
		if (b == null) {
			return text[a] || (force && humanize(a)) || ''
		}
		else {
			try {
				return text[a][b] || (force && humanize(b)) || ''
			}
			catch (err) {
				throw new Error(`getText failed on text[${a}][${b}]`)
			}
		}
	}
	function getHelperConfig () {
		return config
	}
	function getLinkName (link) {
		return getText('linkNames', link)
	}
	function getLabelName (label) {
		return getText('labelNames', label)
	}

	// Collections
	function getProjects () {
		return Object.values(projects)
	}
	function getProject (projectId) {
		const project = projects[projectId]
		if (!project) {
			throw new Error(`failed to get project ${projectId}`)
		}
		return project
	}
	function getCategories (projectId) {
		return Object.values(getProject(projectId).categories)
	}
	function getCategory (projectId, categoryId) {
		const category = getProject(projectId).categories[categoryId]
		if (!category) {
			throw new Error(`failed to get category ${categoryId} from project ${projectId}`)
		}
		return category
	}

	// Fetch all documents that exist within the docs directory
	// And give them the following meta data based on their file structure
	// [\-0-9]+#{category}/[\-0-9]+#{name}.extension
	const sort = [
		{ projectDirectory: 1 },
		{ categoryDirectory: 1 },
		{ filename: 1 }
	]
	function generateBefore () {
		const docpad = this.docpad
		const docs = docpad.getCollection('docs')
		const resort = {}
		Object.values(projects).sort((a, b) => a.directory > b.directory).forEach((project) => {
			resort[project.id] = project
			if (project.collection == null) {
				project.collection = docs.findAllLive({
					projectId: project.id
				}, sort)
			}
			docpad.setCollection(`docs-${project.id}`, project.collection)
			Object.values(project.categories).sort((a, b) => a.directory > b.directory).forEach((category) => {
				resort[project.id].categories[category.id] = category
				if (category.collection == null) {
					category.collection = project.collection.findAllLive({
						categoryId: category.id
					}, sort)
				}
				docpad.setCollection(`docs-${project.id}-${category.id}`, category.collection)
			})
		})
		projects = extendr.deep(resort, config.projects)
	}
	function docsCollection (database) {
		const query = {
			write: true,
			relativeOutDirPath: {
				$startsWith: 'learn/'
			},
			body: {
				$ne: ''
			}
		}

		return database.findAllLive(query, sort).on('add', function (document) {
			// Prepare
			const a = document.attributes

			// learn/#{organisation}-${repo}/#{project}/#{category}/#{filename}
			const pathDetailsRegexString = `
			^
			.*?learn/
			(.+?)-(.+?)/  // organisation - repo
			(.+?)/        // project
			(.+?)/        // category
			(.+?)\\.      // basename
			(.+?)         // extension
			$`.replace(/\/\/.+/g, '').replace(/\s/g, '')
			const pathDetailsRegex = new RegExp(pathDetailsRegexString)
			const pathDetails = pathDetailsRegex.exec(a.relativePath)

			// Properties
			const layout = 'doc'
			const standalone = true

			// Check if we are correctly structured
			if (pathDetails != null) {
				const projectDirectory = pathDetails[3]
				const categoryDirectory = pathDetails[4]
				const basename = pathDetails[5]
				const extension = pathDetails[6]

				// const organisation = organisationDirectory.replace(/^[-0-9]+/, '')
				const projectId = projectDirectory.replace(/^[-0-9]+/, '')
				const categoryId = categoryDirectory.replace(/^[-0-9]+/, '')

				const name = basename.replace(/^[-0-9]+/, '')

				const title = a.title || humanize(name)

				const githubEditUrl = config.projects[projectId].editUrl + categoryDirectory + '/' + basename + '.' + extension
				// const proseEditUrl = githubEditUrl.replace('github.com', 'prose.io')
				const editUrl = githubEditUrl

				// Indexes
				console.log(`add project [${projectId}] category [${categoryId}]`)
				if (projects[projectId] == null) {
					projects[projectId] = {
						id: projectId,
						title: humanize(projectId),
						url: `${config.docs.url}#${projectId}`,
						directory: projectDirectory,
						categories: {}
					}
				}
				if (projects[projectId].categories[categoryId] == null) {
					projects[projectId].categories[categoryId] = {
						projectId,
						id: categoryId,
						title: humanize(categoryId),
						url: `${config.docs.url}#${projectId}-${categoryId}`,
						directory: categoryDirectory
					}
				}

				// Apply
				document.setMetaDefaults({
					layout,
					standalone,

					// titles
					name,
					title,

					// menus
					projectId,
					categoryId,

					// sorting
					projectDirectory,
					categoryDirectory,

					// urls
					editUrl,
					url: config.getUrl({name, projectId, categoryId})
				})
			}

			// Otherwise ignore this document
			else {
				/* eslint no-console:0 */
				console.log(`The document ${a.relativePath} was at an invalid path, so has been ignored`)
				document.setMetaDefaults({
					ignore: true,
					render: false,
					write: false
				})
			}
		})
	}

	// ---------------------------------
	// Apply

	extendr.deep(docpadConfig, {
		templateData: {
			strUtil,
			humanize,
			getText,
			getName: getText,
			getLinkName,
			getLabelName,
			getHelperConfig,
			getProjects,
			getProject,
			getCategories,
			getCategory,
			getPreparedTitle,
			getPreparedDescription,
			getPreparedKeywords,
			getVersion,
			readFile,
			codeFile,
			renderBlock,
			renderDocumentationLayout,
			renderMenu,
			renderGoogleSearch
		},
		events: {
			generateBefore
		},
		collections: {
			docs: docsCollection
		},
		plugins: {
			highlightjs: {
				aliases: {
					stylus: 'css',
					shell: 'bash'
				}
			}
		}
	})

}
