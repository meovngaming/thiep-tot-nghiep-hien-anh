/**
 * ============================================================================
 * GOOGLE APPS SCRIPT – KẾT NỐI SỔ LƯU BÚT VỚI GOOGLE SHEETS (MIỄN PHÍ 100%)
 * ============================================================================
 * Khi bạn đưa website lên GitHub Pages / Netlify / Vercel để gửi link qua Zalo:
 * 1. Tạo một Google Sheet mới, đặt tên trang tính đầu tiên là `Wishes`.
 * 2. Vào menu: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa code mặc định, dán toàn bộ code trong file này vào và nhấn Lưu (Ctrl+S).
 * 4. Nhấn "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment):
 *    - Loại: Ứng dụng web (Web app)
 *    - Thực thi với tư cách: Tôi (Me)
 *    - Người có quyền truy cập: Bất kỳ ai (Anyone)
 * 5. Sao chép URL Web App nhận được và dán vào `googleSheetsWebhookUrl`
 *    trong file `config.js` (và đặt `backendMode: "google-sheets"`).
 * ============================================================================
 */

const SHEET_NAME = "Wishes";

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "id",
      "name",
      "relationship",
      "attendance",
      "message",
      "likes",
      "createdAt",
    ]);
  }
  return sheet;
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// Đọc toàn bộ lời chúc để hiển thị lên Sổ lưu bút cho mọi khách mời
function doGet() {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const wishes = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1] && !r[4]) continue;
    wishes.push({
      id: String(r[0] || "sheet-" + i),
      name: String(r[1] || ""),
      relationship: String(r[2] || "Bạn bè"),
      attendance: String(r[3] || "attending"),
      message: String(r[4] || ""),
      likes: Number(r[5] || 0),
      createdAt: String(r[6] || new Date().toISOString()),
    });
  }

  wishes.reverse();
  return jsonOut({ ok: true, wishes: wishes });
}

// Lưu lời chúc mới hoặc thả tim vào Google Sheet
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const sheet = getSheet();

    if (payload.action === "like" && payload.id) {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(payload.id)) {
          const nextLikes = Number(rows[i][5] || 0) + 1;
          sheet.getRange(i + 1, 6).setValue(nextLikes);
          return jsonOut({ ok: true, id: payload.id, likes: nextLikes });
        }
      }
      return jsonOut({ ok: false, error: "Not found" });
    }

    const entry = {
      id: payload.id || "wish-" + Date.now(),
      name: String(payload.name || "").trim(),
      relationship: String(payload.relationship || "Bạn bè"),
      attendance: payload.attendance === "declined" ? "declined" : "attending",
      message: String(payload.message || "").trim(),
      likes: 0,
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    if (!entry.name || !entry.message) {
      return jsonOut({ ok: false, error: "Missing name or message" });
    }

    sheet.appendRow([
      entry.id,
      entry.name,
      entry.relationship,
      entry.attendance,
      entry.message,
      entry.likes,
      entry.createdAt,
    ]);

    return jsonOut({ ok: true, entry: entry });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}
