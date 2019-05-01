//import React from 'react-type-r'
import {Record, Collection, type, predefine, define, auto} from 'type-r'

@define
export class InstaUser extends Record {
    static attributes = {
        allowed_commenter_type: '',
        can_boost_post: false,
        can_see_organic_insights: false,
        full_name: '',
        has_anonymous_profile_picture: true,
        is_private: false,
        is_unpublished: false,
        is_verified: false,
        pk: '',
        profile_pic_url: '',
        reel_auto_archive: 'unset',
        show_insights_terms: false,
        username: '',
    }
}

@define
export class InstaImageVersion extends Record {
    static attributes = {
        width: 0,
        height: 0,
        url: ''
    };

    static collection = {
        comparator: 'width',
        small() {
            return this.at(0);
        },
        big() {
            return this.at(1);
        },
        parse(data) {
            return data.candidates
        }
    }
}

@define
export class InstaCaption extends Record {
    static attributes = {
        bit_flags: 0,
        content_type: '',
//        created_at         : type( Timestamp ),
//        created_at_utc     : type( Timestamp ),
        did_report_as_spam: false,
        has_translation: true,
        media_id: 0,
        pk: 0,
        share_enabled: false,
        status: 'Active',
        text: '',
        type: 0,
        user_id: 0
    };
    //
    // parse( data ) {
    //    return data;
    // }
}

@predefine
export class InstaMedia extends Record {
}

InstaMedia.define({
    attributes: {
        id: '',
        image_versions2: InstaImageVersion.Collection,
        media_type: 0,  // 1-Photo, 2 - video  8-carousel
        carousel_media_count: 4,
        carousel_media: InstaMedia.Collection,
        // can_view_more_preview_comments    : false,
        // can_viewer_reshare                : true,
        // can_viewer_save                   : true,
        caption: InstaCaption,
        // caption_is_edited                 : false,
        // client_cache_key                  : '',
        // code                              : '',
        comment_count: 0,
        // comment_likes_enabled             : true,
        // comment_threading_enabled         : true,
        device_timestamp: 0,
        // filter_type                       : 0,
        // has_audio                         : true,
        // has_liked                         : false,
        // has_more_comments                 : false,
        // has_viewer_saved                  : true,
        // inline_composer_display_condition : '',
        // is_dash_eligible                  : 1,
        // lat                               : 0,
        // lng                               : 0,
        like_count: 0,
//        likers: (5) [{…}, {…}, {…}, {…}, {…}]
//        location: {pk: "213063425", name: "Arambol, Goa, India", address: "", city: "", short_name: "Arambol", …}
//         max_num_visible_preview_comments  : 0,
//         number_of_qualities               : 1,
//         organic_tracking_token            : '',
        original_height: 0,
        original_width: 0,
        // photo_of_you                      : false,
        // pk                                : '',
        // preview_comments                  : [],
        // saved_collection_ids              : [ '18023306578072901' ],
        taken_at: 0,
        user: InstaUser,
        video_codec: '',
//video_dash_manifest: ""
        video_duration: 0,
//video_versions: (3) [{…}, {…}, {…}],
        view_count: 0
    },

    quickURL() {
        const small = this.image_versions2.small();

        return small ? small.url : '';
    },

    fullURL() {
        const img = this.image_versions2.big();

        return img ? img.url : '';
    },

//     render() {
//         switch( this.media_type ) {
//             case 1:
//             case 2:
//                 return this.quickURL();
//                 //return <img src={this.quickURL()} style={{ maxWidth : 250, maxHeight : 250 }} className='carousel'/>;
//             case 8:
// //                return <div><h4>Carousel</h4><img src={this.quickURL} style={{ maxWidth : 250, maxHeight : 250 }}/></div>;
//                 return this.carousel_media.map(
//                     media => media.quickURL()//<img src={media.quickURL()} style={{ maxWidth : 120, maxHeight : 120 }} key={media.cid}/>
//                 ).join(', ');
//         }
//     }
});

@define
export class InstaFolderItem extends Record {
    @auto(false) is_selected: boolean;
    @auto media: InstaMedia;

    parse(data) {
        data.id = data.media && data.media.id;
        return data;
    }
}

@define
export class InstaFolder extends Record {
    static idAttribute = 'collection_id';

    @auto collection_id: string;
    @auto collection_media_count: number;
    @auto collection_name: string;
    @auto collection_type: string;
    @auto cover_media: InstaMedia;
    @type(InstaFolderItem.Collection).as items: Collection<InstaFolderItem>;

    get selection() {
        return this.items.filter(x => x.is_selected);
    }
}

/*
@define
export class InstaFolder extends Record {
    static idAttribute = 'collection_id';

    static attributes = {
        collection_id          : '',
        collection_media_count : 0,
        collection_name        : '',
        collection_type        : '',
        cover_media            : InstaMedia,

        items : InstaFolderItem.Collection
    };

    get selection() {
        return this.items.filter( x => x.is_selected );
    }
}
*/
