import React from 'react-type-r'
import { define } from 'type-r'
import { Input, Select, Button } from 'ui/Controls'
import { Dialog } from 'ui/Layout'
import Page from 'app/Page'
import { ApplicationState } from './ApplicationState'
import { all as templates } from '../../templates/all_templates'
import '../../sass/app.scss'
import { cx } from 'classnames'

const Post = ( { item, onClick } ) => {
    let params = {
        media_url  : item.media.quickURL(),
        post       : item.media.caption && item.media.caption.text,
        page_break : '<hr/>'
    };

    const tmpl_names = _.keys( templates ),
          tmpl_name  = tmpl_names[ Math.floor( Math.random() * tmpl_names.length ) ],
          tmpl       = templates[ tmpl_name ];

    if( !tmpl ) {
        return null;
    }

    return <div className={cx( 'post_card', { selected : item.is_selected } )}>
        <img src={item.media.quickURL()} className='post_card_img'/>
        <div className='post_card_text'>
            {item.media.caption && item.media.caption.text}
        </div>
    </div>;
};

const FolderItem = ( { folder, onClick } ) => <div key={folder.cid} onClick={onClick}>
    <img src={folder.cover_media.quickURL()} style={{ maxWidth : 300, maxHeight : 300 }} alt=''/>
    {folder.collection_name}
</div>;

const FoldersList = ( { folders, onSelect, onBack } ) =>
    <div className='folders_list_container'>
        {onBack ? <Button onClick={onBack} label='Re-login'/> : null}
        <div className='folders_list'>
            {folders.map( folder => <FolderItem folder={folder} onClick={() => onSelect( folder )} key={folder.cid}/> )}
        </div>
    </div>;

const FolderView = ( { folder, onSelect, onBack } ) =>
    <div className='folder_view_container'>
        {onBack ? <Button onClick={onBack} label='Go back'/> : null}
        {folder.items.map( item =>
            <Post item={item} onClick={onSelect} key={item.cid}/>
        )}
    </div>;

const Prepare = ( { state } ) =>
    <div className='prepare_container'>
        <Button onClick={() => state.screen === ''} label='Go back'/>
        <div className='prepare_pages_list'>
            {_.map( state.open_folder.selection, post =>
                <PostPrepare post={post} key={post.cid}/>
            )}
        </div>
    </div>;

const PostPrepare = ( { post } ) => {
    const params = {
        media_url  : item.media.quickURL(),
        post       : item.media.caption && item.media.caption.text,
        page_break : '<hr/>'
    }, template  = templates[ post.config.tmpl ];

    if( !template ) {
        return null;
    }

    return <div className='prepare_page'>
        <div className='prepare_controls'>
            <Select valueLink={post.config.linkAt( 'tmpl' )}>
                {_.map( tmpl_names, name => <option value={name} key={name}>{name}</option> )}
            </Select>
        </div>
        <div className='prepare_preview_box'>
            <div className='prepare_preview_page' dangerouslySetInnerHTML={{ __html : template.template( params ) }}/>
        </div>
    </div>
};

@define
export class ApplicationPage extends React.Component {
    static state = ApplicationState;

    componentWillMount() {
        this.state.io( 'hola', 'Shark' ).then(
            () => console.log( 'on hola' )
        );
    }

    onInstLoginClick = () => {
        this.state.do_login();
    };

    onReloginClick() {
        this.state.open_folder = null;
        this.state.screen      = 'login';
    }

    onFolderClick( folder ) {
        this.state.open_folder = folder;

        this.state.get_open_folder();
    }

    onPrepareClick = () => {
        this.state.screen = 'prepare';
    };

    onGetPdf = () => {
        const { open_folder } = this.state;

        Page.notifyOnComplete(
            this.state.io( 'gen_pdf', { fid : open_folder.id, items : _.pluck( open_folder.selection, 'id' ) } ).then(
                data => {
                    console.log( 'PDF is in the folder', data )
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
        const { state }                                      = this,
              { server, user, open_folder, folders, screen } = state;

        return <div>
            {
                !user.logged || screen === 'login' ?
                <Dialog modal={true}>
                    <h1>Instagram login:</h1>
                    <div> username: <Input valueLink={user.linkAt( 'name' )}/></div>
                    <div>password: <Input valueLink={user.linkAt( 'pwd' )} t_ype='password'/></div>
                    <Button onClick={this.onInstLoginClick} label='Login'/>
                </Dialog> : null
            }
            {
                !open_folder ?
                <FoldersList folders={folders}
                             onClick={this.onFolderClick}
                             onBack={this.onReloginClick}/>
                             :
                (screen !== 'prepare' ? //TODO: screen navigation start to become weird now-here....
                 <FolderView folder={open_folder}
                             onSelect={() => item.is_selected = !item.is_selected}
                             onPrepare={this.onPrepareClick}
                             onBack={() => state.open_folder = null}/>
                                      :
                 <Prepare state={state}/>
                )

            }
            <Button onClick={this.onGetPdf} label='Get PDF' disabled={!open_folder || !open_folder.selection.length}/>


            <div className='server-info'>{
                server.connected ? 'Connected' : ('Disconnected. ')
            }</div>
        </div>;
    }
}
