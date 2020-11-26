// const webpack = require('webpack')
const path = require('path')
// const GitRevisionPlugin = require('git-revision-webpack-plugin')
// const runGitCommand = require('git-revision-webpack-plugin/lib/helpers/run-git-command')
// const gitRevisionPlugin = new GitRevisionPlugin({ lightweightTags: true })
let settings
try {
  settings = require('./vue.config.settings')
} catch (ex) {
  settings = {}
}

settings = Object.assign({}, require('./vue.config.settings.default'), settings)

const config = {
  lintOnSave: true,
  // transpileDependencies: ['vuetify'],
  // configureWebpack: (config) => {
  //   config.plugins.push(gitRevisionPlugin)
  //   config.plugins.push(new webpack.DefinePlugin({
  //     VERSION: JSON.stringify(gitRevisionPlugin.version()),
  //     COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
  //     BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
  //     CHANGELOG: JSON.stringify(runGitCommand(GitRevisionPlugin.gitWorkTree, 'tag -l --sort=-v:refname --format=\'%(tag) %(contents)\''))
  //   }))
  // },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true,
    sockHost: settings.sockHost,
    sockPort: settings.sockPort,
    sockPath: settings.sockPath
  },
  outputDir: path.resolve(__dirname, './tmp')
}

module.exports = config
