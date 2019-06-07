import React from 'react-type-r';
import { Record, define, type } from 'type-r';
import { Route, Switch } from 'react-router';
import { Badge, Col, Container, Form, Row } from 'react-bootstrap';
import { _t } from 'app/translate';
import { papers, templates } from 'templates/all_server';
import { Slider } from 'ui/controls/Slider';
import { PreparePage } from './Prepare';
import { FormRow } from 'ui/Controls';
import cx from 'classnames';
import { InPost } from 'models/InModels';
import { json as examplePost } from './ExamplePost'

const PAPER_SIZE = 'a5';

@define
class TmplTesterModel extends Record {
    static attributes = {
        tmpl        : type( String ).has.watcher( 'onTmplChange' ),
        padding     : type( Number ).value( 10 ).has.watcher( 'onPadding' ),
        font_size   : type( Number ).value( 100 ).has.watcher( 'onFontSize' ),
        posts       : InPost.Collection,
        text_length : 100
    };

    onPadding() {
        this.posts.each( post => post.config.page_padding = this.padding );
    }

    onFontSize() {
        this.posts.each( post => post.config.post_font_size = this.font_size );
    }

    /* onPicsCount() {
     }*/

    onTmplChange() {
        localStorage.setItem('tmpl_name', this.tmpl);
        this.posts.each( post => post.config.tmpl0 = this.tmpl );

    }
}

@define
export default class TmplTester extends React.Component {
    static state = TmplTesterModel;

    componentWillMount() {
        this.state.tmpl = localStorage.getItem('tmpl_name') || templates.at( 0 ).name;

        const models =
                  _.map( _.range( 0, 11 ), num => {
                      const model = new InPost();

                      model.set( examplePost, { parse : true } );
                      model.id = num;
                      model.media.pictures.reset( model.media.pictures.slice( 0, num ) );
                      model.config = {
                          tmpl0          : this.state.tmpl,
                          page_padding   : this.state.padding,
                          post_font_size : this.state.font_size
                      };
                      return model;
                  } );

        this.state.posts.reset( models, { merge : true } );
    }

    render() {
        const { state } = this,
              scale     = .5,
              { posts } = state;

        return <Container>
            <Row>
                <Col>
                    <FormRow label='Template'>
                        <Form.ControlLinked as='select' valueLink={state.linkAt( 'tmpl' )}>
                            {templates.map( t => <option value={t.name} key={t.name}>{t.native || t.name}</option> )}
                        </Form.ControlLinked>
                    </FormRow>
                    <FormRow label={'Padding (' + state.padding + ')'}>
                        <Slider valueLink={state.linkAt( 'padding' )} min={0} max={100}/>
                    </FormRow>
                    <FormRow label={'Font size (' + (state.font_size / 100) + 'em)'}>
                        <Slider valueLink={state.linkAt( 'font_size' )} min={20} max={400}/>
                    </FormRow>
                    <FormRow label={'Text length (' + state.text_length + '%)'}>
                        <Slider valueLink={state.linkAt( 'text_length' )} min={0} max={100}/>
                    </FormRow>
                </Col>
            </Row>
            <Row>
                {posts.map( post => {

                        const
                            tmpl0   = templates.get( post.config.tmpl0 ),

                            ThePage = tmpl0 ? tmpl0.page( post, PAPER_SIZE ) : null;

                        return <div className={cx( 'prepare_preview_box', 'admin_tools_preview', PAPER_SIZE )}
                                    style={scale < 1 ? { transform : 'scale(' + scale + ')' } : null} key={post.cid}>
                            <div className='prepare_preview_page side1'>{ThePage}</div>
                        </div>;
                    }
                )}
            </Row>
        </Container>;
    }
}

@define
export default class AdminTools extends React.Component {
    render() {
        return <Switch>
            <Route path='/admin/tmpltest' component={TmplTester}/>
        </Switch>;
    }
}
