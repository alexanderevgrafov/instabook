import React from 'react-type-r'
import { define } from 'type-r'
import { Select, Slider } from 'ui/Controls'
import {
    Container, Row, Col,
    Badge,
    Card,
    Modal, Form, Button
} from 'ui/Bootstrap'
import Page from 'app/Page'
import { ApplicationState } from './ApplicationState'
import { templates, papers, TemplateModel } from '../../templates/all_server'
import * as platform from 'platform'
import cx from 'classnames'
import { _t } from 'app/translate'
import 'scss/app.scss'

const PAPER_SIZE      = 'a5',
      PAGE_BREAK_LINE = '[[pagebreak]]';

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
        <img src={folder.cover_media.quickURL} style={{ maxWidth : 300, maxHeight : 300 }} alt=''/>
        {folder.collection_name}
    </div>;
*/

const FolderListItem = ( { folder, onClick } ) =>
    <Card className='folder_item cursorable' onClick={onClick}>
        <Card.SquareImg variant='top' src={folder.cover_media.urls[ 0 ]}/>
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
        <img src={item.media.quickURL} className='post_card_img'/>
        <div className='post_card_text'>
            {item.media.caption && item.media.caption.text}
        </div>
    </div>;
*/

const SquarePicture = ( { urls } ) => {
    if( urls.length > 1 ) {
        const scale = 100 - urls.length * 8;

        return <div className='card-img square_picture'>{
            _.map( urls, ( u, i ) =>
                <img src={u} style={{
                    width  : scale + '%',
                    top    : i * (100 - scale) / (urls.length - 1) + '%',
                    left   : i * (100 - scale) / (urls.length - 1) + '%',
                    zIndex : 40 - i
                }} alt='' key={i}/> )
        }</div>

    } else {
        return <div className='square_picture'><img src={urls[ 0 ]} alt={null}/></div>
    }
};

const Post = ( { item } ) =>
    <Card className='post_card cursorable' onClick={() => item.is_selected = !item.is_selected}>
        <SquarePicture urls={item.media.urls}/>
        {item.is_selected ?
         <Card.ImgOverlay>
             <h2><Badge variant='success'>Selected</Badge></h2>
         </Card.ImgOverlay> : null
        }
        <Card.Body>
            <Card.Text className='card_text_h_limit'>{item.media.caption && item.media.caption.text}</Card.Text>
        </Card.Body>
    </Card>;

export class Prepare extends React.Component {
    static state = {
        screen_scale : 1
    };

    componentDidMount() {
        this.listenTo( Page, 'page-resize', this.onPageResize );
    }

    onPageResize() {
        const width = this.refs.container ? this.refs.container.offsetWidth : 1000;

        this.state.screen_scale = Math.max( 1, width / 610 );
    }

    render() {
        const { state, onGetPdf } = this.props;

        return (
            <Container className='prepare_container' ref='container'>
                <Row>
                    <Button onClick={() => state.screen = ''} label='Go back'/>
                    <Button onClick={onGetPdf} label='Get PDF'/>

                </Row>
                <Row>
                    {_.map( state.open_folder.selection, post =>
                            <PreparePost post={post} scale={this.state.screen_scale} key={post.cid}/>
                    )}
                </Row>
            </Container>);
    }
}

const PreparePage = ( { scale, controls, page } ) =>
    <Col className='prepare_page_col'>
    <Card className='prepare_page' key={0}>
        <Card.Header className='prepare_controls'>{controls}</Card.Header>
        <Card.Body style={{ paddingTop : scale < 1 ? '122%' : '104mm' }}>
            <div className={'prepare_outer_cutter'}>
                <div className={cx( 'prepare_preview_box', PAPER_SIZE )}
                     style={scale < 1 ? { transform : 'scale(' + scale + ')' } : null}>
                    <div className='prepare_preview_page side1'>{page}</div>
                </div>
            </div>
        </Card.Body>
    </Card>
    </Col>;

@define
class PreparePost extends React.Component {
    static state = {
        screen_scale : 1
    };

    componentDidMount() {
        this.listenTo( Page, 'page-resize', this.onPageResize );
        this.onPageResize();
    }

    onPageResize() {
        const width = this.refs.container ? this.refs.container.offsetWidth : 1000;

        this.state.screen_scale = Math.min( 1, (width) / 279/* 567 */ );
    }

    render() {
        const { post } = this.props,
              scale    = this.state.screen_scale;

        const page_style = papers[ PAPER_SIZE ],
              tmpl0      = templates.get( post.config.tmpl0 ),
              tmpl1      = templates.get( post.config.tmpl1 ),

              PagePhoto  = tmpl0 ? tmpl0.page( post, page_style ) : null,
              PageText   = tmpl1 ? tmpl1.page( post, page_style ) : null;

        return [
            <div className='prepare_page_size_ref' ref='container' key={2}/>,
            <PreparePage
                     key={1}
                     scale={scale}
                     controls={
                         <Row>
                             <Col>
                                 <Form.ControlLinked as='select' valueLink={post.config.linkAt( 'tmpl0' )}>
                                     {_.map( templates.filter( t => t.type === 'media' ),
                                         t => <option value={t.name} key={t.name}>{t.native || t.name}</option>
                                     )
                                     }
                                 </Form.ControlLinked>
                                 <Slider valueLink={post.config.linkAt( 'page_padding' )} min={0} max={100}/>
                             </Col>
                         </Row>
                     }
                     page={PagePhoto}
                 />
            , <PreparePage
                     key={0}
                     scale={scale}
                     controls={
                         <Row>
                             <Col>
                                 <Form.ControlLinked as='select' valueLink={post.config.linkAt( 'tmpl1' )}>
                                     {_.map( templates.filter( t => t.type === 'text' ),
                                         t => <option value={t.name} key={t.name}>{t.native || t.name}</option>
                                     )
                                     }
                                 </Form.ControlLinked>
                                 <Slider valueLink={post.config.linkAt( 'post_font_size' )} min={20} max={400}/>
                             </Col>
                         </Row>
                     }
                     page={PageText}
                 />
        ]
    };
}

/*
                    <div className='prepare_preview_page side1'
                         dangerouslySetInnerHTML={{ __html : side1html }}/>
                    <div className='prepare_preview_page side2'
                         dangerouslySetInnerHTML={{ __html : side2html }}/>
 */

@define
export class ApplicationPage
    extends React
        .Component {
    static state = ApplicationState;

    componentWillMount() {
        const myname = `${platform.name} ${platform.version} ${platform.layout} ${platform.os}`;

        this.state.io( 'hola', myname ).then(
            () => console.log( 'on hola' )
        );

        $( window ).on( 'resize', e => Page.forceResize( e ) );
    }

    componentWillUnmount() {
        $( window ).off( 'resize', e => Page.forceResize( e ) );
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

    onGetPdf = cmd => {
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

    getFakePdf = () => {
        const { fake_post } = this.state;

        Page.notifyOnComplete(
            this.state.io( 'test_pdf', {
                post : fake_post.toJSON()
//                text   : fake_post.media.caption.text || '',
//                url    : fake_post.media.fullURL,
//                config : fake_post.config.toJSON()
            } ).then(
                data => {
                    console.log( 'Test PDF is in the folder', data )
                }
            ),
            {
                before  : 'Load test PDF...',
                success : 'PDF test generated!',
                error   : 'PDF test err'
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
                View = [ <Row key={0}>
                             <Col>
                                 <LoginView user={user} onLogin={this.onInstLoginClick}/>
                             </Col>
                         </Row>,
                         <Row key={1}>
                             <Col>
                                 <Button onClick={this.getFakePdf} label='Get test PDF'/>
                             </Col>
                         </Row>,
                         <Row key={2}>
                                 <PreparePost post={state.fake_post}/>
                         </Row> ];
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
                    <Col className='text-center' key={step}>
                        <h3><Badge pill variant={step === cur_step ? 'primary' : 'light'}>{_t( step )}</Badge></h3>
                    </Col>
                )
            }
            </Row>
            <Row>
                <Col>{View}</Col>
            </Row>
        </Container>;
    }
}
