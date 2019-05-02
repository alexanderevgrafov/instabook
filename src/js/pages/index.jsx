import React from 'react-type-r'
import { define } from 'type-r'
import { Input, Button } from 'ui/Controls'
import Page from 'app/Page'
import { ApplicationState } from './ApplicationState'
import templates from '../../templates/all_templates'
import '../../sass/app.scss'

const Folder = ( { folder, onClick } ) => <div key={folder.cid} onClick={onClick}>
    <img src={folder.cover_media.quickURL()} style={{ maxWidth : 300, maxHeight : 300 }} alt=''/>
    {folder.collection_name}
</div>;

const FolderItem = ( { item, onClick } ) => {
    let params  = {
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

    return <div onClick={onClick}>
        {item.is_selected && '[selected]'}
        <img src={tmpl.icon} alt=''/>
        {JSON.stringify( tmpl.params )}
        <div dangerouslySetInnerHTML={{ __html : tmpl.template( params ) }}/>
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

    onGetPdf = () => {
        const { open_folder } = this.state;

        Page.notifyOnComplete(
            this.state.io( 'gen_pdf', { fid : open_folder.id, items : _.pluck( open_folder.selection, 'id' ) } ).then(
                data => {
                    console.log('PDF is in the folder', data)
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
