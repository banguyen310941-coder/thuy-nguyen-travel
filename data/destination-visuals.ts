export type DestinationVisual={image:string;alt:string;sourcePage:string};

// Location-specific, high-resolution photography selected from Unsplash pages
// that explicitly identify the pictured destination. Keep homepage and the
// destination directory on this shared source so a place never shows two
// unrelated representative images.
export const DESTINATION_VISUALS:Record<string,DestinationVisual>={
  'Phan Thiết':{
    image:'https://images.unsplash.com/photo-1708959793132-147649cfeb25?auto=format&fit=crop&w=1800&q=88',
    alt:'Đồi cát đỏ Mũi Né, Phan Thiết',
    sourcePage:'https://unsplash.com/photos/two-footprints-in-the-sand-of-a-desert-1B_kXW3VDVQ'
  },
  'Hạ Long':{
    image:'https://images.unsplash.com/photo-1761127138372-cad230082b19?auto=format&fit=crop&w=1800&q=88',
    alt:'Các đảo đá vôi đặc trưng trên Vịnh Hạ Long',
    sourcePage:'https://unsplash.com/photos/limestone-karsts-and-islands-in-ha-long-bay-vietnam-aQNHyIOwFZs'
  },
  'Phú Quốc':{
    image:'https://images.unsplash.com/photo-1514890084135-f16d926f4d03?auto=format&fit=crop&w=1800&q=88',
    alt:'Hoàng hôn trên bãi biển Phú Quốc',
    sourcePage:'https://unsplash.com/photos/seashore-during-golden-hour-H37Wx7-ovHQ'
  },
  'Sa Pa':{
    image:'https://images.unsplash.com/photo-1752127388106-fc3a0595f5b6?auto=format&fit=crop&w=1800&q=88',
    alt:'Ruộng bậc thang và bản làng giữa núi Sa Pa',
    sourcePage:'https://unsplash.com/photos/terraced-rice-fields-with-small-houses-dot-the-landscape-gwxITBKRiZQ'
  },
  'Nha Trang':{
    image:'https://images.unsplash.com/photo-1687025846298-4571496c43f8?auto=format&fit=crop&w=1800&q=88',
    alt:'Biển và Hòn Chồng Nha Trang nhìn ra đảo',
    sourcePage:'https://unsplash.com/photos/a-beach-with-an-island-in-the-distance-kWX3YUV76dk'
  },
  'Sầm Sơn':{
    image:'https://images.unsplash.com/photo-1659025101330-96bd0327fd61?auto=format&fit=crop&w=1800&q=88',
    alt:'Bãi biển Sầm Sơn vào buổi sáng',
    sourcePage:'https://unsplash.com/photos/a-group-of-people-on-a-beach-dY-WBPu0Gi0'
  }
};

export function destinationVisualData(name:string){return DESTINATION_VISUALS[name]||null}
export function destinationVisualUrl(name:string,fallback=''){return destinationVisualData(name)?.image||fallback}
export function destinationVisualAlt(name:string){return destinationVisualData(name)?.alt||name}
