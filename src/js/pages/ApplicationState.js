import React from 'react-type-r'
import { Record, shared, type, define } from 'type-r'
import * as socketIOClient from 'socket.io-client';
import Page from 'app/Page'
import config from 'server/config'
import { InUser, InFolder, InPost, InMedia } from 'models/InModels'

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
            info   : InUser,
            name   : 'sveta.evgrafova',//'alexander.evgrafov',  //
            pwd    : 'bp8djx408122',//'lokkol123',   //
            logged : false
        } ),
        folders      : InFolder.Collection,
        open_folder  : shared( InFolder ),
        screen       : type( String ).value( '' ),
        queue        : WsTask.Collection,
        fake_post    : InPost
    };

    ws      = null;
    counter = 0;


    initialize( values, options ) {
        this.fake_post.set(        {
            "media": {
                "taken_at": "1555355284",
                "pk": "2022789192576284147",
                "id": "2022789192576284147_3172861554",
                "device_timestamp": "78390226359912",
                "media_type": 8,
                "code": "BwSZA2vAjXz",
                "client_cache_key": "MjAyMjc4OTE5MjU3NjI4NDE0Nw==.2",
                "filter_type": 0,
                "comment_likes_enabled": true,
                "comment_threading_enabled": true,
                "has_more_comments": true,
                "next_max_id": "17887369273320738",
                "max_num_visible_preview_comments": 2,
                "preview_comments": [
                    {
                        "pk": "18055652158024911",
                        "user_id": "680548281",
                        "text": "👏",
                        "type": 0,
                        "created_at": "1555401740",
                        "created_at_utc": "1555401740",
                        "content_type": "comment",
                        "status": "Active",
                        "bit_flags": 0,
                        "user": {
                            "pk": "680548281",
                            "username": "fruity1502",
                            "full_name": "Alexey Krivov",
                            "is_private": false,
                            "profile_pic_url": "https://scontent-arn2-1.cdninstagram.com/vp/5d5fc19d28f11c6071052afd32b13224/5D6AC075/t51.2885-19/s150x150/52357991_534785143711805_8679347225463095296_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com",
                            "profile_pic_id": "1997051004593161135_680548281",
                            "is_verified": false
                        },
                        "did_report_as_spam": false,
                        "share_enabled": false,
                        "media_id": "2022789192576284147",
                        "has_liked_comment": false,
                        "comment_like_count": 0
                    },
                    {
                        "pk": "17887369273320738",
                        "user_id": "2066376884",
                        "text": "Очень красиво",
                        "type": 0,
                        "created_at": "1555427128",
                        "created_at_utc": "1555427128",
                        "content_type": "comment",
                        "status": "Active",
                        "bit_flags": 0,
                        "user": {
                            "pk": "2066376884",
                            "username": "lena_n_tin",
                            "full_name": "Elena Tinaeva",
                            "is_private": true,
                            "profile_pic_url": "https://scontent-arn2-1.cdninstagram.com/vp/a95803b89d5be474f98e36335853c9a2/5D638450/t51.2885-19/s150x150/11939297_815505521899356_1928077678_a.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com",
                            "is_verified": false
                        },
                        "did_report_as_spam": false,
                        "share_enabled": false,
                        "media_id": "2022789192576284147",
                        "has_translation": true,
                        "has_liked_comment": false,
                        "comment_like_count": 0
                    }
                ],
                "can_view_more_preview_comments": true,
                "comment_count": 8,
                "inline_composer_display_condition": "impression_trigger",
                "carousel_media_count": 7,
                "carousel_media": [
                    {
                        "id": "2022789188205740737_3172861554",
                        "media_type": 1,
                        "image_versions2": {
                            "candidates": [
                                {
                                    "width": 960,
                                    "height": 960,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/f3782e9a8011f8f2650c60d759699ab9/5D67794C/t51.2885-15/e35/56883669_355409668516173_9012153309832829048_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=8&ig_cache_key=MjAyMjc4OTE4ODIwNTc0MDczNw%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/dff8f3a3ffe3bbe7e7765eadefc777a1/5D6F8444/t51.2885-15/e35/s240x240/56883669_355409668516173_9012153309832829048_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MjAyMjc4OTE4ODIwNTc0MDczNw%3D%3D.2"
                                }
                            ]
                        },
                        "original_width": 960,
                        "original_height": 960,
                        "pk": "2022789188205740737",
                        "carousel_parent_id": "2022789192576284147_3172861554"
                    },
                    {
                        "id": "2022789188197331129_3172861554",
                        "media_type": 1,
                        "image_versions2": {
                            "candidates": [
                                {
                                    "width": 960,
                                    "height": 960,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/a1aa396d539929c36d6ed1afbd35e8e1/5D67B483/t51.2885-15/e35/56444374_2464942496895394_1148038550991845822_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=8&ig_cache_key=MjAyMjc4OTE4ODE5NzMzMTEyOQ%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/dc5c2d8497a85932b42129356273a55e/5D58ADBA/t51.2885-15/e35/s240x240/56444374_2464942496895394_1148038550991845822_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MjAyMjc4OTE4ODE5NzMzMTEyOQ%3D%3D.2"
                                }
                            ]
                        },
                        "original_width": 960,
                        "original_height": 960,
                        "pk": "2022789188197331129",
                        "carousel_parent_id": "2022789192576284147_3172861554"
                    },
                    {
                        "id": "2022789188205783744_3172861554",
                        "media_type": 1,
                        "image_versions2": {
                            "candidates": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/4fb4f2db2dc201defa8a82405fc4cd65/5D68BFCF/t51.2885-15/e35/57348341_869399180098948_7704523472205296709_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MjAyMjc4OTE4ODIwNTc4Mzc0NA%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/51dd29a8679c57462e5ec54cdf31289c/5D7799C7/t51.2885-15/e35/s240x240/57348341_869399180098948_7704523472205296709_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MjAyMjc4OTE4ODIwNTc4Mzc0NA%3D%3D.2"
                                }
                            ]
                        },
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "2022789188205783744",
                        "carousel_parent_id": "2022789192576284147_3172861554"
                    },
                    {
                        "id": "2022789188188932667_3172861554",
                        "media_type": 1,
                        "image_versions2": {
                            "candidates": [
                                {
                                    "width": 960,
                                    "height": 960,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/561b0ded5b51a8b1ed63e955c4745647/5D675AE5/t51.2885-15/e35/58019637_412306662658236_263951558937010797_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=8&ig_cache_key=MjAyMjc4OTE4ODE4ODkzMjY2Nw%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/95293ab710147b3669b17ccf1d1c7b40/5D5EE4C2/t51.2885-15/e35/s240x240/58019637_412306662658236_263951558937010797_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MjAyMjc4OTE4ODE4ODkzMjY2Nw%3D%3D.2"
                                }
                            ]
                        },
                        "original_width": 960,
                        "original_height": 960,
                        "pk": "2022789188188932667",
                        "carousel_parent_id": "2022789192576284147_3172861554"
                    },
                    {
                        "id": "2022789188239438467_3172861554",
                        "media_type": 1,
                        "image_versions2": {
                            "candidates": [
                                {
                                    "width": 960,
                                    "height": 960,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/04fe2e0791d3a1ade4380695af461be8/5D5266C5/t51.2885-15/e35/56526848_346332766005085_2461572908192207082_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=8&ig_cache_key=MjAyMjc4OTE4ODIzOTQzODQ2Nw%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/6cf3cdecfcc189ff2edeb15497073d68/5D729ACD/t51.2885-15/e35/s240x240/56526848_346332766005085_2461572908192207082_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MjAyMjc4OTE4ODIzOTQzODQ2Nw%3D%3D.2"
                                }
                            ]
                        },
                        "original_width": 960,
                        "original_height": 960,
                        "pk": "2022789188239438467",
                        "carousel_parent_id": "2022789192576284147_3172861554"
                    },
                    {
                        "id": "2022789188222586314_3172861554",
                        "media_type": 1,
                        "image_versions2": {
                            "candidates": [
                                {
                                    "width": 1080,
                                    "height": 1080,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/b17e54b06ab4a7e9d1ec23225362e8f6/5D54B8AB/t51.2885-15/e35/56551830_680447889036243_3237016944374094664_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MjAyMjc4OTE4ODIyMjU4NjMxNA%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 240,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/3006537757d5ee90c3531655cfff191a/5D58EBA3/t51.2885-15/e35/s240x240/56551830_680447889036243_3237016944374094664_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MjAyMjc4OTE4ODIyMjU4NjMxNA%3D%3D.2"
                                }
                            ]
                        },
                        "original_width": 1080,
                        "original_height": 1080,
                        "pk": "2022789188222586314",
                        "carousel_parent_id": "2022789192576284147_3172861554"
                    },
                    {
                        "id": "2022789188214309384_3172861554",
                        "media_type": 1,
                        "image_versions2": {
                            "candidates": [
                                {
                                    "width": 1080,
                                    "height": 1079,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/af164ee0f024dd15630a1981400bc663/5D5AA8A1/t51.2885-15/e35/57311718_431307224296455_5348795871031373094_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&se=7&ig_cache_key=MjAyMjc4OTE4ODIxNDMwOTM4NA%3D%3D.2"
                                },
                                {
                                    "width": 240,
                                    "height": 239,
                                    "url": "https://scontent-arn2-1.cdninstagram.com/vp/9a3bd1d4ed17740a979f7eb80fff605a/5D57E6A9/t51.2885-15/e35/s240x240/57311718_431307224296455_5348795871031373094_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&ig_cache_key=MjAyMjc4OTE4ODIxNDMwOTM4NA%3D%3D.2"
                                }
                            ]
                        },
                        "original_width": 1080,
                        "original_height": 1079,
                        "pk": "2022789188214309384",
                        "carousel_parent_id": "2022789192576284147_3172861554"
                    }
                ],
                "can_see_insights_as_brand": false,
                "location": {
                    "pk": "515398340",
                    "name": "Petropavlovsk Kamchatski, Kamchatskaya Oblast', Russia",
                    "address": "",
                    "city": "",
                    "short_name": "Petropavlovsk Kamchatski",
                    "lng": 158.65000000000001,
                    "lat": 53.0167,
                    "external_source": "facebook_places",
                    "facebook_places_id": "104968619538312"
                },
                "lat": 53.0167,
                "lng": 158.65000000000001,
                "user": {
                    "pk": "3172861554",
                    "username": "alexeytinaev",
                    "full_name": "Alexey  Tinaev",
                    "is_private": false,
                    "profile_pic_url": "https://scontent-arn2-1.cdninstagram.com/vp/b02551b37835f567a319639fbf9e5388/5D690EA2/t51.2885-19/s150x150/49907521_773577126374513_299385119183994880_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com",
                    "profile_pic_id": "1712920544074083160_3172861554",
                    "friendship_status": {
                        "following": true,
                        "outgoing_request": false,
                        "is_bestie": false
                    },
                    "is_verified": false,
                    "has_anonymous_profile_picture": false,
                    "is_unpublished": false,
                    "is_favorite": false
                },
                "can_viewer_reshare": true,
                "caption_is_edited": false,
                "like_count": 418,
                "has_liked": false,
                "photo_of_you": false,
                "caption": {
                    "pk": "18047757292077717",
                    "user_id": "3172861554",
                    "text": "Взошли на Вилючинский вулкан. В награду получили потрясающий вид на Тихий  океан и Камчатку, и спуск почти 7км длиной и 2100м перепадом. Это незабываемо! Вулканы кажутся удивительно большими, когда смотришь на них издалека. А тут раз, и 5,5 часа спустя уже смотришь сверху вниз. 🏔️ #alpindustria #альпиндустрия #arcteryx #GORETEX #skiguide #mountains #offpiste #rmgaguides #skiguide #rmga #камчатка #kamchatka #kamchatkaski #skitour #skitouring #скитур \nЭкипировка: @goretexeu @arcteryx_ru #movementskis Fly 115, GO 109",
                    "type": 1,
                    "created_at": "1555355286",
                    "created_at_utc": "1555355286",
                    "content_type": "comment",
                    "status": "Active",
                    "bit_flags": 0,
                    "user": {
                        "pk": "3172861554",
                        "username": "alexeytinaev",
                        "full_name": "Alexey  Tinaev",
                        "is_private": false,
                        "profile_pic_url": "https://scontent-arn2-1.cdninstagram.com/vp/b02551b37835f567a319639fbf9e5388/5D690EA2/t51.2885-19/s150x150/49907521_773577126374513_299385119183994880_n.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com",
                        "profile_pic_id": "1712920544074083160_3172861554",
                        "friendship_status": {
                            "following": true,
                            "outgoing_request": false,
                            "is_bestie": false
                        },
                        "is_verified": false,
                        "has_anonymous_profile_picture": false,
                        "is_unpublished": false,
                        "is_favorite": false
                    },
                    "did_report_as_spam": false,
                    "share_enabled": false,
                    "media_id": "2022789192576284147",
                    "has_translation": true
                },
                "can_viewer_save": true,
                "has_viewer_saved": true,
                "saved_collection_ids": [
                    "17939704498255728",
                    "18023306578072901"
                ],
                "organic_tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjpmYWxzZSwidXVpZCI6IjY1ZDcyMjY1ZjRkZTQyNzliNDZhMDczY2M0NDQ0OTE4MjAyMjc4OTE5MjU3NjI4NDE0NyIsInNlcnZlcl90b2tlbiI6IjE1NTY3MTgxNzYzNzd8MjAyMjc4OTE5MjU3NjI4NDE0N3wzOTYyOTI0MTU3fDU2YjI4ZmQ3MTczNDZiYzE4NWM4ZTE2ZWI4NDQ2MTJlMGYyZWNkYzkzMjhmZmI2ZWVkM2ZmYzk3ZDBjMzhkZDAifSwic2lnbmF0dXJlIjoiIn0="
            }
        }, {parse:true})
    }

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