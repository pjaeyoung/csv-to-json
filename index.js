const { program } = require("commander")
const fs = require("fs")
const path = require("path")
const _ = require("lodash")
require("util").inspect.defaultOptions.depth = null

function createObj(key, value) {
  const obj = {}
  obj[key] = value
  return obj
}

function convertToObj(keys, value) {
  return [...keys].reverse().reduce((obj, key) => createObj(key, obj), value)
}

function divideLanguages(rows) {
  return rows.map((aRow) => {
    const cells = aRow.split(",")
    const keys = cells[0].split(".")
    const kr = cells[1]
    const en = cells[2]
    return {
      kr: convertToObj(keys, kr),
      en: convertToObj(keys, en),
    }
  })
}

function merge(arr) {
  return arr.reduce(
    (acc, { kr, en }) => {
      return {
        kr: _.defaultsDeep(acc.kr, kr),
        en: _.defaultsDeep(acc.en, en),
      }
    },
    { kr: {}, en: {} }
  )
}

function convertToJSON(csv) {
  const rows = csv.split("\r\n")
  return merge(divideLanguages(rows))
}

program.option("-d, --dir <char>")
program.parse()
const options = program.opts()

if (!options.dir) {
  console.error(
    "you must enter a translation folder name with '--dir' or '-d' option"
  )
  return
}

fs.mkdirSync("i18n/locales/kr", { recursive: true })
fs.mkdirSync("i18n/locales/en", { recursive: true })

const jsons = []

fs.readdirSync(options.dir).forEach((filePath) => {
  const csv = fs.readFileSync(path.join(options.dir, filePath))
  jsons.push(convertToJSON(csv.toString()))
})

if (jsons.length > 0) {
  const { kr, en } = merge(jsons)
  fs.writeFileSync("i18n/locales/kr/translation.json", JSON.stringify(kr))
  fs.writeFileSync("i18n/locales/en/translation.json", JSON.stringify(en))
}
