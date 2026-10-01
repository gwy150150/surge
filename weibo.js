/**
 * 微博超话自动签到脚本 - 精准匹配 fmz200_weibo_data
 */

CheckIn();

function CheckIn() {
  // 1. 读取并解析 fmz200 存下的数据
  var accountData = getFmzAccountData();

  if (!accountData) {
    showNotification("签到失败 ❌", "未读取到缓存数据！请确保已刷新微博APP");
    $done({});
    return;
  }

  // 2. 提取凭证
  var headers = accountData.headers || {};
  var signinUrl = accountData.signin_url || "";

  // 从 URL 提取 gsid
  var gsidMatch = signinUrl.match(/gsid=([^&]+)/);
  var gsid = gsidMatch ? gsidMatch[1] : "";

  if (!gsid) {
    showNotification("签到失败 ❌", "数据中缺少 gsid 登录凭证");
    $done({});
    return;
  }

  // 3. 请求超话列表
  getSuperList(gsid, headers, function(list) {
    if (!list || list.length === 0) {
      showNotification("签到结束 ⚠️️", "未获取到关注的超话列表，请重新刷新微博超话页");
      $done({});
      return;
    }

    var success = 0;
    var total = list.length;
    var failDetails = [];
    var index = 0;

    // 4. 逐个签到
    function processNext() {
      if (index >= list.length) {
        var subTitle = "成功: " + success + " / 总数: " + total;
        var detail = failDetails.length > 0 ? "失败详情:\n" + failDetails.join("\n") : "所有超话已全部签到完成！🎉";
        showNotification(subTitle, detail);
        $done({});
        return;
      }

      var item = list[index];
      doSign(item, gsid, headers, function(res) {
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

// 精准匹配 fmz200 保存的键名
function getFmzAccountData() {
  var keys = [
    "fmz200_weibo_data",
    "weibo_data",
    "fmz200_cookie_weibo",
    "cookie_weibo"
  ];

  for (var i = 0; i < keys.length; i++) {
    var rawVal = getData(keys[i]);
    if (!rawVal) continue;

    try {
      var parsed = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      } else if (typeof parsed === "object" && parsed.signin_url) {
        return parsed;
      }
    } catch (e) {}
  }
  return null;
}

function getSuperList(gsid, extraHeaders, callback) {
  var reqHeaders = {
    "User-Agent": extraHeaders["user-agent"] || "Weibo/100170 (iPhone; iOS 16.6.1; Scale/2.00)"
  };
  if (extraHeaders["authorization"]) reqHeaders["authorization"] = extraHeaders["authorization"];

  var url = {
    url: "https://api.weibo.cn/2/page/get_objects?containerid=100803_-_page_my_follow_super&gsid=" + gsid,
    headers: reqHeaders
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

function doSign(item, gsid, extraHeaders, callback) {
  var reqHeaders = {
    "User-Agent": extraHeaders["user-agent"] || "Weibo/100170 (iPhone; iOS 16.6.1; Scale/2.00)"
  };
  if (extraHeaders["authorization"]) reqHeaders["authorization"] = extraHeaders["authorization"];

  var url = {
    url: "https://api.weibo.cn/2/page/button?request_url=http%3A%2F%2Fi.huati.weibo.com%2Fmobile%2Fsuper%2Factive_checkin%3Fpageid%3D" + item.id + "&gsid=" + gsid,
    headers: reqHeaders
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
