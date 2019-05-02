import React from 'react-type-r'
import { Record, shared, type, define } from 'type-r'
import * as socketIOClient from 'socket.io-client';
import Page from 'app/Page'
import config from '../../server/config'
import { InstaFolder } from '../models/InstaModels'

const server_path = (config.ws_server_addr || 'http://localhost') + ':' + config.ws_server_port;

@define
export class ApplicationState extends Record {
    static attributes = {
        station_name : '',
        server       : Record.defaults( {
            connected          : false,
            reconnect_after    : 0,
            reconnect_attempts : 0
        } ),
        user         : Record.defaults( {
            name   : 'sveta.evgrafova',//'alexander.evgrafov',  //
            pwd    : 'bp8djx408122',//'lokkol123',   //
            logged : false
        } ),

        folders     : InstaFolder.Collection,
        open_folder : shared( InstaFolder )
    };

    ws = null;

    queue = {};

    counter = 0;

    ws_init() {
        const { server } = this;

        this.ws = socketIOClient( server_path );

        this.ws.on( 'connect', () => {
                server.set( {
                    connected          : true,
                    reconnect_after    : 0,
                    reconnect_attempts : 0
                } );

                if( this.user.logged ) {
                    this.do_login().then( () => {
                        this.io( 'hola', this.user.name ).then( () => {
                                this.get_open_folder();
                            }
                        );
                    } )
                }
            } )
            .on( 'close', () => {
                console.log( 'Disconnected from server. Reconnection in ' + medialon.reconnectAfter + ' seconds...' );
                server.connected = false;
                server.reconnect_attempts++;

                window.setTimeout( config.ws_reconnect_delay * 1000 * server.reconnect_attempts,
                    () => {
                        ws.connect( server_path );
                    } );
            } )
            .on( 'answer', data => {
                if( data.__sig && this.queue[ data.__sig ] ) {
                    const [ resolve, reject ] = this.queue[ data.__sig ];

                    if( data.__status === 'ok' ) {
                        resolve( data.answer );
                    } else {
                        reject( data.msg );
                    }
                    delete (this.queue[ data.__sig ]);

                } else {
                    console.error( 'WS answer with unknown sig: ', data );
                }
            } )
    }

    io( command, params ) {
        !this.ws && this.ws_init();

        const signature = 'sig' + this.counter++;

        return new Promise( ( resolve, reject ) => {
            this.ws.emit( command, { signature, params } );
            this.queue[ signature ] = [ resolve, reject ];
        } );
    }

    do_login() {
        const { name, pwd } = this.user,
              p             = this.io( 'login', { name, pwd } );

        Page.notifyOnComplete(
            p.then( () => {
                this.user.logged = true;

                return this.get_folders();
            } ),
            {
                before  : 'Loggining in...',
                success : 'Logged!',
                error   : 'Login error'
            }
        );

        return p;
    }

    get_folders() {
        const p = this.io( 'get_folders' );
        Page.notifyOnComplete(
            p.then(
                data => this.folders.add( data.items, { parse : true } )
            ),
            {
                before  : 'Load folders...',
                success : 'Folders are here!',
                error   : 'Folders load error'
            }
        );

        return p;
    }

    get_open_folder() {
        const { open_folder } = this;

        if( open_folder ) {
            const p = this.io( 'get_folder_items', { args : [ open_folder.collection_id ] } );

            Page.notifyOnComplete(
                p.then(
                    data => {
                        const { folders } = this,
                              folder      = folders.get( data.collection_id );

                        if( folder ) {
                            folder.items.add( _.map( data.items, item => {
                                item.id = item.media && item.media.id;
                                return item;
                            } ), { parse : true } );
                        }
                    }
                ),
                {
                    before  : 'Load folder media...',
                    success : 'Media is here!',
                    error   : 'Media load error'
                }
            );
        } else {
            return Promise.resolve( {} );
        }
    }
}