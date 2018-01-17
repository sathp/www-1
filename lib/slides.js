const _ = require('lodash')
const cheerio = require('cheerio')

exports = module.exports = (config) => {
  return (files, metalsmith, done) => {
    let slides = _.filter(files, file => {
      return file.slides
    })
    _.each(slides, file => {
      let $ = cheerio.load(file.contents)

      // Surround h2s with header and remove empties
      $('h2').replaceWith((i, element) => {
        let title = $(element).text().trim()
        if (title.startsWith("!")) {
          if (title.slice(1).length > 0) {
            return `<div data-title="${ title.slice(1) }"></div>`
          } else {
            return
          }
        } else {
          return `<div class="header" data-title="${ title }"><h2>${ $(element).html() }</h2></div>`
        }
      })

      // Add some helper classes to most sections
      $('div.sect1').each((i, element) => {
        $(element).addClass('logo')
      })

      // Handle Janini examples
      $('div.janini pre').each((i, element) => {
        $(element).closest('div.sect1').addClass('janini nozoom')
        $(element).closest('div.sect1').removeClass('logo')
        let section = $(element).closest('div.sectionbody')
        let message = $(section).find('.message').text() || "&gt; Hit Control-S to run your Java code..."
        section.replaceWith(() => {
          return `<textarea class="janini">${ $(element).text() }</textarea>` +
            `<div class="output" data-blank="${ message }">${ message }</div>`
        })
      })

      // Fix images
      $('div.imageblock.mx-auto').each((i, element) => {
        $(element).find('img').each((i, element) => {
          $(element).addClass('mx-auto')
          $(element).css('display', 'block')
        })
        $(element).removeClass('mx-auto')
      })

      file.contents = new Buffer($.html())
    })

    done()
  }
}