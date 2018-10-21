'use strict'

process.env.BABEL_ENV = 'web'

const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require('terser-webpack-plugin')

let webConfig = {
	devtool: '#cheap-module-eval-source-map',
	entry: {
		web: path.join(__dirname, '../src/renderer/main.js')
	},
	module: {
		rules: [
			{
				test: /\.(js|vue)$/,
				enforce: 'pre',
				exclude: /node_modules/,
				use: {
					loader: 'eslint-loader',
					options: {
						formatter: require('eslint-friendly-formatter')
					}
				}
			},
			{
				test: /\.less$/,
				use: ['vue-style-loader', 'css-loader', 'less-loader']
			},
			{
				test: /\.css$/,
				use: [
					process.env.NODE_ENV !== 'production'
						? 'vue-style-loader'
						: { loader: MiniCssExtractPlugin.loader },
					'css-loader'
				]
			},
			{
				test: /\.html$/,
				use: 'vue-html-loader'
			},
			{
				test: /\.js$/,
				use: 'babel-loader',
				include: [path.resolve(__dirname, '../src/renderer')],
				exclude: /node_modules/
			},
			{
				test: /\.vue$/,
				use: {
					loader: 'vue-loader',
					options: {
						extractCSS: true,
						loaders: {
							sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
							scss: 'vue-style-loader!css-loader!sass-loader',
							less: 'vue-style-loader!css-loader!less-loader'
						}
					}
				}
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				use: {
					loader: 'url-loader',
					query: {
						limit: 10000,
						name: 'imgs/[name].[ext]'
					}
				}
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				use: {
					loader: 'url-loader',
					query: {
						limit: 10000,
						name: 'fonts/[name].[ext]'
					}
				}
			}
		]
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({ filename: 'styles.css' }),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(__dirname, '../src/index.ejs'),
			minify: {
				collapseWhitespace: true,
				removeAttributeQuotes: true,
				removeComments: true
			},
			nodeModules: false
		}),
		new webpack.DefinePlugin({
			'process.env.IS_WEB': 'true'
		})
	],
	output: {
		filename: '[name].js',
		path: path.join(__dirname, '../dist/web')
	},
	resolve: {
		alias: {
			'@': path.join(__dirname, '../src/renderer'),
			vue$: 'vue/dist/vue.esm.js'
		},
		extensions: ['.js', '.vue', '.json', '.css']
	},
	target: 'web'
}

/**
 * Adjust webConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
	webConfig.devtool = 'source-map'
	webConfig.mode = 'production'
	webConfig.optimization = {
		minimize: true,
		concatenateModules: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					ecma: 6,
					warnings: false,
					parse: {},
					compress: {},
					mangle: true,
					module: false,
					output: null,
					toplevel: false,
					nameCache: null,
					ie8: false,
					keep_classnames: undefined,
					keep_fnames: false,
					safari10: false
				},
				sourceMap: true
			})
		],
		sideEffects: false
	}
	webConfig.plugins.push(
		new CopyWebpackPlugin([
			{
				from: path.join(__dirname, '../static'),
				to: path.join(__dirname, '../dist/web/static'),
				ignore: ['.*']
			}
		]),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new BundleAnalyzerPlugin({
			analyzerMode: 'server',
			analyzerHost: '127.0.0.1',
			analyzerPort: 8889,
			reportFilename: 'report.html',
			defaultSizes: 'gzip',
			openAnalyzer: true,
			generateStatsFile: false,
			statsFilename: 'stats.json',
			statsOptions: null,
			logLevel: 'info'
		})
	)
}

module.exports = webConfig
