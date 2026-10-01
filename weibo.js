/**
 * 微博超话自动签到脚本 (fmz200 适配调试版)
 */

CheckIn();

function CheckIn() {
  // 包含 fmz200 及各类常见模块可能使用的所有 Cookie Key
  var possibleKeys = [
    "fmz200_cookie_weibo",
    "fmz200_cookie_微博",
    "cookie_weibo",
    "cookie_weibo_superbody",
    "chavy_cookie_weibo",
    "wb_cookie",
    "weibo_cookie",
    "weibo_token",
    "weiboCookie"
  ];

  var cookie = "";
  var hitKey = "";

  for (var i = 0; i < possibleKeys.length; i++) {
    var k = possibleKeys[i];
    var val = getData(k);
    if (val && val.length > 10) {
      cookie = val;
      hitKey = k;
      break;
    }
  }

  if (!cookie) {
    // 如果全部匹配失败，尝试盲读 fmz200 的基础配置
    showNotification("签到失败", "未匹配到对应的 Cookie Key，请查看应用日志调试");
    $done({});
    return;
  }

  getSuperList(cookie, function(list) {
    if (!list || list.length === 0) {
      showNotification("签到结束", "找到 Key(" + hitKey + ") 但列表为空或已过期");
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
      doSign(item, cookie, function(res) {
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

function getSuperList(cookie, callback) {
  var url = {
    url: "https://api.weibo.cn/2/page/get_objects?containerid=100803_-_page_my_follow_super",
    headers: {
      "Cookie": cookie,
      "User-Agent": "Weibo/7160 (iPhone; iOS 16.0; Scale/3.00)"
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

function doSign(item, cookie, callback) {
  var url = {
    url: "https://api.weibo.cn/2/page/button?request_url=http%3A%2F%2Fi.huati.weibo.com%2Fmobile%2Fsuper%2Factive_checkin%3Fpageid%3D" + item.id,
    headers: {
      "Cookie": cookie,
      "User-Agent": "Weibo/7160 (iPhone; iOS 16.0; Scale/3.00)"
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

function getData(key) {
  if (typeof $persistentStore !== "undefined") return $persistentStore.read(key);
  if (typeof $prefs !== "undefined") return $prefs.value(key);
  return null;
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
