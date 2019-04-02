const webpack = require( 'webpack' ),
      WebpackNotifierPlugin = require( 'webpack-notifier' ),
      HtmlWebpackPlugin = require( 'html-webpack-plugin' ),
      path = require( 'path' ),
      Clean = require( 'clean-webpack-plugin' ),
      CopyWebpackPlugin = require( 'copy-webpack-plugin' ),
      UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' ),
      package_json = require( './package.json' ),
      develop = process.argv.indexOf( '--env.develop' ) >= 0,

      dist = path.join( __dirname, process.env.WEBPACK_DIST || 'public/build' ),
      lpad = x => ( '0' + x ).substr( -2 ),
      now = new Date(),
      build_version = package_json.version.substr( 0, package_json.version.length - 2 ) + '.' +
                      ( now.getFullYear() - 2000 ) + lpad( now.getMonth() + 1) + lpad( now.getDate() ) +
                      lpad( now.getHours() ) + lpad( now.getMinutes() ),

      plugins = [
          new webpack.ProvidePlugin( {
              $       : 'jquery',
              jQueryUI: 'jquery-ui',
              _       : 'underscore'
          } ),
        new HtmlWebpackPlugin({
            filename: '../index.html',
              template: 'src/index.html'
        })
      ];

develop && plugins.push( new WebpackNotifierPlugin( { alwaysNotify: true } ) );
develop && plugins.push( new Clean( [ dist + '/*.*' ] ) );

console.log( ( develop ? 'DEVELOP' : 'PRODUCTION' ) + ' build configuration. Ver ' + build_version );
console.log( 'My dir name is', __dirname );

let config = {
    mode: develop ? 'development' : 'production',

    entry: {
        app: './src/js/app.js'
    },

    output: {
        path      : dist,
        publicPath: '/build/',
        filename  : '[id].b.js'
    },

    devtool: develop && 'source-map',

    plugins: plugins,

    resolve: {
        modules   : [ 'node_modules' ],
        alias     : {
            pages : path.resolve( __dirname, 'resources', 'js', 'pages' ),
            css   : path.resolve( __dirname, 'resources', 'js', 'css' ),
            base  : path.resolve( __dirname, 'resources', 'js', 'base' ),
            models: path.resolve( __dirname, 'resources', 'js', 'models' ),
            ui    : path.resolve( __dirname, 'resources', 'js', 'ui' )
        },
        extensions: [ '.ts', '.js', '.jsx' ]
    },

    module: {
        rules: [
            {
                test   : /\.(js|jsx|ts)?$/,
                exclude: /(node_modules)/,
                loader : 'ts-loader'
            },
            {
                test: /\.scss$/,
                use : [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader' // compiles Sass to CSS
                ]
            },
            {
                test  : /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test  : /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test  : /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&minetype=application/font-woff'
            },
            {
                test  : /\.(jpg|png|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=assets/[name].[hash:5].[ext]'
            }
        ]
    }
};

config.optimization = {
    splitChunks: {
        cacheGroups: {
            vendors: {
                test    : /[\\/]node_modules[\\/]/,
                chunks  : 'all',
//                maxSize            : 200000,
                priority: 1
            }
        }
    }
};

// develop || false && Object.assign( config.optimization, {
//     minimize : true,
//     minimizer: [ new UglifyJsPlugin( {
//         sourceMap: true
//     } ) ]
// } );

module.exports = config;
