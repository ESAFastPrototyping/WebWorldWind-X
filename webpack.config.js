const path = require('path');

module.exports = {
    entry: {
        main: './src/index.js',
        Base64ImageExample: ['babel-polyfill', './examples/Base64ImageExample.js'],
        CogExample: ['babel-polyfill','./examples/CogExample.js'],
        ControlsExample: ['babel-polyfill', './examples/ControlsExample.js'],
        CyclicPickExample: ['babel-polyfill', './examples/CyclicPickExample.js'],
        KmlGroundOverlayExample: ['babel-polyfill', './examples/KmlGroundOverlayExample.js'],
        LayerOrderExample: ['babel-polyfill', './examples/LayerOrderExample.js'],
        ScihubProductsExample: ['babel-polyfill', './examples/ScihubProductsExample.js'],
        TexturedSurfacePolygonExample: ['babel-polyfill', './examples/TexturedSurfacePolygonExample.js']
    },
    devtool: 'source-map',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {test: /\.css$/, use: ['style-loader','css-loader']},
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
    },
    node: {
        fs: 'empty'
    }
};