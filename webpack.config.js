const path = require('path');

module.exports = {
    entry: {
        main: './src/index.js',
        Base64ImageExample: './examples/Base64ImageExample.js',
        ControlsExample: './examples/ControlsExample.js',
        CyclicPickExample: './examples/CyclicPickExample.js',
        KmlGroundOverlayExample: './examples/KmlGroundOverlayExample.js',
        LayerOrderExample: './examples/LayerOrderExample.js',
        TexturedSurfacePolygonExample: './examples/TexturedSurfacePolygonExample.js'
    },
    devtool: 'source-map',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
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
    }
};