import { Badge, Card, Col, Container, Row } from 'react-bootstrap';
import { Button } from 'ui/Bootstrap';
import React from 'react-type-r';

export const FoldersList = ( { folders, onClick, onBack } ) =>
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

export const FolderListItem = ( { folder, onClick } ) =>
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

export const FolderView = ( { folder, onBack, onPrepare } ) =>
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

export const SquarePicture = ( { urls } ) => {
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

export const Post = ( { item } ) =>
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
