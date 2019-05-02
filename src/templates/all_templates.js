const default_params = require('./params.default.json'),
      default_icon = require('./icon.default.png'),
      default_tmpl = require('./tmpl.default.hbs'),
      all            = {},
      importer       = req => {
          req.keys().forEach( file => {
              const dir = file.substring( 1/* context.length */ + 1 ).split( '/' );

              if( dir.length !== 2 ) {
                  console.erro( 'Smth wrong with requestion', file, dir );
              } else {
                  const name = dir[ 0 ],
                        splt = dir[ 1 ].toLowerCase().split( '.' ),
                        data = req( file );

                  if( !all[ name ] ) {
                      all[ name ] = { params : default_params, icon:default_icon, template:default_tmpl };
                  }

                  if( splt[ 0 ] === 'icon' ) {
                      all[ name ].icon = data;
                  } else if( splt[ 1 ] === 'json' ) {
                      all[ name ].params = _.extend( {}, all[ name ].params, data );
                  } else if( splt[ 1 ] === 'hbs' ) {
                      all[ name ].template = data;
                  }
              }
          } );
      };


// context - current folder,  subfolders - true, mask - one subfolder level only
importer( require.context( '.', true, /^\.\/\w+\/\w+\.\w+$/ ) );
// IMPORTANT - length of first argument CONTEXT must be reflected in .substring above (+1)

export {all};
