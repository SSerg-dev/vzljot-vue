const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  filenameHashing: false,
  pages: {
    symbolSchema: {
      entry: './src/symbolSchema.ts',
      title: 'Мнемосхема',
    },
    point: {
      entry: './src/point.ts',
      title: 'Точка учета',
    },
    node: {
      entry: './src/node.ts',
      title: 'Объект учета',
    },
    app: {
      entry: './src/main.ts',
      title: 'Взлет СП4 Web',
    }
  },
  //publicPath: process.env.NODE_ENV === 'production' ? '/sp/js/sp/dist/' : '/js/sp/dist/',
  publicPath: '/js/sp/dist/',
  outputDir: 'dist',
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.output.chunkFilename = './chunks/[name].[chunkhash].js'
    }
  }
  // devServer: {
  //   proxy: 'http://localhost:16385'
  // }

})
