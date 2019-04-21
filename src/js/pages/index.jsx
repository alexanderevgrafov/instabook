//import 'type-r/globals'
import React from 'react-type-r'
import { Record, shared, type, predefine, define } from 'type-r'
import { Timestamp } from 'type-r/ext-types'
import * as socketIOClient from 'socket.io-client';
import { Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import { Input, Button } from 'ui/Controls'
import config from '../../server/config'

let ws;
//import 'bootstrap/dist/css/bootstrap.min.css'

import '../../sass/app.scss'

const server_path = (config.ws_server_addr || 'http://localhost') + ':' + config.ws_server_port;

@define
class InstaUser extends Record {
    static attributes = {
        allowed_commenter_type        : '',
        can_boost_post                : false,
        can_see_organic_insights      : false,
        full_name                     : '',
        has_anonymous_profile_picture : true,
        is_private                    : false,
        is_unpublished                : false,
        is_verified                   : false,
        pk                            : '',
        profile_pic_url               : '',
        reel_auto_archive             : 'unset',
        show_insights_terms           : false,
        username                      : '',
    }
}

@define
class InstaImageVersion extends Record {
    static attributes = {
        width  : 0,
        height : 0,
        url    : ''
    };

    static collection = {
        comparator : 'width',
        small() {
            return this.at( 0 );
        },
        parse( data ) {
            return data.candidates
        }
    }
}

@define
class InstaCaption extends Record {
    static attributes = {
        bit_flags          : 0,
        content_type       : '',
//        created_at         : type( Timestamp ),
//        created_at_utc     : type( Timestamp ),
        did_report_as_spam : false,
        has_translation    : true,
        media_id           : 0,
        pk                 : 0,
        share_enabled      : false,
        status             : 'Active',
        text               : '',
        type               : 0,
        user_id            : 0
    }
}

@predefine
@define
class InstaMedia extends Record {
    static attributes = {
        id                   : '',
        image_versions2      : InstaImageVersion.Collection,
        media_type           : 0,  // 1-Photo, 2 - video  8-carousel
        carousel_media_count : 4,
        carousel_media       : InstaMedia.Collection,
        // can_view_more_preview_comments    : false,
        // can_viewer_reshare                : true,
        // can_viewer_save                   : true,
        caption              : InstaCaption,
        // caption_is_edited                 : false,
        // client_cache_key                  : '',
        // code                              : '',
        comment_count        : 0,
        // comment_likes_enabled             : true,
        // comment_threading_enabled         : true,
        device_timestamp     : 0,
        // filter_type                       : 0,
        // has_audio                         : true,
        // has_liked                         : false,
        // has_more_comments                 : false,
        // has_viewer_saved                  : true,
        // inline_composer_display_condition : '',
        // is_dash_eligible                  : 1,
        // lat                               : 0,
        // lng                               : 0,
        like_count           : 0,
//        likers: (5) [{…}, {…}, {…}, {…}, {…}]
//        location: {pk: "213063425", name: "Arambol, Goa, India", address: "", city: "", short_name: "Arambol", …}
//         max_num_visible_preview_comments  : 0,
//         number_of_qualities               : 1,
//         organic_tracking_token            : '',
        original_height      : 0,
        original_width       : 0,
        // photo_of_you                      : false,
        // pk                                : '',
        // preview_comments                  : [],
        // saved_collection_ids              : [ '18023306578072901' ],
        taken_at             : 0,
        user                 : InstaUser,
        video_codec          : '',
//video_dash_manifest: ""
        video_duration       : 0,
//video_versions: (3) [{…}, {…}, {…}],
        view_count           : 0
    };

    get quickURL() {
        const small = this.image_versions2.small();

        return small ? small.url : '';
    }

}

@define
class InstaFolderItem extends Record {
    static attributes = {
        media : InstaMedia
    }
}

@define
class InstaFolder extends Record {
    static idAttribute = 'collection_id';

    static attributes = {
        collection_id          : '',
        collection_media_count : 0,
        collection_name        : '',
        collection_type        : '',
        cover_media            : InstaMedia,

        items : InstaFolderItem.Collection
    };

    // get coverURL() {
    //     const small = this.cover_media.image_versions2.small();
    //
    //     return small ? small.url : '';
    // }
}

@define
class ApplicationState extends Record {
    static attributes = {
        server  : Record.defaults( {
            connected          : false,
            reconnect_after    : 0,
            reconnect_attempts : 0
        } ),
        user    : Record.defaults( {
            name   : 'alexander.evgrafov',
            pwd    : 'lokkol123',   //bp8djx408122
            logged : false
        } ),
        folders : InstaFolder.Collection,

        folder : shared( InstaFolder )
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

        return new Promise( ( resolve, reject ) => {
            const signature = 'sig' + this.counter++;
            this.ws.emit( command, { signature, params } );
            this.queue[ signature ] = [ resolve, reject ];
        } );
    }
}

const Folder = ( { folder, onClick } ) => <div key={folder.cid} onClick={onClick}>
    <img src={folder.cover_media.quickURL} style={{ maxWidth : 300, maxHeight : 300 }}/>
    {folder.collection_name}
</div>;

const FolderItem = ( { item, onClick } ) => <div onClick={onClick}>
    <img src={item.media.quickURL} style={{ maxWidth : 250, maxHeight : 250 }}/>
    {item.media.caption && item.media.caption.text}
</div>;

@define
export class Application extends React.Component {
    static state = ApplicationState;

    componentWillMount() {
//        const { ws } = this.state;

        this.state.io( 'hola', 'Shark' ).then(
            () => console.log( 'on hola' )
        );
    }

    onInstLogin = () => {
        const { user }      = this.state,
              { name, pwd } = user;
        this.state.io( 'login', { name, pwd } ).then(
            () => user.logged = true
        ).catch(err=>alert('Login error: ' + err));
    };

    onShowFolders = () => {
        const { folders } = this.state;

        this.state.io( 'cmd', { cmd : 'folders' } ).then(
            data => folders.add( data.items, { parse : true } )
        );
    };

    onFolderClick( folder ) {
        this.state.folder = folder;
        this.state.io( 'cmd', { cmd : 'folder_content', args : [ folder.collection_id ] } ).then(
            data => {
                const { folders } = this.state,
                      folder      = folders.get( data.collection_id );

                if( folder ) {
                    folder.items.add( data.items, { parse : true } );
                }
            }
        );
    }

    onFolderItemClick( folder ) {

    }

    render() {
        const { server, user, folder, folders } = this.state;

        return <div>
            <h1>Instagram login:</h1>
            <div>username: <Input valueLink={user.linkAt( 'name' )}/></div>
            <div>password: <Input valueLink={user.linkAt( 'pwd' )} t_ype='password'/></div>
            <Button onClick={this.onInstLogin} label='Login'/>

            <Button onClick={this.onShowFolders} label='Show folders' disabled={!user.logged}/>


            <div className='server-info'>{
                server.connected ? 'Connected' : ('Disconected. ')
            }</div>

            <div className='folders_container'>
                {folder ? <Button onClick={() => this.state.folder = null} label='Go back'/> : null}
                {folder ?
                 folder.items.map( item =>
                     <FolderItem item={item} onClick={() => this.onFolderItemClick( item )} key={item.cid}/>
                 ) :
                 folders.map( folder =>
                     <Folder folder={folder} onClick={() => this.onFolderClick( folder )} key={folder.cid}/>
                 )}

            </div>
        </div>;
    }
}
