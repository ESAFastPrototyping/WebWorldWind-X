// karma.conf.js  --  karma configuration

module.exports = function(config) {
    config.set({
        // ... normal karma configuration
        basePath: '.',

        frameworks: ['jasmine'],

        files: [
            './test/**/*.test.js'
        ],

        preprocessors: {
            // add webpack as preprocessor
            './test/**/*.test.js': ['webpack']
        },

        port: 9876,

        browsers: ['PhantomJS'],

        concurrency: Infinity,

        webpack: {
            // you don't need to specify the entry option because
            // karma watches the test entry points
            // webpack watches dependencies

            // ... remainder of webpack configuration (or import)
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
            },

            mode: 'development'
        }
    });
};