import React from 'react-type-r'
import { Record, shared, type, define } from 'type-r'
import * as socketIOClient from 'socket.io-client';
import Page from 'app/Page'
import config from 'server/config'
import { InstaUser, InstaFolder, InstaPost, InstaMedia } from 'models/InstaModels'

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
        fake_post    : InstaPost.value( {
            'media' : {
                'id'              : '2027892131745506174_296112709',
                'media_type'      : 8,
                'image_versions2' : [
                    {
                        'width'  : 1080,
                        'height' : 1074,
                        'url'    : 'http://instabook.local.com:8000/test_photo.jpg'
//                            'https://scontent-arn2-1.xx.fbcdn.net/v/t1.0-9/14947808_1504533962906993_8760241788738503533_n.jpg?_nc_cat=105&_nc_ht=scontent-arn2-1.xx&oh=d850a18e152a1cebf10c8a89692f9aea&oe=5D6B8A7F'//file://e:/localhost/srv/instabook/public
                    }
                ],
                "carousel_media_count": 7,
                "carousel_media": [
                    {
                        "id": "1973216626352199555_24455934",
                        "media_type": 1,
                        "image_versions2": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/c5ff310dfd125fdfc7eb8f21e4ad5740/5D5A2271/t51.2885-15/e35/50703210_114176389685476_4115209539446830584_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MTk3MzIxNjYyNjM1MjE5OTU1NQ%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/fc2f123695cfb84c0ab7591f4c09c725/5D733079/t51.2885-15/e35/s240x240/50703210_114176389685476_4115209539446830584_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MTk3MzIxNjYyNjM1MjE5OTU1NQ%3D%3D.2"
                                }
                            ],
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "1973216626352199555",
                        "carousel_parent_id": "1973216630898853189_24455934"
                    },
                    {
                        "id": "1973216626343800870_24455934",
                        "media_type": 1,
                        "image_versions2": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/632fae9aeae9af05d7cc3bf4abd90c8c/5D622E27/t51.2885-15/e35/50649880_2026191530791289_5103200256879662040_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MTk3MzIxNjYyNjM0MzgwMDg3MA%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/820eeb1458fa7fcda4a546f0e650ac41/5D74F31E/t51.2885-15/e35/s240x240/50649880_2026191530791289_5103200256879662040_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MTk3MzIxNjYyNjM0MzgwMDg3MA%3D%3D.2"
                                }
                            ],
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "1973216626343800870",
                        "carousel_parent_id": "1973216630898853189_24455934"
                    },
                    {
                        "id": "1973216626368883036_24455934",
                        "media_type": 1,
                        "image_versions2": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/c50e6530c3e419ce4c25ee5a5c4fd5a0/5D5695B1/t51.2885-15/e35/50154926_841318422895601_1497406683810616294_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MTk3MzIxNjYyNjM2ODg4MzAzNg%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/91456f6df42a0b4855abbd31a23bb325/5D5653B9/t51.2885-15/e35/s240x240/50154926_841318422895601_1497406683810616294_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MTk3MzIxNjYyNjM2ODg4MzAzNg%3D%3D.2"
                                }
                            ],
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "1973216626368883036",
                        "carousel_parent_id": "1973216630898853189_24455934"
                    },
                    {
                        "id": "1973216626360709510_24455934",
                        "media_type": 1,
                        "image_versions2": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/02ea5f1e5f579d37b97ebea649098452/5D6414F7/t51.2885-15/e35/51919846_321257938596318_2028038927783756114_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MTk3MzIxNjYyNjM2MDcwOTUxMA%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/eab3fe4d7231e2220f5105b43db94f0e/5D7295FF/t51.2885-15/e35/s240x240/51919846_321257938596318_2028038927783756114_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MTk3MzIxNjYyNjM2MDcwOTUxMA%3D%3D.2"
                                }
                            ],
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "1973216626360709510",
                        "carousel_parent_id": "1973216630898853189_24455934"
                    },
                    {
                        "id": "1973216626377340063_24455934",
                        "media_type": 1,
                        "image_versions2": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/5749b08bb1c699e459cbc0ff3f1ef812/5D6B8AC5/t51.2885-15/e35/51683093_774867649537139_3854897210252709545_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MTk3MzIxNjYyNjM3NzM0MDA2Mw%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/45b4b8b882efcd0ff89e6bd618a13057/5D5E63CD/t51.2885-15/e35/s240x240/51683093_774867649537139_3854897210252709545_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MTk3MzIxNjYyNjM3NzM0MDA2Mw%3D%3D.2"
                                }
                            ],
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "1973216626377340063",
                        "carousel_parent_id": "1973216630898853189_24455934"
                    },
                    {
                        "id": "1973216626360532730_24455934",
                        "media_type": 1,
                        "image_versions2": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/b66e7f6fc71ce85da77dd4d5f683bb7c/5D52AE11/t51.2885-15/e35/51150023_140435476981766_2094958494712810916_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MTk3MzIxNjYyNjM2MDUzMjczMA%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/e72b6cb920f876ed6eb8dc1c4e9fbae3/5D6EDC19/t51.2885-15/e35/s240x240/51150023_140435476981766_2094958494712810916_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MTk3MzIxNjYyNjM2MDUzMjczMA%3D%3D.2"
                                }
                            ],
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "1973216626360532730",
                        "carousel_parent_id": "1973216630898853189_24455934"
                    },
                    {
                        "id": "1973216626385820891_24455934",
                        "media_type": 1,
                        "image_versions2": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/beb6ea30427603e1fbc8f59bc7a5bc01/5D6C7213/t51.2885-15/e35/51128823_143690356569784_1145672647464285870_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MTk3MzIxNjYyNjM4NTgyMDg5MQ%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/14b5343cccc070ee59e45a1e9926cc97/5D772D1B/t51.2885-15/e35/s240x240/51128823_143690356569784_1145672647464285870_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MTk3MzIxNjYyNjM4NTgyMDg5MQ%3D%3D.2"
                                }
                            ],
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "1973216626385820891",
                        "carousel_parent_id": "1973216630898853189_24455934"
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