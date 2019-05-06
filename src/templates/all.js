import { papers } from './papers';

const designs  = {},
      importer = req => {
          req.keys().forEach( file => {
              const splt = file.substring( 2 ).toLowerCase().split( '.' ),
                    name = splt[ 0 ],
                    tmpl = req( file );

              if (name.subsrt(0,2)!=='__') {
                  designs[ name ] = new tmpl.default;
              }
          } );
      };

importer( require.context( './design', false, /\.tsx$/ ) );

export { designs, papers } ;