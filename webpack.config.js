const path = require('path');

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: {
        'dist/index': './index.js',
        'convert/css': './css.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname)
    },
    module: {
        rules: [
            {
                test: /\.(scss|css)$/,
                use: [
                    'style-loader',
                    'css-loader?modules'
                    // {
                    //     loader: 'sass-loader',
                    //     options: {
                    //         sourceMap: (IS_PROD) ? false : true
                    //     }
                    // },
                    // {
                    //     loader: 'sass-resources-loader',
                    //     options: {
                    //         resources: [
                    //             path.resolve(__dirname, 'src/styleConfig.scss')
                    //         ]
                    //     }
                    // }
                ]
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    // node: {
    //     fs: 'empty',
    // },
    plugins: [],
};