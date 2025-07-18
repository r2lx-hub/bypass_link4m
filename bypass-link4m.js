(async function(){
  'use strict';

  const url = location.href;
  const host = location.hostname;
  const key = "fJn539c7"; // Nếu bị đổi key, chỉ cần chỉnh lại!
  const serviceUrl = `https://${host}/widget/service.js?key=${key}`;
  const waitTime = 65; // Tuỳ link4m yêu cầu (thường 60–90s)

  // Bước 1: Lấy traffic_id và traffic_session
  let jsText;
  try {
    jsText = await fetch(serviceUrl).then(r => r.text());
  } catch (e) {
    alert("Không lấy được service.js!\n" + e.message);
    return;
  }
  const regex = /var\s+([\w]+)\s*=\s*['"]([^'"]+)['"]/g;
  const data = {};
  let match;
  while ((match = regex.exec(jsText)) !== null) {
    data[match[1]] = decodeURIComponent(match[2]);
  }
  if (!data.traffic_id || !data.traffic_session) {
    alert("❌ Không tìm thấy traffic_id/traffic_session!");
    return;
  }

  // Bước 2: Chờ đúng thời gian
  console.log(`⏳ Đợi ${waitTime}s để lấy mã code cho hợp lệ...`);
  await new Promise(r => setTimeout(r, waitTime * 1000));

  // Bước 3: Gửi request lấy code
  const params = new URLSearchParams({
    code: data.traffic_id,
    traffic_session: data.traffic_session,
    client_id: data.traffic_session,
    screen: `${screen.width}x${screen.height}`,
    browser: navigator.userAgent.match(/Chrome|Firefox|Edge|Safari/i)?.[0] || "",
    browserVersion: navigator.userAgent.match(/Version\/([\d.]+)/)?.[1] || "",
    mobile: (/Mobile/i.test(navigator.userAgent)).toString(),
    os: navigator.platform,
    cookies: navigator.cookieEnabled ? "true" : "false",
    lang: navigator.language,
    pathname: location.pathname,
    href: url,
    hostname: host
  });
  let res, json;
  try {
    res = await fetch(`https://${host}/widget/get_code.html?${params}`);
    if (!res.ok) throw new Error(`Lỗi mạng: ${res.status}`);
    json = await res.json();
  } catch(e) {
    alert("❌ Lỗi khi gửi request lấy code:\n" + e.message);
    return;
  }

  // Show kết quả
  console.log("✅ Link4m code:", json);
  alert(`[Link4m] Mã/code nhận được:\n${JSON.stringify(json, null, 2)}`);
})();
