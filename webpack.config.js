const path = require('path');

module.exports = {
    entry: {
        main: './src/index.js',
        CyclicPickExample: './examples/CyclicPickExample.js',
        LayerOrderExample: './examples/LayerOrderExample.js'
    },
    devtool: 'source-map',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {test: /\.css$/, use: 'css-loader'},
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
};