import { papers } from  './all_server';

const designs = {},
      importer  = req => {
          req.keys().forEach( file => {
              const splt = file.substring( 2 ).toLowerCase().split( '.' ),
                    name = splt[ 0 ];

              designs[ name ] = req( file );
          } );
      };

importer( require.context( './design', false, /\.ts$/ ) );

export { designs, papers } ;