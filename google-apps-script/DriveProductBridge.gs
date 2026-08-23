/*
 THÚY NGUYÊN TRAVEL - GOOGLE DRIVE PRODUCT BRIDGE

 Mỗi thư mục con của ROOT_FOLDER là 1 sản phẩm.
 Nên có một file Google Docs hoặc thong-tin.txt với dạng:

 Loại: Tour Hàn Quốc
 Tên: Hàn Quốc Seoul - Nami - Everland
 Danh mục: Tour Hàn Quốc
 Giá: 16.990.000đ
 Thời lượng: 5N4Đ
 Khởi hành: Hà Nội
 Hãng bay: Vietjet Air
 Tuyến: Seoul - Nami - Everland
 Tóm tắt: ...
 SEO Title: ...
 Meta Description: ...

 Điểm nổi bật:
 - Seoul
 - Đảo Nami
 - Everland

 Bao gồm:
 - Vé máy bay
 - Khách sạn

 Không bao gồm:
 - Chi phí cá nhân

 Chính sách:
 - Đặt cọc theo lịch khởi hành

 Lịch trình:
 Ngày 1: Việt Nam - Seoul
 Sáng: ...
 Chiều: ...
 Tối: ...
 Bữa ăn: ...

 Ngày 2: Seoul - Nami
 ...

 Có thể đặt product.json trong thư mục để kiểm soát dữ liệu chính xác tuyệt đối.
 Ảnh trong thư mục sẽ tự đưa vào images/gallery.
*/

function doGet(e) {
  try {
    var folderId = (e && e.parameter && e.parameter.folderId) || '';
    if (!folderId) return json_({ok:false,error:'Missing folderId'});
    var root = DriveApp.getFolderById(folderId);
    var items = [];
    var folders = root.getFolders();
    while (folders.hasNext()) {
      try { items.push(scanProductFolder_(folders.next())); }
      catch (err) { items.push({name:'Lỗi đọc thư mục',status:'error',error:String(err)}); }
    }
    return json_({ok:true,folderId:folderId,items:items,scannedAt:new Date().toISOString()});
  } catch (err) {
    return json_({ok:false,error:String(err)});
  }
}

function scanProductFolder_(folder) {
  var files = folder.getFiles();
  var images = [];
  var textParts = [];
  var explicit = null;
  var sourceFiles = [];
  while (files.hasNext()) {
    var f = files.next();
    var mime = f.getMimeType();
    sourceFiles.push({id:f.getId(),name:f.getName(),mimeType:mime,url:f.getUrl()});
    if (/^image\//i.test(mime)) {
      images.push('https://drive.google.com/uc?export=view&id=' + f.getId());
      continue;
    }
    if (f.getName().toLowerCase() === 'product.json' || mime === 'application/json') {
      try { explicit = JSON.parse(f.getBlob().getDataAsString('UTF-8')); } catch (_) {}
      continue;
    }
    if (mime === MimeType.GOOGLE_DOCS) {
      try { textParts.push(DocumentApp.openById(f.getId()).getBody().getText()); } catch (_) {}
      continue;
    }
    if (mime === MimeType.PLAIN_TEXT || /\.txt$/i.test(f.getName())) {
      try { textParts.push(f.getBlob().getDataAsString('UTF-8')); } catch (_) {}
      continue;
    }
    if (mime === MimeType.GOOGLE_SHEETS) {
      try { textParts.push(sheetToText_(f.getId())); } catch (_) {}
    }
  }
  var parsed = parseProductText_(textParts.join('\n\n'));
  var result = merge_({
    driveId:folder.getId(),folderId:folder.getId(),name:folder.getName(),sourceUrl:folder.getUrl(),updatedAt:new Date().toISOString(),
    images:images,gallery:images,cover:images[0] || '',sourceFiles:sourceFiles
  }, parsed);
  if (explicit) result = merge_(result, explicit);
  result.driveId = folder.getId();
  result.folderId = folder.getId();
  result.sourceUrl = folder.getUrl();
  if (!result.cover && images.length) result.cover = images[0];
  if (!result.images || !result.images.length) result.images = images;
  if (!result.gallery || !result.gallery.length) result.gallery = images;
  return result;
}

function sheetToText_(id) {
  var ss = SpreadsheetApp.openById(id);
  var out = [];
  ss.getSheets().forEach(function(sh){
    var values = sh.getDataRange().getDisplayValues();
    values.forEach(function(row){ if (row.join('').trim()) out.push(row.join(': ')); });
  });
  return out.join('\n');
}

function parseProductText_(text) {
  var x = {days:[]};
  if (!text) return x;
  var lines = String(text).replace(/\r/g,'').split('\n');
  var section = '';
  var currentDay = null;
  var sectionMap = {
    'điểm nổi bật':'highlights','diem noi bat':'highlights','bao gồm':'included','bao gom':'included',
    'không bao gồm':'excluded','khong bao gom':'excluded','chính sách':'policies','chinh sach':'policies'
  };
  x.highlights=[];x.included=[];x.excluded=[];x.policies=[];
  lines.forEach(function(raw){
    var line = raw.trim(); if (!line) return;
    var norm = fold_(line.replace(/:$/,''));
    if (sectionMap[norm]) { section=sectionMap[norm]; currentDay=null; return; }
    if (norm === 'lich trinh') { section='itinerary'; currentDay=null; return; }
    var dm = line.match(/^Ngày\s+\d+\s*:\s*(.*)$/i);
    if (dm) { currentDay={title:dm[1]||line,morning:'',afternoon:'',evening:'',meals:''};x.days.push(currentDay);section='itinerary';return; }
    if (section === 'itinerary' && currentDay) {
      var kvDay = line.match(/^(Sáng|Chiều|Tối|Bữa ăn)\s*:\s*(.*)$/i);
      if (kvDay) { var key=fold_(kvDay[1]); if(key==='sang')currentDay.morning=kvDay[2]; else if(key==='chieu')currentDay.afternoon=kvDay[2]; else if(key==='toi')currentDay.evening=kvDay[2]; else currentDay.meals=kvDay[2]; return; }
    }
    if (sectionMap[section] || ['highlights','included','excluded','policies'].indexOf(section)>=0) {
      if (/^[-•✓]/.test(line)) line=line.replace(/^[-•✓]\s*/, '');
      x[section].push(line);return;
    }
    var m = line.match(/^([^:]{2,40})\s*:\s*(.+)$/);
    if (!m) return;
    var key = fold_(m[1]), val=m[2].trim();
    var map={
      'loai':'type','ten':'name','tieu de':'name','danh muc':'category','gia':'price','gia ban':'salePrice','gia tu':'salePrice',
      'thoi luong':'duration','khoi hanh':'departure','khoi hanh tu':'departure','hang bay':'airline','tuyen':'route','dia diem':'place',
      'tom tat':'summary','mo ta':'description','seo title':'seoTitle','meta description':'seoDescription','slug':'slug','noi dung':'content'
    };
    if (map[key]) x[map[key]]=val;
  });
  ['highlights','included','excluded','policies'].forEach(function(k){if(!x[k].length)delete x[k];});
  if (!x.days.length) delete x.days;
  return x;
}

function fold_(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim();}
function merge_(a,b){var o={};Object.keys(a||{}).forEach(function(k){o[k]=a[k];});Object.keys(b||{}).forEach(function(k){if(b[k]!==''&&b[k]!==null&&typeof b[k]!=='undefined')o[k]=b[k];});return o;}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
