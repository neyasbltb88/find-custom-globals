const webpack = require('webpack');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    mode: NODE_ENV,
    context: path.resolve(__dirname, 'src'),
    entry: {
        findCustomGlobals: './findCustomGlobals',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].min.js',
        publicPath: '/',
    },
    watch: NODE_ENV === 'development',
    watchOptions: {
        aggregateTimeout: 100
    },
    devtool: NODE_ENV === 'development' ? 'inline-source-map' : false,
    plugins: [
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
        }),
    ],

    module: {
        rules: [{
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-env"],
                    plugins: [
                        "@babel/plugin-proposal-class-properties",
                        "@babel/plugin-proposal-private-methods"
                    ]
                }
            }
        }]
    },

    devServer: {
        port: 3333,
        contentBase: path.resolve(__dirname, 'src')
    }
}