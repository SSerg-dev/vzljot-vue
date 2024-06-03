const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

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
    },
  },

  publicPath: '/js/sp/dist/',
  outputDir: 'dist',
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.output.chunkFilename = './chunks/[name].[chunkhash].js'
    }
    if (process.env.NODE_ENV === 'development') {
      config.plugins.push(
        new webpack.DefinePlugin({
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        })
      )
    }
  },
  // devServer: {
  //   overlay: {
  //     warnings: false,
  //     errors: false
  //   }
  // }
})
