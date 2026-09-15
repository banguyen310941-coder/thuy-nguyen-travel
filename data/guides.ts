export type GuideImage={src:string;alt:string;credit?:string};
export type GuideFaq={q:string;a:string};
export type GuidePost={slug:string;title:string;category:string;excerpt:string;image:string;coverAlt:string;gallery:GuideImage[];date:string;readTime:string;keywords:string[];content:{heading:string;paragraphs:string[]}[];faq:GuideFaq[]};

// Legacy static guide posts were removed because they do not meet the current
// HappyGo SEO publishing standard. All public guide content now comes from CMS.
export const guidePosts:GuidePost[]=[];

export const getGuide=(slug:string)=>guidePosts.find(post=>post.slug===slug);
