import React from 'react-type-r'
import { define } from 'type-r'
import { Select } from 'ui/Controls'
import {
    Container, Row, Col,
    Badge,
    Card,
    Modal, Form, Button
} from 'ui/Bootstrap'
import Page from 'app/Page'
import { ApplicationState } from './ApplicationState'
import { all as templates } from 'templates/all_templates'
import 'scss/app.scss'
import cx from 'classnames'
import { _t } from 'app/translate'

const LoginView = ( { user, onLogin } ) =>
    <Modal.Dialog>
        <Modal.Header>
            <Modal.Title>Instagram login</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Form>
                <Form.Group controlId='formBasicEmail'>
                    <Form.Label>Login</Form.Label>
                    <Form.ControlLinked type='text' placeholder='Enter Instagram username'
                                        valueLink={user.linkAt( 'name' )}/>
                </Form.Group>
                <Form.Group controlId='formBasicPassword'>
                    <Form.Label>Password</Form.Label>
                    <Form.ControlLinked type='password' placeholder='Instagram password'
                                        valueLink={user.linkAt( 'pwd' )}/>
                    <Form.Text className='text-muted'>
                        We'll never share your personal data with anyone else.
                    </Form.Text>
                </Form.Group>
                <Button onClick={onLogin} label='Login'/>
            </Form>
        </Modal.Body>
    </Modal.Dialog>;

const FoldersList = ( { folders, onClick, onBack } ) =>
    <Row className='folders_list_container'>
        {onBack ? <Button onClick={onBack} label='Re-login'/> : null}
        {folders.map( folder =>
            <Col lg={2} md={3} sm={6} key={folder.cid}>
                <FolderListItem folder={folder} onClick={() => onClick( folder )}/>
            </Col> )}
    </Row>;
/*

const FolderItem__ = ( { folder, onClick } ) =>
    <div key={folder.cid} onClick={onClick}>
        <img src={folder.cover_media.quickURL()} style={{ maxWidth : 300, maxHeight : 300 }} alt=''/>
        {folder.collection_name}
    </div>;
*/

const FolderListItem = ( { folder, onClick } ) =>
    <Card className='folder_item cursorable' onClick={onClick}>
        <Card.SquareImg variant='top' src={folder.cover_media.quickURL()}/>
        <Card.Body>
            <Card.Title>{folder.collection_name}</Card.Title>
            <Card.Text className='card_text_h_limit'>{
                folder.collection_media_count + ' posts in folder'
                /*_t( 'number_of_posts', { count : folder.collection_media_count } )*/
            }
            </Card.Text>
        </Card.Body>
    </Card>;

const FolderView = ( { folder, onBack, onPrepare } ) =>
    <Container className='folder_view_container'>
        <Row>
            {onBack ? <Button onClick={onBack} label='Go back'/> : null}
            {onPrepare ? <Button onClick={onPrepare} label='Prepare print' disabled={!folder.selection.length}/> : null}
        </Row>
        <Row>
            {folder.items.map( item =>
                <Col lg={3} md={4} sm={6} key={item.cid}>
                    <Post item={item}/>
                </Col>
            )}
        </Row>
    </Container>;
/*
const Post = ( { item, onClick } ) =>
    <div className={cx( 'post_card', { selected : item.is_selected } )} onClick={onClick}>
        <img src={item.media.quickURL()} className='post_card_img'/>
        <div className='post_card_text'>
            {item.media.caption && item.media.caption.text}
        </div>
    </div>;
*/

const Post = ( { item } ) =>
    <Card className='post_card cursorable' onClick={() => item.is_selected = !item.is_selected}>
        <Card.SquareImg variant='top' src={item.media.quickURL()}/>
        {item.is_selected ?
         <Card.ImgOverlay>
             <h2><Badge variant='success'>Selected</Badge></h2>
         </Card.ImgOverlay> : null
        }
        <Card.Body>
            <Card.Text className='card_text_h_limit'>{item.media.caption && item.media.caption.text}</Card.Text>
        </Card.Body>
    </Card>;

const Prepare = ( { state, onGetPdf } ) =>
    <Container className='prepare_container'>
        <Row>
            <Button onClick={() => state.screen === ''} label='Go back'/>
            <Button onClick={onGetPdf} label='Get PDF'/>
        </Row>
        <Row>
            {_.map( state.open_folder.selection, post =>
                <Col lg={3} md={2} key={post.cid}>
                    <PostPrepare post={post}/>
                </Col>
            )}
        </Row>
    </Container>;

const PostPrepare = ( { post } ) => {
    const params = {
        media_url  : post.media.quickURL(),
        post       : post.media.caption && post.media.caption.text,
        page_break : '<hr/>'
    }, template  = templates[ post.config.tmpl ];

    if( !template ) {
        return <h4>No template rendered...</h4>;
    }

    return <Card className='prepare_page'>
        <Card.Header className='prepare_controls'>
            <Select valueLink={post.config.linkAt( 'tmpl' )}>
                {_.map( _.keys( templates ), name => <option value={name} key={name}>{name}</option> )}
            </Select>
        </Card.Header>
        <Card.Body>
            <div className='prepare_preview_box'>
                <div className='prepare_preview_page'
                     dangerouslySetInnerHTML={{ __html : template.template( params ) }}/>
            </div>
        </Card.Body>
    </Card>
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

    /*    onReloginClick = () => {
            this.state.open_folder = null;
            this.state.screen      = 'login';
        };*/

    onFolderClick = folder => {
        this.state.open_folder = folder;

        this.state.get_open_folder();
    };

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
        const { state }                              = this,
              { user, open_folder, folders, screen } = state;

        const cur_step = !user.logged || screen === 'login' ? 'login' :
                         !open_folder ? 'folders' ://TODO: screen navigation start to become weird now-here....
                         (screen !== 'prepare' ? 'folder' : 'prepare');

        let View = null;

        switch( cur_step ) {
            case 'login':
                View = <LoginView user={user} onLogin={this.onInstLoginClick}/>;
                break;
            case 'folders':
                View = <FoldersList folders={folders}
                                    onClick={this.onFolderClick}
                />;  //onBack={this.onReloginClick}
                break;
            case  'folder':
                View = <FolderView folder={open_folder}
                    //onSelect={() => item.is_selected = !item.is_selected}
                                   onPrepare={this.onPrepareClick}
                                   onBack={() => state.open_folder = null}/>;
                break;
            case 'prepare':
                View = <Prepare state={state} onGetPdf={this.onGetPdf}/>;
                break;
        }

        return <Container>
            <Row>{
                _.map( [ 'login', 'folders', 'folder', 'prepare' ], step =>
                    <Col className={cx( 'step', step, { current : step === cur_step } )}>{_t( step )}</Col>
                )
            }
            </Row>
            <Row>
                <Col>{View}</Col>
            </Row>
        </Container>;
    }
}
