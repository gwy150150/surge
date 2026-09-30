/**
 * 微博超话自动签到脚本
 * 兼容 Loon / Egern / Quantumult X / Surge
 */

const $ = new Env("微博超话签到");
const cookieKey = "cookie_weibo_superbody";
const gdidKey = "gdid_weibo_superbody";

// 1. 抓包模式：获取 Cookie 和 GDID
if (typeof $request !== "undefined") {
  GetCookie();
} else {
  // 2. 定时任务模式：执行签到
  CheckIn();
}

async function CheckIn() {
  const cookie = $.getdata(cookieKey);
  const gdid = $.getdata(gdidKey);

  if (!cookie) {
    $.msg($.name, "签到失败", "未找到 Cookie，请先开启重写后打开微博APP获取");
    $.done();
    return;
  }

  const list = await getSuperList(cookie, gdid);
  if (!list || list.length === 0) {
    $.msg($.name, "签到结束", "未获取到关注的超话列表或 Cookie 已失效");
    $.done();
    return;
  }

  let success = 0;
  let total = list.length;
  let failDetails = [];

  for (let item of list) {
    const res = await doSign(item, cookie, gdid);
    if (res.result === 1) {
      success++;
    } else if (res.msg) {
      failDetails.push(`${item.title}: ${res.msg}`);
    }
    await $.wait(1000); // 避免请求过快导致封禁
  }

  const subTitle = `成功: ${success} / 总数: ${total}`;
  const detail = failDetails.length > 0 ? `失败原因:\n${failDetails.join("\n")}` : "所有超话已全部签到完成！";
  
  $.msg($.name, subTitle, detail);
  $.done();
}

// 获取关注的超话列表
function getSuperList(cookie, gdid) {
  return new Promise((resolve) => {
    const url = {
      url: `https://api.weibo.cn/2/page/get_objects?containerid=100803_-_page_my_follow_super`,
      headers: {
        "Cookie": cookie,
        "User-Agent": "Weibo/7160 (iPhone; iOS 16.0; Scale/3.00)",
        "gdid": gdid || ""
      }
    };
    $.get(url, (err, resp, data) => {
      try {
        if (err) {
          resolve([]);
        } else {
          const res = JSON.parse(data);
          const cards = res.cards || [];
          let superList = [];
          
          for (let card of cards) {
            if (card.card_group) {
              for (let group of card.card_group) {
                if (group.title_sub && group.actionlog && group.actionlog.ext_page) {
                  const containerid = group.actionlog.ext_page.replace("page_id:", "");
                  superList.push({
                    title: group.title_sub,
                    id: containerid
                  });
                }
              }
            }
          }
          resolve(superList);
        }
      } catch (e) {
        resolve([]);
      }
    });
  });
}

// 执行单个超话签到
function doSign(item, cookie, gdid) {
  return new Promise((resolve) => {
    const url = {
      url: `https://api.weibo.cn/2/page/button?request_url=http%3A%2F%2Fi.huati.weibo.com%2Fmobile%2Fsuper%2Factive_checkin%3Fpageid%3D${item.id}`,
      headers: {
        "Cookie": cookie,
        "User-Agent": "Weibo/7160 (iPhone; iOS 16.0; Scale/3.00)",
        "gdid": gdid || ""
      }
    };
    $.get(url, (err, resp, data) => {
      try {
        if (err) {
          resolve({ result: 0, msg: "网络错误" });
        } else {
          const res = JSON.parse(data);
          if (res.result === 1) {
            resolve({ result: 1 });
          } else {
            resolve({ result: 0, msg: res.msg || "已签到或失败" });
          }
        }
      } catch (e) {
        resolve({ result: 0, msg: "解析失败" });
      }
    });
  });
}

// 抓取凭证逻辑
function GetCookie() {
  if ($request.headers) {
    const cookie = $request.headers["Cookie"] \vert{}\vert{} $request.headers["cookie"];
    const gdid = $request.headers["gdid"] \vert{}\vert{} $request.headers["GDID"];

    if (cookie) {
      $.setdata(cookie, cookieKey);
      if (gdid) $.setdata(gdid, gdidKey);
      $.msg($.name, "获取 Cookie 成功 🎉", "已成功保存微博签到凭证");
    }
  }
  $.done();
}

// 兼容 API 封装
function Env(name) {
  return new (class {
    constructor(name) {
      this.name = name;
    }
    getdata(key) {
      if (typeof $persistentStore !== "undefined") return $persistentStore.read(key);
      if (typeof $prefs !== "undefined") return $prefs.value(key);
      return null;
    }
    setdata(val, key) {
      if (typeof $persistentStore !== "undefined") return $persistentStore.write(val, key);
      if (typeof $prefs !== "undefined") return $prefs.setValue(val, key);
      return false;
    }
    msg(title, sub, desc) {
      if (typeof $notification !== "undefined") $notification.post(title, sub, desc);
    }
    get(opts, callback) {
      if (typeof $httpClient !== "undefined") {
        $httpClient.get(opts, (err, resp, body) => callback(err, resp, body));
      }
    }
    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    done() {
      if (typeof $done !== "undefined") $done({});
    }
  })(name);
}
