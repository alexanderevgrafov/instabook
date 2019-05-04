import React from 'react-type-r'
import { Record, shared, type, define } from 'type-r'
import * as socketIOClient from 'socket.io-client';
import Page from 'app/Page'
import config from 'server/config'
import { InstaUser, InstaFolder, InstaFolderItem, InstaMedia } from 'models/InstaModels'

const server_path = (config.ws_server_addr || 'http://localhost') + ':' + config.ws_server_port;

@define
class WsTask extends Record {
    static idAttribute = 'signature';

    static attributes = {
        signature : '',
        resolve   : Function,
        reject    : Function,
        command   : '',
        params    : null
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
        screen       : type( String ).value( '' ),
        queue        : WsTask.Collection,
        fake_post    : InstaFolderItem.value( {
            'media' : {
                'id'              : '2027892131745506174_296112709',
                'media_type'      : 1,
                'image_versions2' : [
                    {
                        'width'  : 1080,
                        'height' : 1074,
                        'url'    : 'http://instabook.local.com:8000/test_photo.jpg'
//                            'https://scontent-arn2-1.xx.fbcdn.net/v/t1.0-9/14947808_1504533962906993_8760241788738503533_n.jpg?_nc_cat=105&_nc_ht=scontent-arn2-1.xx&oh=d850a18e152a1cebf10c8a89692f9aea&oe=5D6B8A7F'//file://e:/localhost/srv/instabook/public
                    }
                ],
                'caption'         : {
                    'text' : 'Однажды Лесной Ведьме приснилось, что она - река. Она начинала свой путь со склонов гор маленьким ручейком, потом ширилась, набиралась сил и приводила свои воды к огромному шумному океану. Над Ведьмой-Рекой  кружили чайки, а в воде сновали серебристые рыбки. Она была то спокойным и гладким зеркалом, то вдруг бурлила порогами и плевалась пеной. \nПроснулась Лесная Ведьма и обрадовалась- птицы поют, крапива уже доросла до супа и вот-вот робкое зеленое кружево превратится в зелёный костёр.\n#про_леснуюведьму_nastyakis',
                },
            }

        } )
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
                        reject( data.msg || '[no error description provided]' );
                    }

                    this.queue.remove( task );
                } else {
                    console.error( 'WS answer with unknown sig: ', data );
                }
            } )
    }

    io( command, params = {} ) {
        !this.ws && this.ws_init();

        const signature = 'sig' + this.counter++;

        return new Promise( ( resolve, reject ) => {
            this.ws.emit( command, { signature, params } );
            this.queue.add( { signature, resolve, reject, command, params }, { parse : true } );
        } );
    }

    do_login( params = {} ) {
        const { name, pwd } = this.user;

        if( !params.hidden && this.user.logged && this.user.name === this.user.info.username ) {
            return this.get_folders( params );
        }

        const p = this.io( 'login', { name, pwd } ).then( data => {
            this.user.logged = true;
            this.user.info.set( data.user, { parse : true } );
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

    get_folders( params = {} ) {
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

    get_open_folder( params = {} ) {
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