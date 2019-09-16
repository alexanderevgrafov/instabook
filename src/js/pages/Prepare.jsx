import { define } from 'type-r';
import React from 'react-mvx';
import Page from 'app/Page';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Button } from 'ui/Bootstrap';
import cx from 'classnames';
import { templates } from 'templates/all_server';
import { Slider } from 'ui/controls/Slider';

const PAPER_SIZE      = 'a5',
      PAGE_BREAK_LINE = '[[pagebreak]]';


@define
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

export const PreparePage = ( { scale, controls, page } ) =>
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
export class PreparePost extends React.Component {
    static state = {
        screen_scale : 1
    };

    componentDidMount() {
        this.props.scale ||
        this.listenTo( Page, 'page-resize', this.onPageResize );
        this.onPageResize();
    }

    onPageResize() {
        const width = this.refs.container ? this.refs.container.offsetWidth : 1000;

        this.state.screen_scale = Math.min( 1, (width) / 279/* 567 */ );
    }

    render() {
        const { post, scale:props_scale } = this.props,
              { screen_scale : state_scale}  = this.state,
              scale = props_scale || state_scale;

        const tmpl0      = templates.get( post.config.tmpl0 ),
              tmpl1      = templates.get( post.config.tmpl1 ),

              PagePhoto  = tmpl0 ? tmpl0.page( post, PAPER_SIZE ) : null,
              PageText   = tmpl1 ? tmpl1.page( post, PAPER_SIZE ) : null;

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
