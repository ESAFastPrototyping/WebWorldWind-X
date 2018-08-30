const path = require('path');

module.exports = {
    entry: ['./src/index.js', './src/examples/CyclicPickExample', './src/examples/LayerOrderExample'],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {test: /\.css$/, use: 'css-loader'},
            {test: /\.(js|jsx)$/, use: 'babel-loader'}
        ]
    },
    devServer: {
        contentBase: './dist'
    },
};