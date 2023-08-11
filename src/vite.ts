import type { Plugin } from 'vite'
import { mkdir, readFile, writeFile, copyFile } from 'fs/promises'
import {
  Options,
  defaultOptions,
  scrapper,
  icons,
  preloadScript,
  packTogether,
  makeHash

} from './common'

export default (_options: Options = {}): Plugin => {
  const options = Object.assign(defaultOptions, _options)
  const hash = makeHash()

  return {
    name: 'waltz-icons',
    configureServer(server) {
      server.middlewares.use('/assets/icons.svg', async (_req, res, next) => {
        try {
          const content = await readFile(`${__dirname}/../icons/icons.svg`)
          res.setHeader('content-type', 'image/svg+xml').end(content)

        } catch( e: any ) {
          next()
        }
      })
    },
    async transform(source, id) {
      if( /\.((t|j)s(x|on)?|vue|svelte|html?)/.test(id) ) {
        if( !/node_modules/.test(id) || options.libraries?.some((library) => new RegExp(`/${library}/`).test(id)) ) {
          const scrap = scrapper(
            options,
            () => null,
            (error) => this.warn(error)
          )

          await scrap(source)
        }

        if( process.env.NODE_ENV !== 'development' && options.hash && id.includes(options.tag!) ) {
          const newSource = source.replace('icons.svg', `icons-${hash}.svg`)
          return {
            code: newSource,
            map: null
          }
        }
      }

      return {
        code: source,
        map: null
      }
    },
    async generateBundle() {
      if( options.preEmit ) {
        await options.preEmit()
      }

      if( options.pack ) {
        const svg = await packTogether([ ...icons ])
        await mkdir('dist/assets', { recursive: true })

        const filename = options.hash
          ? `dist/assets/icons-${hash}.svg`
          : 'dist/assets/icons.svg'

        await writeFile(filename, svg)
        return
      }

      icons.forEach(async (iconName) => {
        const [style, filename] = iconName.includes(':')
          ? iconName.split(':')
          : ['line', iconName]

        await mkdir(`dist/assets/icons/${style}`, {
          recursive: true
        })

        try {
          await copyFile(
            `${__dirname}/../icons/${style}/${filename}.svg`,
            `dist/assets/icons/${style}/${filename}.svg`
          )
        } catch( error: any ) {
          this.warn(error)
        }
      })

      const iconNames = [ ...icons ]
      if( iconNames.length === 0 ) {
        return
      }

      await mkdir('dist', { recursive: true })
      await writeFile('dist/preload-script.js', preloadScript(iconNames))
    }
  }
}
