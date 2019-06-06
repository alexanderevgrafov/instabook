import React from 'react-type-r'
import { define } from 'type-r'
import {
    Container, Row, Col,
    Badge,
    Modal, Form, Button
} from 'ui/Bootstrap'
import Page from 'app/Page'
import { ApplicationState } from './ApplicationState'
import * as platform from 'platform'
import { _t } from 'app/translate'
import 'scss/app.scss'
import { Prepare, PreparePost } from './Prepare';
import { FolderView, FoldersList } from './FolderPosts';

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




@define
export default class ApplicationPage    extends React.Component {
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
        const { open_folder } = this.state,
        items = {};

        _.each(open_folder.selection, x => {
            items[x.id] = x.config.toJSON()
        });

        Page.notifyOnComplete(
            this.state.io( 'gen_pdf', {
                fid : open_folder.id,
                items
            } ).then(
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
