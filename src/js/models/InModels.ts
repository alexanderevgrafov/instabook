import * as  _ from 'underscore';
import {Record, Collection, type, predefine, define, definitions, auto, subsetOf} from 'type-r'
import {templates} from '../../templates/all_server'

@define
export class InUser extends Record {
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
export class InImageVersion extends Record {
    @auto width: number;
    @auto height: number;
    @auto url: string;
}

@define
export class InImageVersionCollection extends Collection<InImageVersion> {
    static model = InImageVersion;
    static comparator = 'width';

    url( big = true ) {
        return this.at(big ? this.length - 1 : 0).url;
    };
}

@define
export class InCaption extends Record {
    @auto bit_flags: 0;
    @auto content_type: '';
//        created_at         : type( Timestamp ),
//        created_at_utc     : type( Timestamp ),
//    @auto did_report_as_spam: false;
    @auto has_translation: true;
    @auto media_id: 0;
    @auto pk: 0;
//    @auto share_enabled: false;
    @auto status: 'Active';
    @auto text: '';
    @auto type: 0;
    @auto user_id: 0;
}

@define
export class PostConfig extends Record {
    @auto tmpl0: string;
    @auto tmpl1: string;
    @auto(100) post_font_size: number;
    @auto(0) page_padding: number;
    @auto(false) double_side: boolean;

    initialize(attrs) {
        this.tmpl0 = this.tmpl0 || (_.find(templates.models, function (t: any) {
            return t.type === 'media'
        })).name;
        this.tmpl1 = this.tmpl1 || (_.find(templates.models, function (t: any) {
            return t.type === 'text'
        })).name;
    }
}

@define
class InPicture extends Record {
    @auto versions: InImageVersionCollection;
    @auto type: string;
}

@define
class InMediaCollection extends Collection<InMedia> {
}

@define
export class InMedia extends Record {
    static Collection = InMediaCollection;
    @auto id: '';
    @auto caption: InCaption;
    @auto like_count: 0;
    @auto original_height: 0;
    @auto original_width: 0;
    @auto taken_at: 0;
    @auto user: InUser;
    @auto video_duration: 0;

    @type(InPicture.Collection).as pictures: Collection<InPicture>;

    /*
    can_view_more_preview_comments    : false,
    can_viewer_reshare                : true,
    can_viewer_save                   : true,
    caption_is_edited                 : false,
    client_cache_key                  : '',
    code                              : '',
       @auto comment_count: 0;
    comment_likes_enabled             : true,
    comment_threading_enabled         : true,
       @auto device_timestamp: 0;
    filter_type                       : 0,
    has_audio                         : true,
    has_liked                         : false,
    has_more_comments                 : false,
    has_viewer_saved                  : true,
    inline_composer_display_condition : '',
    is_dash_eligible                  : 1,
    lat                               : 0,
    lng                               : 0,
           likers: (5) [{…}, {…}, {…}, {…}, {…}]
           location: {pk: "213063425", name: "Arambol, Goa, India", address: "", city: "", short_name: "Arambol", …}
            max_num_visible_preview_comments  : 0,
            number_of_qualities               : 1,
            organic_tracking_token            : '',
    photo_of_you                      : false,
    pk                                : '',
    preview_comments                  : [],
    saved_collection_ids              : [ '18023306578072901' ],
       @auto video_codec: '';
    video_dash_manifest: ""
    video_versions: (3) [{…}, {…}, {…}],
       @auto view_count: 0;
    */

    _urls(getBig = true) {
        return this.pictures.map( p=>p.versions.url(getBig));
    }

    get urls(){
        return this._urls(false);
    }

    get hd_urls(){
        return this._urls();
    }

    parse(data) {
        let pics = [];

        if (!data.pictures && data.media_type) {
            switch (data.media_type) {
                case 1:
                    pics.push({type: 1, versions: data.image_versions2.candidates});
                    break;
                case 8:
                    pics = _.map(data.carousel_media, m => ({type: 8, versions: m.image_versions2.candidates}));
                    break;
                case '2':
                    pics.push({type: 2, versions: data.image_versions2.candidates});
                    break;
            }
            data.pictures = pics;
            delete data.media_type;
            delete data.carousel_media_count;
            delete data.carousel_media;
            delete data.image_versions2;
            delete data.media_type;
        }

        return data;
    }
}

@define
export class InPost extends Record {
    @auto media: InMedia;
    @auto(false) is_selected: boolean;
    @type(PostConfig)/*.toJSON(false)*/.as config: PostConfig;

    get post_text() {
        const text = this.media.caption && this.media.caption.text || '--no-caption-in-model--';

        return text.replace(new RegExp(String.fromCharCode(10), 'g'), '<br/>');
    }

    parse(data) {
        data.id = data.media && data.media.id;
        return data;
    }
}

@define
export class InFolder extends Record {
    static idAttribute = 'collection_id';

    @auto collection_id: string;
    @auto collection_media_count: number;
    @auto collection_name: string;
    @auto collection_type: string;
    @auto cover_media: InMedia;
    @type(InPost.Collection).as items: Collection<InPost>;

    get selection() {
        return this.items.filter(x => x.is_selected);
    }
}
