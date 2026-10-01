/**
 * 微博超话自动签到脚本 (Egern 终极兼容版)
 */

var cookieKey = "cookie_weibo_superbody";
var gdidKey = "gdid_weibo_superbody";

if (typeof $request !== "undefined") {
  GetCookie();
} else {
  CheckIn();
}

function CheckIn() {
  var cookie = getData(cookieKey);
  var gdid = getData(gdidKey);

  if (!cookie) {
    showNotification("签到失败", "未找到 Cookie，请先开启重写后打开微博APP获取");
    $done({});
    return;
  }

  getSuperList(cookie, gdid, function(list) {
    if (!list || list.length === 0) {
      showNotification("签到结束", "未获取到关注的超话列表或 Cookie 已失效");
      $done({});
      return;
    }

    var success = 0;
    var total = list.length;
    var failDetails = [];
    var index = 0;

    function processNext() {
      if (index >= list.length) {
        var subTitle = "成功: " + success + " / 总数: " + total;
        var detail = failDetails.length > 0 ? "失败原因:\n" + failDetails.join("\n") : "所有超话已全部签到完成！";
        showNotification(subTitle, detail);
        $done({});
        return;
      }

      var item = list[index];
      doSign(item, cookie, gdid, function(res) {
        if (res.result === 1) {
          success++;
        } else if (res.msg) {
          failDetails.push(item.title + ": " + res.msg);
        }
        index++;
        setTimeout(processNext, 1000);
      });
    }

    processNext();
  });
}

function getSuperList(cookie, gdid, callback) {
  var url = {
    url: "https://api.weibo.cn/2/page/get_objects?containerid=100803_-_page_my_follow_super",
    headers: {
      "Cookie": cookie,
      "User-Agent": "Weibo/7160 (iPhone; iOS 16.0; Scale/3.00)",
      "gdid": gdid || ""
    }
  };

  httpRequest(url, function(err, resp, data) {
    if (err || !data) {
      callback([]);
      return;
    }
    try {
      var res = JSON.parse(data);
      var cards = res.cards || [];
      var superList = [];
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.card_group) {
          for (var j = 0; j < card.card_group.length; j++) {
            var group = card.card_group[j];
            if (group.title_sub && group.actionlog && group.actionlog.ext_page) {
              var containerid = group.actionlog.ext_page.replace("page_id:", "");
              superList.push({
                title: group.title_sub,
                id: containerid
              });
            }
          }
        }
      }
      callback(superList);
    } catch (e) {
      callback([]);
    }
  });
}

function doSign(item, cookie, gdid, callback) {
  var url = {
    url: "https://api.weibo.cn/2/page/button?request_url=http%3A%2F%2Fi.huati.weibo.com%2Fmobile%2Fsuper%2Factive_checkin%3Fpageid%3D" + item.id,
    headers: {
      "Cookie": cookie,
      "User-Agent": "Weibo/7160 (iPhone; iOS 16.0; Scale/3.00)",
      "gdid": gdid || ""
    }
  };

  httpRequest(url, function(err, resp, data) {
    if (err || !data) {
      callback({ result: 0, msg: "网络错误" });
      return;
    }
    try {
      var res = JSON.parse(data);
      if (res.result === 1) {
        callback({ result: 1 });
      } else {
        callback({ result: 0, msg: res.msg || "已签到或失败" });
      }
    } catch (e) {
      callback({ result: 0, msg: "解析失败" });
    }
  });
}

function GetCookie() {
  if ($request && $request.headers) {
    var headers = $request.headers;
    var cookie = headers["Cookie"] || headers["cookie"];
    var gdid = headers["gdid"] || headers["GDID"];

    if (cookie) {
      setData(cookie, cookieKey);
      if (gdid) setData(gdid, gdidKey);
      showNotification("获取 Cookie 成功 🎉", "已成功保存微博签到凭证");
    }
  }
  $done({});
}

// Egern 基础原生 API 封装
function getData(key) {
  if (typeof $persistentStore !== "undefined") return $persistentStore.read(key);
  if (typeof $prefs !== "undefined") return $prefs.value(key);
  return null;
}

function setData(val, key) {
  if (typeof $persistentStore !== "undefined") return $persistentStore.write(val, key);
  if (typeof $prefs !== "undefined") return $prefs.setValue(val, key);
  return false;
}

function showNotification(sub, desc) {
  if (typeof $notification !== "undefined") {
    $notification.post("微博超话签到", sub, desc);
  }
}

function httpRequest(opts, cb) {
  if (typeof $httpClient !== "undefined") {
    $httpClient.get(opts, cb);
  } else if (typeof $task !== "undefined") {
    $task.fetch(opts).then(function(res) { cb(null, res, res.body); }, function(err) { cb(err, null, null); });
  } else {
    cb("No HTTP client", null, null);
  }
}
