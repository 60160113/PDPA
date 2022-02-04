module.exports = {
  publicPath:'/PDPA/',
  outputDir: "PDPA",
  chainWebpack: config => {
    config.performance.maxEntrypointSize(400000).maxAssetSize(400000);
  },
  lintOnSave: false,
  runtimeCompiler: true,
  configureWebpack: {
    //Necessary to run npm link https://webpack.js.org/configuration/resolve/#resolve-symlinks
    resolve: {
       symlinks: false
    }
  },
  transpileDependencies: [
    '@coreui/utils'
  ],
  // use this option for production linking
  // publicPath: process.env.NODE_ENV === 'production' ? '/vue/demo/3.1.0' : '/'
}
