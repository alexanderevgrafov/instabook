//import 'type-r/globals'
import React, { Link } from 'react-type-r'
import { Record, shared, type, predefine, define } from 'type-r'
//import { Timestamp } from 'type-r/ext-types'
import * as socketIOClient from 'socket.io-client';
//import { Route, Switch } from 'react-router'
//import { BrowserRouter } from 'react-router-dom'
import { Input, Button } from 'ui/Controls'
import Page from 'app/Page'
import config from '../../server/config'
import { InstaFolder } from '../models/InstaModels'

let ws;

import '../../sass/app.scss'
import { Checkbox } from 'react-type-r/tags';

const server_path = (config.ws_server_addr || 'http://localhost') + ':' + config.ws_server_port;

@define
class ApplicationState extends Record {
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
//                            () => console.log( 'on hola 2' )
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

const Folder = ( { folder, onClick } ) => <div key={folder.cid} onClick={onClick}>
    <img src={folder.cover_media.quickURL()} style={{ maxWidth : 300, maxHeight : 300 }} alt=''/>
    {folder.collection_name}
</div>;

const FolderItem = ( { item, onClick } ) => {
    let preview = null;

    switch( item.media.media_type ) {
        case 1:
        case 2:
            preview =
                <img src={item.media.quickURL()} style={{ maxWidth : 250, maxHeight : 250 }} className='carousel'
                     alt=''/>;
            break;
        case 8:
            preview = item.media.carousel_media.map(
                media => <img src={media.quickURL()} style={{ maxWidth : 120, maxHeight : 120 }} key={media.cid}
                              alt=''/>
            );
            break;
    }

    return <div onClick={onClick}>
        {item.is_selected && '[selected]'}
        {preview}
        {item.media.caption && item.media.caption.text}
    </div>;
};

@define
export class Application extends React.Component {
    static state = ApplicationState;

    componentWillMount() {
        this.state.io( 'hola', 'Shark' ).then(
            () => console.log( 'on hola' )
        );
    }

    onInstLogin = () => {
        this.state.do_login();
    };

    onFolderClick( folder ) {
        this.state.open_folder = folder;

        this.state.get_open_folder();
    }

    /*
        onFolderItemClick( folder ) {
            folder.is_selected = !folder.is_selected;
        }
    */

    onGetPdf = () => {
        const { open_folder } = this.state;

        Page.notifyOnComplete(
            this.state.io( 'gen_pdf', { fid : open_folder.id, items : _.pluck( open_folder.selection, 'id' ) } ).then(
                data => {

                }
            ),
            {
                before  : 'Load PDF...',
                success : 'PDF generated!',
                error   : 'PDF err'
            }
        );
    };

    render() {
        const { server, user, open_folder, folders } = this.state;

        return <div>
            <h1>Instagram login:</h1>
            <div>username: <Input valueLink={user.linkAt( 'name' )}/></div>
            <div>password: <Input valueLink={user.linkAt( 'pwd' )} t_ype='password'/></div>
            <Button onClick={this.onInstLogin} label='Login'/>

            <Button onClick={this.onGetPdf} label='Get PDF' disabled={!open_folder || !open_folder.selection.length}/>

            <div className='server-info'>{
                server.connected ? 'Connected' : ('Disconnected. ')
            }</div>

            <div className='folders_container'>
                {open_folder ? <Button onClick={() => this.state.open_folder = null} label='Go back'/> : null}
                {open_folder ?
                 open_folder.items.map( item =>
                     <FolderItem item={item} onClick={() => item.is_selected = !item.is_selected} key={item.cid}/>
                 ) :
                 folders.map( folder =>
                     <Folder folder={folder} onClick={() => this.onFolderClick( folder )} key={folder.cid}/>
                 )}

            </div>
        </div>;
    }
}
