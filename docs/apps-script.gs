/**
 * =================================================================
 * HỆ THỐNG QUẢN LÝ DỮ LIỆU THIỆP TỐT NGHIỆP - PHƯƠNG NHÃ
 * Cấu trúc 6 Sheet chuẩn hóa:
 * 1. avatars : uploadTime | cloudinaryImageLink | uploader | status | note
 * 2. songs   : singer | cloudinarySongLink | status | uploadTime
 * 3. photos  : uploadTime | uploader | topic | label | cloudinaryImageLink | priorityLevel
 * 4. views   : visitTime | viewer | role | note
 * 5. confirms: confirmTime | fullName | phone | attendStatus | quantity | message
 * 6. guests  : slug | name | mode | customMessage | customTime | customDate | canUpload
 *
 * 7. devices : slug | deviceId | firstSeen | userAgent   (tự tạo — khoá link tối đa 2 thiết bị)
 *
 * [BỔ SUNG] ADD_GUEST: trang /admin tạo khách mới + link mã hóa (xem mục "C0" trong doPost).
 * [BỔ SUNG] CLAIM_DEVICE / RESET_DEVICES: khoá link theo thiết bị (mục "C1").
 * [BỔ SUNG] KHOÁ BÍ MẬT: Project Settings (bánh răng) → Script Properties → Add property
 *           Property: API_KEY   Value: (giống hệt SHEET_API_KEY trên Vercel)
 *           Khi đã đặt API_KEY, mọi request không kèm đúng khoá đều bị từ chối.
 * Sau khi dán: Deploy → Manage deployments → bút chì → Version: New version → Deploy
 * (giữ nguyên deployment cũ để URL /exec không đổi).
 * =================================================================
 */

// -------------------------------------------------------------
// HELPER 1: Dọn dẹp vĩnh viễn các tab tên cũ (nếu lỡ xuất hiện)
// -------------------------------------------------------------
function cleanLegacySheets(ss) {
  var legacyNames = [
    "NhacNen", "Nhạc Nền", "Nhac Nen",
    "AnhKyNiem", "Ảnh Kỷ Niệm", "Anh Ky Niem",
    "LuotXem", "Lượt Xem", "Luot Xem",
    "XacNhan", "Xác Nhận", "Xac Nhan", "RSVP",
    "KhachMoi", "Khách Mời", "Khach Moi",
    "Avatar"
  ];
  for (var i = 0; i < legacyNames.length; i++) {
    var oldSheet = ss.getSheetByName(legacyNames[i]);
    if (oldSheet && ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(oldSheet);
      } catch (e) {}
    }
  }
}

// -------------------------------------------------------------
// HELPER 2: Chuẩn hóa chuỗi tìm kiếm (không dấu, thường, không cách)
// -------------------------------------------------------------
function normalizeStr(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// -------------------------------------------------------------
// HELPER 3: Tìm chính xác Sheet theo tên
// -------------------------------------------------------------
function findTargetSheet(ss, name) {
  if (!name) return null;
  var target = normalizeStr(name);
  var sheets = ss.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var sName = normalizeStr(sheets[i].getName());
    if (sName === target) return sheets[i];
  }

  var aliasMap = {
    avatars: ["avatar", "anhdaidien", "daidien"],
    songs: ["nhacnen", "nhac", "music", "song"],
    photos: ["anhkyniem", "photo", "kyniem", "anh"],
    views: ["luotxem", "view", "viewer"],
    confirms: ["xacnhan", "rsvp", "confirm"],
    guests: ["khachmoi", "guest", "danhsachkhach"]
  };

  for (var key in aliasMap) {
    if (target === key || aliasMap[key].indexOf(target) !== -1) {
      for (var j = 0; j < sheets.length; j++) {
        var currentNorm = normalizeStr(sheets[j].getName());
        if (currentNorm === key || aliasMap[key].indexOf(currentNorm) !== -1) {
          return sheets[j];
        }
      }
    }
  }

  return null;
}

// -------------------------------------------------------------
// HELPER 4: Định dạng dữ liệu ô an toàn (tránh lỗi Date của Google)
// -------------------------------------------------------------
function formatCellValue(val) {
  if (val === null || val === undefined) return "";
  if (val instanceof Date) {
    try {
      if (!isNaN(val.getTime())) {
        return Utilities.formatDate(val, "GMT+7", "dd/MM/yyyy HH:mm:ss");
      }
    } catch (e) {
      return String(val);
    }
  }
  return String(val).trim();
}

// -------------------------------------------------------------
// HELPER 5 [BỔ SUNG]: Trả JSON
// -------------------------------------------------------------
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// HELPER 5b [BỔ SUNG]: Kiểm tra khoá bí mật (Script Properties → API_KEY)
//  - Chưa đặt API_KEY -> không kiểm tra (tương thích ngược).
// -------------------------------------------------------------
function checkApiKey(provided) {
  var expected = PropertiesService.getScriptProperties().getProperty("API_KEY");
  if (!expected) return true;
  return String(provided || "") === String(expected);
}

// -------------------------------------------------------------
// HELPER 7 [BỔ SUNG]: Ghi nhận thiết bị mở link (tối đa data.max, mặc định 2)
//  Chạy trong khoá (LockService) để 2 thiết bị mở cùng lúc không vượt giới hạn.
//  Trả về { allowed: true|false, count }.
// -------------------------------------------------------------
function getDevicesSheet(ss) {
  var sh = findTargetSheet(ss, "devices");
  if (!sh) {
    sh = ss.insertSheet("devices");
    sh.appendRow(["slug", "deviceId", "firstSeen", "userAgent"]);
    sh.getRange(1, 1, 1, 4).setFontWeight("bold");
  }
  return sh;
}

function claimDevice(ss, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = getDevicesSheet(ss);
    var slug = normalizeStr(data.slug);
    var dev = String(data.deviceId || "").trim();
    if (!slug || !dev) return jsonOut({ status: "error", message: "Thiếu slug hoặc deviceId" });
    var max = Number(data.max) || 2;

    var known = {};
    var last = sh.getLastRow();
    if (last > 1) {
      var vals = sh.getRange(2, 1, last - 1, 2).getValues();
      for (var i = 0; i < vals.length; i++) {
        if (normalizeStr(vals[i][0]) === slug) known[String(vals[i][1]).trim()] = true;
      }
    }
    var count = Object.keys(known).length;

    if (known[dev]) return jsonOut({ status: "success", allowed: true, count: count });
    if (count >= max) return jsonOut({ status: "success", allowed: false, count: count });

    var row = sh.getLastRow() + 1;
    var range = sh.getRange(row, 1, 1, 4);
    range.setNumberFormat("@");
    range.setValues([[slug, dev, String(data.firstSeen || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss")), String(data.userAgent || "")]]);
    return jsonOut({ status: "success", allowed: true, count: count + 1 });
  } finally {
    lock.releaseLock();
  }
}

// HELPER 8 [BỔ SUNG]: Mở khoá link — xoá mọi thiết bị đã ghi nhận của slug
function resetDevices(ss, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = findTargetSheet(ss, "devices");
    var slug = normalizeStr(data.slug);
    if (!sh || !slug) return jsonOut({ status: "success", removed: 0 });
    var last = sh.getLastRow();
    var removed = 0;
    if (last > 1) {
      var vals = sh.getRange(2, 1, last - 1, 1).getValues();
      for (var i = vals.length - 1; i >= 0; i--) {
        if (normalizeStr(vals[i][0]) === slug) {
          sh.deleteRow(i + 2);
          removed++;
        }
      }
    }
    return jsonOut({ status: "success", removed: removed });
  } finally {
    lock.releaseLock();
  }
}

// -------------------------------------------------------------
// HELPER 6a: Nhận diện cột do ARRAYFORMULA tự điền (công thức đặt ở dòng 1 hoặc 2)
// -------------------------------------------------------------
function isArrayFormula(f) {
  return /ARRAYFORMULA\s*\(/i.test(String(f || ""));
}

function arrayFormulaColumns(sheet, n) {
  var rows = Math.min(2, sheet.getMaxRows());
  var fs = sheet.getRange(1, 1, rows, n).getFormulas();
  var out = [];
  for (var c = 0; c < n; c++) {
    out[c] = false;
    for (var r = 0; r < fs.length; r++) if (isArrayFormula(fs[r][c])) out[c] = true;
  }
  return out;
}

// -------------------------------------------------------------
// HELPER 6 [BỔ SUNG]: Thêm khách mới vào tab "guests" (từ trang /admin)
//  - Dò cột theo tiêu đề hàng 1 (slug | name | mode | customMessage | customTime | customDate | canUpload)
//  - Ghi cả dòng ở dạng CHỮ (@) để Sheet không tự đổi "04/12/2026" thành ngày tháng
//    (tránh lệch múi giờ / đảo ngày-tháng) và không biến mã như "2e345678" thành số.
//  - Không cho trùng slug.
// -------------------------------------------------------------
function addGuestRow(ss, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = findTargetSheet(ss, "guests");
    if (!sheet) {
      sheet = ss.insertSheet("guests");
      sheet.appendRow(["slug", "name", "mode", "customMessage", "customTime", "customDate", "canUpload"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
    }

    var slug = String(data.slug || "").trim();
    var name = String(data.name || data.guestName || "").trim();
    if (!slug || !name) {
      return jsonOut({ status: "error", message: "Thiếu slug hoặc tên khách" });
    }

    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return normalizeStr(h); });
    // Chỉ ghi tới cột tiêu đề cuối cùng (không đụng vào các cột trống / ghi chú bên phải)
    while (headers.length && !headers[headers.length - 1]) headers.pop();

    // Chống trùng slug
    var slugColIdx = headers.indexOf("slug");
    var nameColIdx = headers.indexOf("name");
    var lastRow = sheet.getLastRow();

    // Dòng cuối THỰC SỰ có dữ liệu khách (theo cột slug/name), không dùng getLastRow()
    // vì getLastRow() tính cả ô lạc ở cột/dòng xa -> khách mới bị ghi xuống tận dưới.
    var keyCol = slugColIdx !== -1 ? slugColIdx : (nameColIdx !== -1 ? nameColIdx : 0);
    var lastDataRow = 1;
    if (lastRow > 1) {
      var keyVals = sheet.getRange(2, keyCol + 1, lastRow - 1, 1).getValues();
      for (var k = keyVals.length - 1; k >= 0; k--) {
        if (String(keyVals[k][0]).trim() !== "") { lastDataRow = k + 2; break; }
      }
    }

    if (slugColIdx !== -1 && lastRow > 1) {
      var slugs = sheet.getRange(2, slugColIdx + 1, lastRow - 1, 1).getValues();
      var target = normalizeStr(slug);
      for (var r = 0; r < slugs.length; r++) {
        if (normalizeStr(slugs[r][0]) === target) {
          return jsonOut({ status: "error", message: "Mã link đã tồn tại" });
        }
      }
    }

    var values = {
      slug: slug,
      name: name,
      mode: String(data.mode || data.role || "friend"),
      custommessage: String(data.customMessage || ""),
      customtime: String(data.customTime || ""),
      customdate: String(data.customDate || ""),
      canupload: String(data.canUpload === "false" || data.canUpload === false ? "false" : "true"),
      specialphoto: ""
      // KHÔNG ghi cột link: Sheet tự tạo link từ slug bằng ARRAYFORMULA ở H2
    };

    var row = headers.map(function (h) {
      return values.hasOwnProperty(h) ? values[h] : "";
    });

    // Ngày: ghi thành GIÁ TRỊ NGÀY THẬT, không ghi chữ "04/12/2026".
    // Cột customDate của bảng (Table) có kiểu Ngày + Sheet đang dùng locale Mỹ (tháng/ngày)
    // -> chữ "04/12/2026" bị hiểu thành 12 tháng 4. Tạo Date từ ngày/tháng/năm thì không thể nhầm.
    // (12 giờ trưa để đổi múi giờ thế nào cũng không lệch sang ngày khác)
    var dateColIdx = headers.indexOf("customdate");
    var dm = String(values.customdate).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dateColIdx !== -1 && dm) {
      row[dateColIdx] = new Date(+dm[3], +dm[2] - 1, +dm[1], 12, 0, 0);
    }

    var newRow = lastDataRow + 1;
    var n = row.length;
    var range = sheet.getRange(newRow, 1, 1, n);

    // Giữ CÔNG THỨC của Sheet: cột nào ở dòng khách phía trên là công thức (vd cột link)
    // thì dòng mới chép công thức đó xuống (R1C1 tự đổi tham chiếu theo dòng), không ghi giá trị cứng.
    var prevFormulas = [], prevFormats = [];
    if (lastDataRow >= 2) {
      var prevRange = sheet.getRange(lastDataRow, 1, 1, n);
      prevFormulas = prevRange.getFormulasR1C1()[0];
      prevFormats = prevRange.getNumberFormats()[0];
    }
    var curFormulas = range.getFormulasR1C1()[0];
    var arrayCols = arrayFormulaColumns(sheet, n);
    var formulaAt = [];
    var formats = [];
    for (var c = 0; c < n; c++) {
      formulaAt[c] = curFormulas[c] || prevFormulas[c] || "";
      if (arrayCols[c] || isArrayFormula(formulaAt[c])) {
        // Cột do ARRAYFORMULA tự điền (vd cột link) -> để TRỐNG, ghi gì vào cũng làm công thức báo #REF!
        formulaAt[c] = "";
        formats[c] = prevFormats[c] || "General";
        row[c] = "";
      } else if (formulaAt[c]) {
        formats[c] = prevFormats[c] || "General";
        row[c] = "";
      } else if (c === dateColIdx && dm) {
        formats[c] = "dd/MM/yyyy";
      } else {
        formats[c] = "@";
      }
    }

    range.setNumberFormats([formats]);
    range.setValues([row]);
    for (var f = 0; f < n; f++) {
      if (formulaAt[f]) sheet.getRange(newRow, f + 1).setFormulaR1C1(formulaAt[f]);
    }

    return jsonOut({ status: "success", slug: slug, row: newRow });
  } finally {
    lock.releaseLock();
  }
}

// =================================================================
// 1. HÀM ĐỌC DỮ LIỆU (GET)
// =================================================================
function doGet(e) {
  try {
    // [BỔ SUNG] Chỉ server (biết khoá) mới đọc được dữ liệu
    if (!checkApiKey(e && e.parameter && e.parameter.key)) {
      return jsonOut({ error: "unauthorized" });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    cleanLegacySheets(ss);

    var sheetParam = e && e.parameter && (e.parameter.sheet || e.parameter.tab || e.parameter.name);
    var action = e && e.parameter && e.parameter.action;

    // [CHẨN ĐOÁN] ?action=where&slug=xxx -> file, tab, số dòng thật của khách (chỉ đọc)
    if (action === "where") {
      var gs = findTargetSheet(ss, "guests");
      var info = {
        file: ss.getName(),
        url: ss.getUrl(),
        tabs: ss.getSheets().map(function (s) { return s.getName(); }),
        guestTab: gs ? gs.getName() : null,
        lastRow: gs ? gs.getLastRow() : 0,
        lastColumn: gs ? gs.getLastColumn() : 0,
        found: []
      };
      var want = normalizeStr(e.parameter.slug || "");
      if (gs && want) {
        var tf = gs.createTextFinder(String(e.parameter.slug)).matchEntireCell(true).findAll();
        for (var t = 0; t < tf.length; t++) info.found.push(tf[t].getA1Notation());
      }
      return jsonOut(info);
    }

    if (!sheetParam && action) {
      var actNorm = normalizeStr(action);
      if (actNorm.indexOf("avatar") !== -1) sheetParam = "avatars";
      else if (actNorm.indexOf("music") !== -1 || actNorm.indexOf("song") !== -1) sheetParam = "songs";
      else if (actNorm.indexOf("photo") !== -1) sheetParam = "photos";
      else if (actNorm.indexOf("guest") !== -1) sheetParam = "guests";
      else if (actNorm.indexOf("rsvp") !== -1 || actNorm.indexOf("confirm") !== -1) sheetParam = "confirms";
      else if (actNorm.indexOf("view") !== -1) sheetParam = "views";
    }

    if (!sheetParam) {
      sheetParam = "photos";
    }

    var sheet = findTargetSheet(ss, sheetParam);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = data[0];
    var rows = [];

    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      var isEmpty = true;

      for (var j = 0; j < headers.length; j++) {
        var headerKey = String(headers[j]).trim();
        if (!headerKey) continue;
        var cellVal = formatCellValue(data[i][j]);
        if (cellVal !== "") isEmpty = false;
        rowObj[headerKey] = cellVal;
      }

      if (!isEmpty) {
        rows.push(rowObj);
      }
    }

    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =================================================================
// 2. HÀM GHI & ĐỒNG BỘ DỮ LIỆU (POST)
// =================================================================
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    cleanLegacySheets(ss);

    var rawContents = e.postData && e.postData.contents ? e.postData.contents : "{}";
    var data = JSON.parse(rawContents);

    // [BỔ SUNG] Chỉ server (biết khoá) mới ghi được dữ liệu
    if (!checkApiKey(data.apiKey)) {
      return jsonOut({ status: "error", message: "unauthorized" });
    }

    var type = String(data.type || data.action || "").toUpperCase();
    var sheetTargetName = data.sheet || "";

    // -------------------------------------------------------------
    // A. NHẠC NỀN -> CHỈ LƯU TAB "songs" (Có chống trùng link nhạc)
    // -------------------------------------------------------------
    if (type === "SAVE_MUSIC" || normalizeStr(sheetTargetName) === "songs" || normalizeStr(sheetTargetName) === "nhacnen") {
      var sheetMusic = findTargetSheet(ss, "songs") || ss.insertSheet("songs");
      if (sheetMusic.getLastRow() === 0) {
        sheetMusic.appendRow(["singer", "cloudinarySongLink", "status", "uploadTime"]);
        sheetMusic.getRange(1, 1, 1, 4).setFontWeight("bold");
      }

      var singer = data.singer || (data.songTitle ? data.songTitle : (data.title || "Cloudinary Upload"));
      var songLink = data.cloudinarySongLink || data.url || "";
      var upTime = data.uploadTime || data.timestamp || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");

      var lastR_music = sheetMusic.getLastRow();
      var foundMusicRow = -1;

      if (lastR_music > 1) {
        var musicCol = sheetMusic.getRange(2, 2, lastR_music - 1, 1).getValues();
        sheetMusic.getRange(2, 3, lastR_music - 1, 1).setValue("FALSE");

        var cleanTargetMusic = String(songLink).trim().toLowerCase();
        for (var m = 0; m < musicCol.length; m++) {
          if (String(musicCol[m][0]).trim().toLowerCase() === cleanTargetMusic && cleanTargetMusic !== "") {
            foundMusicRow = m + 2;
            break;
          }
        }
      }

      if (foundMusicRow > 1) {
        sheetMusic.getRange(foundMusicRow, 1).setValue(singer);
        sheetMusic.getRange(foundMusicRow, 3).setValue("TRUE");
        sheetMusic.getRange(foundMusicRow, 4).setValue(upTime);
      } else {
        sheetMusic.appendRow([singer, songLink, "TRUE", upTime]);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu vào songs" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // B. ẢNH ĐẠI DIỆN -> CHỈ LƯU TAB "avatars" (Có chống trùng link ảnh)
    // -------------------------------------------------------------
    if (type === "AVATAR_UPLOAD" || normalizeStr(sheetTargetName) === "avatars" || normalizeStr(sheetTargetName) === "avatar") {
      var sheetAvt = findTargetSheet(ss, "avatars") || ss.insertSheet("avatars");
      if (sheetAvt.getLastRow() === 0) {
        sheetAvt.appendRow(["uploadTime", "cloudinaryImageLink", "uploader", "status", "note"]);
        sheetAvt.getRange(1, 1, 1, 5).setFontWeight("bold");
      }

      var avtTime = data.uploadTime || data.timestamp || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      var avtLink = data.cloudinaryImageLink || data.photoUrl || data.url || "";
      var avtUploader = data.uploader || data.name || "Phương Nhã";
      var avtNote = data.note || data.caption || "Ảnh đại diện bìa thiệp chính thức";

      var lastR_avt = sheetAvt.getLastRow();
      var foundAvtRow = -1;

      if (lastR_avt > 1) {
        var linkColData = sheetAvt.getRange(2, 2, lastR_avt - 1, 1).getValues();
        sheetAvt.getRange(2, 4, lastR_avt - 1, 1).setValue("FALSE");

        var cleanTargetLink = String(avtLink).trim().toLowerCase();
        for (var k = 0; k < linkColData.length; k++) {
          var existingLink = String(linkColData[k][0]).trim().toLowerCase();
          if (existingLink === cleanTargetLink && cleanTargetLink !== "") {
            foundAvtRow = k + 2;
            break;
          }
        }
      }

      if (foundAvtRow > 1) {
        sheetAvt.getRange(foundAvtRow, 1).setValue(avtTime);
        sheetAvt.getRange(foundAvtRow, 4).setValue("TRUE");
      } else {
        sheetAvt.appendRow([avtTime, avtLink, avtUploader, "TRUE", avtNote]);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã kích hoạt ảnh đại diện" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // C0. [BỔ SUNG] THÊM KHÁCH MỚI (trang /admin) -> TAB "guests"
    //     PHẢI đặt TRƯỚC mục C, vì mục C bắt mọi request có slug + sheet "guests".
    // -------------------------------------------------------------
    if (type === "ADD_GUEST") {
      return addGuestRow(ss, data);
    }

    // -------------------------------------------------------------
    // C1. [BỔ SUNG] KHOÁ LINK THEO THIẾT BỊ -> TAB "devices"
    //     Cũng phải đặt TRƯỚC mục C (request có slug).
    // -------------------------------------------------------------
    if (type === "CLAIM_DEVICE") {
      return claimDevice(ss, data);
    }
    if (type === "RESET_DEVICES") {
      return resetDevices(ss, data);
    }

    // -------------------------------------------------------------
    // C. CẬP NHẬT ẢNH CHO DÒNG KHÁCH MỜI (guests)
    // -------------------------------------------------------------
    if (type === "AVATAR_UPDATE" || (data.slug && normalizeStr(sheetTargetName) === "guests")) {
      var sheetGuests = findTargetSheet(ss, "guests");
      if (sheetGuests) {
        var gData = sheetGuests.getDataRange().getValues();
        var gHeaders = gData[0].map(function(h) { return normalizeStr(h); });
        var slugColIdx = gHeaders.indexOf("slug");
        var photoColIdx = gHeaders.indexOf("specialphoto");
        if (photoColIdx === -1) photoColIdx = gHeaders.indexOf("cloudinaryimagelink");

        var targetSlug = normalizeStr(data.slug || "phuongnha");
        var targetPhoto = data.specialPhoto || data.cloudinaryImageLink || data.photoUrl || "";

        if (slugColIdx !== -1 && photoColIdx !== -1 && targetPhoto) {
          for (var r = 1; r < gData.length; r++) {
            if (normalizeStr(gData[r][slugColIdx]) === targetSlug) {
              sheetGuests.getRange(r + 1, photoColIdx + 1).setValue(targetPhoto);
              break;
            }
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // D. LƯỢT MỞ THIỆP -> CHỈ LƯU TAB "views"
    // -------------------------------------------------------------
    if (type === "OPEN" || normalizeStr(sheetTargetName) === "views" || normalizeStr(sheetTargetName) === "luotxem") {
      var sheetViews = findTargetSheet(ss, "views") || ss.insertSheet("views");
      if (sheetViews.getLastRow() === 0) {
        sheetViews.appendRow(["visitTime", "viewer", "role", "note"]);
        sheetViews.getRange(1, 1, 1, 4).setFontWeight("bold");
      }

      var vTime = data.visitTime || data.timestamp || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      var vViewer = data.viewer || data.name || "Khách mời";
      var vRole = data.role || data.mode || "Bạn bè";
      var vNote = data.note || data.message || "Khách mở thiệp";

      sheetViews.appendRow([vTime, vViewer, vRole, vNote]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // E. XÁC NHẬN THAM DỰ -> CHỈ LƯU TAB "confirms"
    // -------------------------------------------------------------
    if (type === "RSVP" || normalizeStr(sheetTargetName) === "confirms" || normalizeStr(sheetTargetName) === "xacnhan") {
      var sheetConfirms = findTargetSheet(ss, "confirms") || ss.insertSheet("confirms");
      if (sheetConfirms.getLastRow() === 0) {
        sheetConfirms.appendRow(["confirmTime", "fullName", "phone", "attendStatus", "quantity", "message"]);
        sheetConfirms.getRange(1, 1, 1, 6).setFontWeight("bold");
      }

      var cTime = data.confirmTime || data.timestamp || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      var cName = data.fullName || data.guestName || data.name || "";
      var cPhone = data.phone || data.phoneNumber || "";
      var cStatus = data.attendStatus || data.attending || "Có";
      var isAttending = normalizeStr(cStatus) === "co" || normalizeStr(cStatus) === "yes" || normalizeStr(cStatus) === "true";

      // Tính tổng số lượng tham gia:
      // - Nếu tham dự và không ai đi cùng (hoặc chưa truyền) -> quantity = 1
      // - Nếu có người đi cùng -> quantity = tổng số người
      // - Nếu không tham dự -> quantity = 0
      var cQuantity = 0;
      if (isAttending) {
        var rawQty = data.quantity !== undefined ? data.quantity : (data.guestCount !== undefined ? data.guestCount : data.guests);
        var numQty = Number(rawQty);
        if (!isNaN(numQty) && numQty >= 1) {
          cQuantity = numQty;
        } else if (data.accompanyingGuests !== undefined && !isNaN(Number(data.accompanyingGuests))) {
          cQuantity = 1 + Number(data.accompanyingGuests);
        } else {
          cQuantity = 1; // Mặc định khách đi 1 mình
        }
      } else {
        cQuantity = 0;
      }

      var cMsg = data.message || "";

      sheetConfirms.appendRow([cTime, cName, cPhone, cStatus, cQuantity, cMsg]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // F. ĐÓNG GÓP ẢNH KỶ NIỆM -> CHỈ LƯU TAB "photos" (Có chống trùng link ảnh)
    // -------------------------------------------------------------
    if (type === "PHOTO_UPLOAD" || normalizeStr(sheetTargetName) === "photos" || normalizeStr(sheetTargetName) === "anhkyniem") {
      var sheetPhotos = findTargetSheet(ss, "photos") || ss.insertSheet("photos");
      if (sheetPhotos.getLastRow() === 0) {
        sheetPhotos.appendRow(["uploadTime", "uploader", "topic", "label", "cloudinaryImageLink", "priorityLevel"]);
        sheetPhotos.getRange(1, 1, 1, 6).setFontWeight("bold");
      }

      var pTime = data.uploadTime || data.timestamp || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      var pUploader = data.uploader || data.name || "Khách mời";
      var pTopic = data.topic || data.category || "";
      var pLabel = data.label || data.caption || "Ảnh kỷ niệm cùng Nhã";
      var pLink = data.cloudinaryImageLink || data.photoUrl || "";
      var pPriority = data.priorityLevel !== undefined ? data.priorityLevel : (data.priority || 1);

      var lastR_photos = sheetPhotos.getLastRow();
      var foundPhotoRow = -1;

      if (lastR_photos > 1) {
        var photoColData = sheetPhotos.getRange(2, 5, lastR_photos - 1, 1).getValues();
        var cleanTargetPhoto = String(pLink).trim().toLowerCase();
        for (var p = 0; p < photoColData.length; p++) {
          if (String(photoColData[p][0]).trim().toLowerCase() === cleanTargetPhoto && cleanTargetPhoto !== "") {
            foundPhotoRow = p + 2;
            break;
          }
        }
      }

      if (foundPhotoRow > 1) {
        sheetPhotos.getRange(foundPhotoRow, 1).setValue(pTime);
        sheetPhotos.getRange(foundPhotoRow, 2).setValue(pUploader);
        sheetPhotos.getRange(foundPhotoRow, 3).setValue(pTopic);
        sheetPhotos.getRange(foundPhotoRow, 4).setValue(pLabel);
        sheetPhotos.getRange(foundPhotoRow, 6).setValue(pPriority);
      } else {
        sheetPhotos.appendRow([pTime, pUploader, pTopic, pLabel, pLink, pPriority]);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
// =================================================================
// [CHẠY TAY 1 LẦN] SỬA TAB "guests" SAU KHI TRANG ADMIN GHI VÀO
//  1. Cột do ARRAYFORMULA tự điền (vd cột link: công thức ở H2):
//     XOÁ mọi ô bên dưới công thức (giá trị cứng / công thức chép xuống gây #REF!)
//     -> ARRAYFORMULA tự điền lại link cho TẤT CẢ khách.
//  2. Cột công thức thường (không phải ARRAYFORMULA): dòng khách nào thiếu -> chép từ dòng mẫu.
//  3. customDate đang là CHỮ "dd/MM/yyyy" -> đổi thành ngày thật.
//  Cách chạy: chọn hàm fixGuestRowsBelow ở thanh trên của Apps Script → Run → xem Execution log.
// =================================================================
function fixGuestRowsBelow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = findTargetSheet(ss, "guests");
  if (!sheet) { Logger.log("Không tìm thấy tab guests"); return; }

  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return normalizeStr(h); });
  while (headers.length && !headers[headers.length - 1]) headers.pop();
  var n = headers.length;
  var slugCol = headers.indexOf("slug");
  var dateCol = headers.indexOf("customdate");
  var lastRow = sheet.getLastRow();
  if (slugCol === -1 || lastRow < 3) { Logger.log("Không có gì để sửa"); return; }

  // 1. Dọn cột ARRAYFORMULA
  var head = sheet.getRange(1, 1, 2, n).getFormulas();
  for (var c0 = 0; c0 < n; c0++) {
    var fRow = isArrayFormula(head[0][c0]) ? 1 : (isArrayFormula(head[1][c0]) ? 2 : 0);
    if (!fRow || lastRow <= fRow) continue;
    sheet.getRange(fRow + 1, c0 + 1, lastRow - fRow, 1).clearContent();
    Logger.log("Đã dọn cột " + headers[c0] + " từ dòng " + (fRow + 1) + " -> ARRAYFORMULA tự điền lại");
  }
  SpreadsheetApp.flush();
  var arrayCols = arrayFormulaColumns(sheet, n);

  var all = sheet.getRange(2, 1, lastRow - 1, n);
  var vals = all.getValues();
  var formulas = all.getFormulasR1C1();

  // 2. Dòng mẫu = dòng khách cuối cùng có công thức thường
  var tpl = -1;
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][slugCol]).trim() === "") continue;
    for (var k = 0; k < n; k++) {
      if (!arrayCols[k] && formulas[i][k] && !isArrayFormula(formulas[i][k])) { tpl = i; break; }
    }
  }
  var tplFormulas = tpl === -1 ? [] : formulas[tpl];
  var tplFormats = tpl === -1 ? [] : sheet.getRange(tpl + 2, 1, 1, n).getNumberFormats()[0];
  var fixed = 0;

  for (var r = 0; r < vals.length; r++) {
    if (String(vals[r][slugCol]).trim() === "") continue;
    var sheetRow = r + 2;
    var changed = false;

    if (tpl !== -1 && r > tpl) {
      for (var c = 0; c < n; c++) {
        var tf = tplFormulas[c];
        if (tf && !arrayCols[c] && !isArrayFormula(tf) && !formulas[r][c]) {
          var cell = sheet.getRange(sheetRow, c + 1);
          cell.setNumberFormat(tplFormats[c] || "General");
          cell.setFormulaR1C1(tf);
          changed = true;
        }
      }
    }

    // 3. Ngày dạng chữ -> ngày thật
    if (dateCol !== -1 && !formulas[r][dateCol] && !(vals[r][dateCol] instanceof Date)) {
      var dm = String(vals[r][dateCol]).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dm) {
        var dc = sheet.getRange(sheetRow, dateCol + 1);
        dc.setNumberFormat("dd/MM/yyyy");
        dc.setValue(new Date(+dm[3], +dm[2] - 1, +dm[1], 12, 0, 0));
        changed = true;
      }
    }

    if (changed) {
      fixed++;
      Logger.log("Đã sửa dòng " + sheetRow + " (" + vals[r][slugCol] + ")");
    }
  }
  Logger.log("Xong · số dòng sửa thêm: " + fixed);
}

// =================================================================
// HÀM NẠP TỰ ĐỘNG TOÀN BỘ LỜI CHÚC MỚI VÀO SHEET "guests"
// =================================================================
function updateAllGuestCustomMessages() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = findTargetSheet(ss, "guests");
  if (!sheet) {
    Logger.log("Không tìm thấy sheet guests!");
    return;
  }

  var newMessages = {
    "phuongnha": "Hành trình 4 năm đại học cuối cùng cũng đã khép lại trọn vẹn. Cảm ơn bản thân vì đã luôn nỗ lực không ngừng nghỉ, và biết ơn gia đình, thầy cô cùng tất cả những người bạn tuyệt vời đã luôn đồng hành bên Nhã! ✨🎓",
    "giabao": "Gia Bảo ơi! Qua dự lễ tốt nghiệp và chụp cùng tui vài kiểu ảnh kỷ niệm nhen 🥹 Chớp mắt một cái là tụi mình đã đi hết 4 năm đại học rồi. Bạn bè thì nhiều nhưng tri kỷ cùng đồng hành chẳng có mấy ai. Ngày đặc biệt này có mặt m thì niềm vui của t mới trọn vẹn được á! Hẹn gặp m nhaaa 🤍🎓",
    "thaovan": "Thảo Vân ơi, ngày trọng đại của t nhất định m phải có mặt đó nha 🥹 Cảm ơn m suốt những năm tháng qua luôn là người bạn đồng hành số một, chở t đi khắp nơi không ngại nắng mưa. Nhẩm lại tụi mình quen nhau cũng gần 10 năm rồi đó má, nhanh ghê luôn! Bạn thân cả đời đếm trên đầu ngón tay thôi nên hôm tốt nghiệp phải cùng t chụp thật nhiều tấm hình kỷ niệm nhen 🤍 T tốt nghiệp xong đi làm giàu là m chuẩn bị làm tài xế VIP của t đó nhen =))) Hẹn m nhaaa ✨🎓",
    "nhuquynh": "Quỳnh ơiii, qua chung vui tốt nghiệp và chụp hình với t nhaaa 🥹 Thoắt cái là hết 4 năm đại học rồi, không biết kịp hít thở không khí dân IT bao lâu hay lại nhận lệnh lên đường phục vụ Tổ quốc nữa =))) Nên hôm nay có dịp là phải chụp lưu niệm cho đã nhen! Lỡ t đi NVQS thiệt thì m ở ngoài ráng cày lên sếp bự, đợi t về dắt t apply ké chứ 2 năm không gõ code chắc quên hết trơn haha. Nhất định phải qua với t nhen 🤍✨",
    "nhutquang": "Nhựt Quang ơii! Ngày t chính thức nhận bằng kỹ sư m không qua là giận thiệt không thèm nhìn mặt luôn đó nha 😤 Đùa chứ 4 năm đại học trôi qua lẹ quá, có m chung vui chụp tấm hình kỷ niệm thì mới trọn vẹn được. Sắp xếp thời gian qua với t nha người anh em ơi! 🎓📸",
    "myxuyen": "Anh Xuyên ơi! Hôm tốt nghiệp của em, anh nhớ ghé qua trường chung vui và chụp cùng em vài tấm hình kỷ niệm thật đẹp nhaaa 🎓✨ Ngày quan trọng này có anh đến chung vui là em quý và vui lắm luôn á!",
    "huutri": "Hữu Trí ơi! Ngày Nhã tốt nghiệp, Trí nhớ sắp xếp qua trường chụp với Nhã vài bức hình lưu niệm nhen 🥹 Bạn bè ở đây cũng không có nhiều, có Trí đến chung vui và sẻ chia khoảnh khắc này cùng Nhã thì quý giá biết bao. Hẹn gặp Trí hôm đó nhaaa! ✨🎓",
    "tanthanh": "Tấn Thành ơii! Ngày lễ tốt nghiệp của anh, em nhớ qua trường chụp ảnh kỷ niệm với anh nhen 🥹 4 năm đại học cuối cùng cũng cán đích rồi, có em ghé chung vui là ngày hôm đó thêm rực rỡ và ý nghĩa hơn bao giờ hết luôn á. Nhất định phải qua đó nhaaa! 🎓🤍",
    "minhkhoi": "Pỏm ơii! Ngày t nhận bằng tốt nghiệp m nhớ sắp xếp qua trường chụp với t vài tấm ảnh kỷ niệm nhen 📸✨ 4 năm thanh xuân trôi qua nhanh như một cái chớp mắt, ngày này có m cùng chung vui và ghi lại khoảnh khắc là vui hết sảy luôn á. Hẹn gặp m nhaaa!",
    "tuankiet": "Kiệt ơi! Hôm lễ tốt nghiệp của Nhã, Kiệt nhớ ghé trường cùng chung vui và chụp với Nhã mấy kiểu ảnh kỷ niệm nhen 🎓✨ Bao nhiêu năm nỗ lực mới có ngày này, có Kiệt đến chia vui là Nhã trân quý và vui lắm luôn á. Hẹn gặp Kiệt hôm đó nha!",
    "hien": "Minh Hiển ơi! Ngày Nhã chính thức nhận bằng tốt nghiệp, Hiển nhớ dành chút thời gian ghé qua trường chụp với Nhã vài tấm hình kỷ niệm nha 📸✨ Có bạn bè thân thiết đến chung vui trong ngày này thì khoảnh khắc tốt nghiệp mới thật sự trọn vẹn. Rất mong được đón tiếp Hiển nhen!",
    "nhuy": "Ý ơi! Ngày lễ tốt nghiệp của Nhã, Ý nhớ ghé qua trường chung vui và chụp cùng Nhã những tấm hình kỷ niệm thật xinh xắn nhaaa 🎓🌸 Sau bao nhiêu năm tháng miệt mài học tập, có Ý cùng chia sẻ niềm vui trong ngày đặc biệt này là Nhã quý lắm luôn á. Hẹn gặp Ý nha!",
    "quy": "Anh Quý ơi! Em chính thức tốt nghiệp đại học rồi nè anh 🎓📸 Ngày lễ nhận bằng của em, anh Quý nhớ sắp xếp chút thời gian ghé qua trường chụp với em vài tấm hình kỷ niệm nha anh. Có người anh thân thiết đến chung vui là niềm vinh hạnh và vui vẻ lớn của em á!",
    "utmy": "Út iu dấu ơi! Cuối cùng ngày em cầm tấm bằng tốt nghiệp trên tay cũng đã tới rồi nè 🎉✨ Út nhớ ghé qua trường chụp thật nhiều hình kỷ niệm đẹp với em nhaaa. Cảm ơn Út thời gian qua luôn yêu thương và ủng hộ em hết mình. Mãi yêu Út, hẹn gặp Út ngày tốt nghiệp nhen! 🤍🎓",
    "anhthi": "Anh Hai ơi! Hành trình 4 năm đại học của em trai đã chính thức về đích rồi nè 🎓✨ Ngày em nhận bằng tốt nghiệp, Anh Hai nhớ sắp xếp thời gian ghé qua trường chung vui và chụp với em vài kiểu ảnh kỷ niệm nha. Sự có mặt của Anh Hai là niềm tự hào và động lực rất lớn đối với em á!",
    "anhnam": "Anh Hai ơi! Ngày em nhận bằng tốt nghiệp đại học, Anh Hai nhớ chở Chị Hai cùng qua trường chung vui và chụp với em những bức ảnh kỷ niệm thật đẹp nhaaa 🎓✨ Có cả Anh Hai và Chị Hai đến dự là ngày đặc biệt của em sẽ trọn vẹn và ấm áp lắm luôn á!",
    "benhi": "Chị Hai Nhi ơi! Em Nhã đã chính thức hoàn thành chặng đường đại học và nhận bằng tốt nghiệp rồi nè 🎓🎉 Chị Hai nhớ ghé trường chụp hình kỷ niệm cùng em nha. Có Chị Hai sang chung vui là ngày tốt nghiệp của em thêm rộn ràng và vui vẻ lắm luôn á!",
    "bean": "Bé An ơi! Anh Hai Nhã đã chính thức tốt nghiệp đại học rồi nè 🎓🎉 Bé An nhớ lên trường chung vui và chụp với anh Hai thật nhiều tấm hình kỷ niệm thật đẹp nhen. Cố gắng học giỏi sau này cũng nhận bằng rực rỡ như anh Hai nha!",
    "bame": "Kính gửi Ba Mẹ kính yêu của con! Hành trình 4 năm đại học của con đã chính thức hoàn thành, và tấm bằng kỹ sư hôm nay là món quà tri ân sâu sắc nhất con dành tặng Ba Mẹ. Con kính mời Ba Mẹ cùng em gái Phương Anh lên dự lễ tốt nghiệp để cùng con ghi lại những khoảnh khắc gia đình thiêng liêng và tự hào nhất. Sự hiện diện của Ba Mẹ là niềm hạnh phúc lớn nhất của cuộc đời con! 🤍🎓",
    "bac5": "Dạ con kính chào Út và Dượng 5! Hôm nay con đã hoàn thành xong chương trình đại học và chính thức nhận bằng tốt nghiệp 🎓✨ Con kính mời Út và Dượng Năm sắp xếp thời gian lên trường chung vui và chụp với con vài tấm hình kỷ niệm. Sự hiện diện và lời chúc của Út, Dượng là niềm vinh hạnh rất lớn đối với con ạ!",
    "canha": "Dạ con kính gửi Cả Nhà Mình! Trải qua 4 năm miệt mài học tập, con đã chính thức tốt nghiệp đại học. Con kính mời cả gia đình mình cùng lên trường tham dự buổi lễ và chụp những bức hình kỷ niệm thật ý nghĩa cùng con. Ngày trọng đại này có đầy đủ cả nhà bên cạnh là điều tuyệt vời và ấm áp nhất đối với con ạ! 🎓🤍",
    "di9": "Dạ con kính chào Dì và Dượng 9! Con đã hoàn thành 4 năm đại học và chính thức nhận tấm bằng kỹ sư 🎓✨ Con kính mời Dì 9 và Dượng 9 dành chút thời gian ghé qua trường chung vui và chụp ảnh lưu niệm cùng con trong ngày đặc biệt này ạ. Con cảm ơn Dì và Dượng rất nhiều!",
    "di3": "Dạ con kính chào Dì Ba! Con đã chính thức tốt nghiệp đại học rồi ạ 🎓✨ Con kính mời Dì Ba sắp xếp thời gian lên trường tham dự buổi lễ và chụp cùng con vài tấm ảnh kỷ niệm nha Dì. Sự hiện diện của Dì Ba là niềm vui và vinh hạnh lớn đối với con ạ!",
    "diut": "Dạ con kính chào Dì Út! Hành trình đại học của con đã khép lại bằng tấm bằng tốt nghiệp 🎓🎉 Con kính mời Dì Út lên trường chung vui và chụp với con những tấm hình kỷ niệm thật đẹp trong ngày này nha Dì. Con mong được đón tiếp Dì Út lắm ạ!",
    "cau5": "Dạ con kính chào Cậu Năm! Con đã chính thức hoàn thành 4 năm học và nhận bằng tốt nghiệp kỹ sư 🎓✨ Con kính mời Cậu Năm bớt chút thời gian lên trường tham dự và chụp với con những bức ảnh kỷ niệm ý nghĩa. Sự có mặt của Cậu Năm là niềm tự hào và vinh hạnh rất lớn cho con ạ!"
  };

  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return normalizeStr(h); });
  var slugColIdx = headers.indexOf("slug");
  var msgColIdx = headers.indexOf("custommessage");

  if (slugColIdx === -1 || msgColIdx === -1) {
    Logger.log("Không tìm thấy cột slug hoặc customMessage!");
    return;
  }

  var updateCount = 0;
  for (var r = 1; r < data.length; r++) {
    var slug = normalizeStr(data[r][slugColIdx]);
    if (newMessages[slug]) {
      sheet.getRange(r + 1, msgColIdx + 1).setValue(newMessages[slug]);
      updateCount++;
    }
  }

  Logger.log("Đã cập nhật thành công " + updateCount + " lời chúc vào sheet guests!");
}
