import React from 'react-type-r'
import { Record, shared, type, define } from 'type-r'
import * as socketIOClient from 'socket.io-client';
import Page from 'app/Page'
import config from '../../server/config'
import { InstaUser, InstaFolder } from '../models/InstaModels'

const server_path = (config.ws_server_addr || 'http://localhost') + ':' + config.ws_server_port;

@define
class WsTask extends Record {
    static idAttribute = 'signature:';

    static attributes = {
        signature : '',
        resolve   : Function,
        reject    : Function
    }
}

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
            info   : InstaUser,
            name   : 'sveta.evgrafova',//'alexander.evgrafov',  //
            pwd    : 'bp8djx408122',//'lokkol123',   //
            logged : false
        } ),
        folders      : InstaFolder.Collection,
        open_folder  : shared( InstaFolder ),
        screen    : '',
        queue        : WsTask.Collection
    };

    ws      = null;
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
                    this.do_login( { hidden : true } ).then( () => {
                        this.io( 'hola', this.user.name ).then( () => {
                                this.get_open_folder( { hidden : true } );
                            }
                        );
                    } )
                }
            } )
            .on( 'close', () => {
                console.log( 'Disconnected from server. Reconnection in ' + medialon.reconnectAfter + ' seconds...' );
                server.connected = false;
                server.reconnect_attempts++;

                window.setTimeout( () => {
                    ws.connect( server_path );
                }, config.ws_reconnect_delay * 1000 * server.reconnect_attempts );
            } )
            .on( 'answer', data => {
                let task;
                if( data.__sig && (task = this.queue.get( data.__sig )) ) {
                    const { resolve, reject } = task;

                    if( data.__status === 'ok' ) {
                        resolve( data.answer );
                    } else {
                        reject( data.msg );
                    }

                    this.queue.remove( task );
                    task.destroy();

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
            this.queue.add( { signature, resolve, reject }, { parse : true } );
        } );
    }

    do_login( params ) {
        const { name, pwd } = this.user;

        const p = this.io( 'login', { name, pwd } ).then( data => {
            this.user.logged = true;
            this.user.info.set( data, {parse:true});
            this.get_folders( params );
        } );

        !params.hidden &&
        Page.notifyOnComplete( p,
            {
                before  : 'Loggining in...',
                success : 'Logged!',
                error   : 'Login error'
            }
        );

        return p;
    }

    get_folders( params ) {
        const p = this.io( 'get_folders' ).then(
            data => this.folders.add( data.items, { parse : true } )
        );

        !params.hidden &&
        Page.notifyOnComplete( p,
            {
                before  : 'Load folders...',
                success : 'Folders are here!',
                error   : 'Folders load error'
            }
        );

        return p;
    }

    get_open_folder( params ) {
        const { open_folder } = this;

        if( open_folder ) {
            const p = this.io( 'get_folder_items', { args : [ open_folder.collection_id ] } ).then(
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
            );

            !params.hidden &&
            Page.notifyOnComplete( p,
                {
                    before  : 'Load folder media...',
                    success : 'Media is here!',
                    error   : 'Media load error'
                }
            );

            return p;
        } else {
            return Promise.resolve( {} );
        }
    }
}