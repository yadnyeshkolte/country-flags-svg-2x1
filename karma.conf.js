export default function(config) {
    config.set({
        frameworks: ['mocha'],
        files: [
            { pattern: 'test/**/*.js', type: 'module' },
            { pattern: 'flags/**/*.svg', included: false, served: true }
        ],
        preprocessors: {
            'test/**/*.js': ['webpack']
        },
        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.svg$/,
                        type: 'asset/source'
                    }
                ]
            }
        },
        browsers: ['ChromeHeadless'],
        singleRun: true
    });
}