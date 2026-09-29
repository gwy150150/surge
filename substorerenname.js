/*
 * 更新日期：2026-09-30
 * 用法：Sub-Store 节点重命名脚本
 * 修复：修改为 Sub-Store 引擎标准全局主函数架构
 */

function operator(proxies = []) {
  // 1. 解析传入的参数
  const inArg = typeof $arguments !== "undefined" ? $arguments : {};

  const nx = inArg.nx || false,
    bl = inArg.bl || false,
    nf = inArg.nf || false,
    key = inArg.key || false,
    blgd = inArg.blgd || false,
    blpx = inArg.blpx || false,
    blnx = inArg.blnx || false,
    numone = inArg.one || false,
    clear = inArg.clear || false,
    addflag = inArg.flag || false,
    nm = inArg.nm || false;

  const FGF = inArg.fgf === undefined ? " " : decodeURI(inArg.fgf),
    XHFGF = inArg.sn === undefined ? " " : decodeURI(inArg.sn),
    FNAME = inArg.name === undefined ? "" : decodeURI(inArg.name),
    BLKEY = inArg.blkey === undefined ? "" : decodeURI(inArg.blkey),
    blockquic = inArg.blockquic === undefined ? "" : decodeURI(inArg.blockquic),
    nameMap = {
      cn: "cn",
      zh: "cn",
      us: "us",
      en: "us",
      quan: "quan",
      gq: "gq",
      flag: "gq",
    },
    inname = nameMap[inArg.in] || "",
    outputName = nameMap[inArg.out] || "";

  // 基础映射列表定义
  // prettier-ignore
  const FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇦🇺','🇦🇪','🇦🇫','🇦🇱','🇩ℤ','🇦🇴','🇦🇷','🇦🇲','🇦🇹','🇦ℤ','🇧🇭','🇧🇩','🇧🇾','🇧🇪','🇧ℤ','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇻🇬','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇨🇻','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇭🇷','🇨🇾','🇨ℤ','🇩🇰','🇩🇯','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇪🇹','🇫🇯','🇫🇮','🇬🇦','🇬🇲','🇬🇪','🇬🇭','🇬🇷','🇬🇱','🇬🇹','🇬🇳','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇨🇮','🇯🇲','🇯🇴','🇰ℤ','🇰🇪','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇹','🇱🇺','🇲🇰','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇷','🇲🇺','🇲🇽','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲ℤ','🇲🇲','🇳🇦','🇳🇵','🇳🇱','🇳ℤ','🇳🇮','🇳🇪','🇳🇬','🇰🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇦','🇵🇾','🇵🇪','🇵🇭','🇵🇹','🇵🇷','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇸🇲','🇸🇦','🇸🇳','🇷🇸','🇸🇱','🇸🇰','🇸🇮','🇸🇴','ℤ🇦','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸ℤ','🇸🇪','🇨🇭','🇸🇾','🇹🇯','🇹ℤ','🇹🇭','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇻🇮','🇺🇬','🇺🇦','🇺🇾','🇺ℤ','🇻🇪','🇻🇳','🇾🇪','ℤ🇲','ℤ🇼','🇦🇩','🇷🇪','🇵🇱','🇬🇺','🇻🇦','🇱🇮','🇨🇼','🇸🇨','🇦🇶','🇬🇮','🇨🇺','🇫🇴','🇦🇽','🇧🇲','🇹🇱'];
  // prettier-ignore
  const EN = ['HK','MO','TW','JP','KR','SG','US','GB','FR','DE','AU','AE','AF','AL','DZ','AO','AR','AM','AT','AZ','BH','BD','BY','BE','BZ','BJ','BT','BO','BA','BW','BR','VG','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CO','KM','CG','CD','CR','HR','CY','CZ','DK','DJ','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','GA','GM','GE','GH','GR','GL','GT','GN','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','CI','JM','JO','KZ','KE','KW','KG','LA','LV','LB','LS','LR','LY','LT','LU','MK','MG','MW','MY','MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG','KP','NO','OM','PK','PA','PY','PE','PH','PT','PR','QA','RO','RU','RW','SM','SA','SN','RS','SL','SK','SI','SO','ZA','ES','LK','SD','SR','SZ','SE','CH','SY','TJ','TZ','TH','TG','TO','TT','TN','TR','TM','VI','UG','UA','UY','UZ','VE','VN','YE','ZM','ZW','AD','RE','PL','GU','VA','LI','CW','SC','AQ','GI','CU','FO','AX','BM','TL'];
  // prettier-ignore
  const ZH = ['香港','澳门','台湾','日本','韩国','新加坡','美国','英国','法国','德国','澳大利亚','阿联酋','阿富汗','阿尔巴尼亚','阿尔及利亚','安哥拉','阿根廷','亚美尼亚','奥地利','阿塞拜疆','巴林','孟加拉国','白俄罗斯','比利时','伯利兹','贝宁','不丹','玻利维亚','波斯尼亚和黑塞哥维那','博茨瓦纳','巴西','英属维京群岛','文莱','保加利亚','布基纳法索','布隆迪','柬埔寨','喀麦隆','加拿大','佛得角','开曼群岛','中非共和国','乍得','智利','哥伦比亚','科摩罗','刚果(布)','刚果(金)','哥斯达黎加','克罗地亚','塞浦路斯','捷克','丹麦','吉布提','多米尼加共和国','厄瓜多尔','埃及','萨尔瓦多','赤道几内亚','厄立特里亚','爱沙尼亚','埃塞欧比亚','斐济','芬兰','加蓬','冈比亚','格鲁吉亚','加纳','希腊','格陵兰','危地马拉','几内亚','圭亚那','海地','洪都拉斯','匈牙利','冰岛','印度','印尼','伊朗','伊拉克','爱尔兰','马恩岛','以色列','意大利','科特迪瓦','牙买加','约旦','哈萨克斯坦','肯尼亚','科威特','吉尔吉斯斯坦','老挝','拉脱维亚','黎巴嫩','莱索托','利比里亚','利比亚','立陶宛','卢森堡','马其顿','马达加斯加','马拉维','马来','马尔代夫','马里','马耳他','毛利塔尼亚','毛里求斯','墨西哥','摩尔多瓦','摩纳哥','蒙古','黑山共和国','摩洛哥','莫桑比克','缅甸','纳米比亚','尼泊尔','荷兰','新西兰','尼加拉瓜','尼日尔','尼日利亚','朝鲜','挪威','阿曼','巴基斯坦','巴拿马','巴拉圭','秘鲁','菲律宾','葡萄牙','波多黎各','卡塔尔','罗马尼亚','俄罗斯','卢旺达','圣马力诺','沙特阿拉伯','塞内加尔','塞尔维亚','塞拉利昂','斯洛伐克','斯洛文尼亚','索马里','南非','西班牙','斯里兰卡','苏丹','苏里南','斯威士兰','瑞典','瑞士','叙利亚','塔吉克斯坦','坦桑尼亚','泰国','多哥','汤加','特立尼达和多巴哥','突尼斯','土耳其','土库曼斯坦','美属维尔京群岛','乌干达','乌克兰','乌拉圭','乌兹别克斯坦','委内瑞拉','越南','也门','赞比亚','津巴布韦','安道尔','留尼汪','波兰','关岛','梵蒂冈','列支敦士登','库拉索','塞舌尔','南极','直布罗陀','古巴','法罗群岛','奥兰群岛','百慕达','东帝汶'];
  // prettier-ignore
  const QC = ['Hong Kong','Macao','Taiwan','Japan','Korea','Singapore','United States','United Kingdom','France','Germany','Australia','Dubai','Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Austria','Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','British Virgin Islands','Brunei','Bulgaria','Burkina-faso','Burundi','Cambodia','Cameroon','Canada','CapeVerde','CaymanIslands','Central African Republic','Chad','Chile','Colombia','Comoros','Congo-Brazzaville','Congo-Kinshasa','CostaRica','Croatia','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','EISalvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Fiji','Finland','Gabon','Gambia','Georgia','Ghana','Greece','Greenland','Guatemala','Guinea','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Isle of Man','Israel','Italy','Ivory Coast','Jamaica','Jordan','Kazakstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar(Burma)','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','NorthKorea','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Portugal','PuertoRico','Qatar','Romania','Russia','Rwanda','SanMarino','SaudiArabia','Senegal','Serbia','SierraLeone','Slovakia','Slovenia','Somalia','SouthAfrica','Spain','SriLanka','Sudan','Suriname','Swaziland','Sweden','Switzerland','Syria','Tajikstan','Tanzania','Thailand','Togo','Tonga','TrinidadandTobago','Tunisia','Turkey','Turkmenistan','U.S.Virgin Islands','Uganda','Ukraine','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe','Andorra','Reunion','Poland','Guam','Vatican','Liechtensteins','Curacao','Seychelles','Antarctica','Gibraltar','Cuba','Faroe Islands','Ahvenanmaa','Bermuda','Timor-Leste'];

  const specialRegex = [
    /(\d\.)?\d+×/,
    /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/,
  ];
  const nameclear =
    /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;

  const regexArray = [
    /ˣ²/, /ˣ³/, /ˣ⁴/, /ˣ⁵/, /ˣ⁶/, /ˣ⁷/, /ˣ⁸/, /ˣ⁹/, /ˣ¹⁰/, /ˣ²⁰/, /ˣ³⁰/, /ˣ⁴⁰/, /ˣ⁵⁰/,
    /专线/, /IPLC/i, /IEPL/i, /核心/, /边缘/, /高级/, /标准/, /特殊/, /实验/, /商宽/, /家宽/,
    /游戏|game/i, /购物/, /LB/, /cloudflare/i, /\budp\b/i, /\bgpt\b/i, /udpn\b/,
  ];
  const valueArray = [
    "2×", "3×", "4×", "5×", "6×", "7×", "8×", "9×", "10×", "20×", "30×", "40×", "50×",
    "DL", "IPLC", "IEPL", "Kern", "Edge", "Pro", "Std", "Spec", "Exp", "Biz", "Fam", "Game",
    "Buy", "LB", "CF", "UDP", "GPT", "UDPN",
  ];

  const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
  const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
  const keya = /港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR|🇸🇬|🇭🇰|🇯🇵|🇺🇸|🇰🇷|🇹🇷/i;
  const keyb = /(((1|2|3|4)\d)|(香港|Hong|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR) 0[3-9]))/i;

  const rurekey = {
    GB: /UK/g,
    "B-G-P": /BGP/g,
    "Russia Moscow": /Moscow/g,
    "Korea Chuncheon": /Chuncheon|Seoul/g,
    "Hong Kong": /Hongkong|HONG KONG/gi,
    "United Kingdom London": /London|Great Britain/g,
    "Dubai United Arab Emirates": /United Arab Emirates/g,
    "Taiwan TW 台湾 🇹🇼": /(台|Tai\s?wan|TW).*?🇨🇳|🇨🇳.*?(台|Tai\s?wan|TW)/g,
    "United States": /USA|Los Angeles|San Jose|Silicon Valley|Michigan/g,
    澳大利亚: /澳洲|墨尔本|悉尼|土澳|(深|沪|呼|京|广|杭)澳/g,
    德国: /(深|沪|呼|京|广|杭)德(?!.*(I|线))|法兰克福|滬德/g,
    香港: /(深|沪|呼|京|广|杭)港(?!.*(I|线))/g,
    日本: /(深|沪|呼|京|广|杭|中|辽)日(?!.*(I|线))|东京|大坂/g,
    新加坡: /狮城|(深|沪|呼|京|广|杭)新/g,
    美国: /(深|沪|呼|京|广|杭)美|波特兰|芝加哥|哥伦布|纽约|硅谷|俄勒冈|西雅图/g,
    波斯尼亚和黑塞哥维那: /波黑共和国/g,
    印尼: /印度尼西亚|雅加达/g,
    印度: /孟买/g,
    阿联酋: /迪拜|阿拉伯联合赠长国/g,
    孟加拉国: /孟加拉/g,
    捷克: /捷克共和国/g,
    台湾: /新台|新北|台(?!.*线)/g,
    Taiwan: /Taipei/g,
    韩国: /春川|韩|首尔/g,
    Japan: /Tokyo|Osaka/g,
    英国: /伦敦/g,
    India: /Mumbai/g,
    Germany: /Frankfurt/g,
    Switzerland: /Zurich/g,
    俄罗斯: /莫斯科/g,
    土耳其: /伊斯坦布尔/g,
    泰国: /泰國|曼谷/g,
    法国: /巴黎/g,
    G: /\d\s?GB/gi,
    Esnc: /esnc/gi,
  };

  function getList(arg) {
    switch (arg) {
      case "us": return EN;
      case "gq": return FG;
      case "quan": return QC;
      default: return ZH;
    }
  }

  function jxh(e) {
    const n = e.reduce((acc, current) => {
      const found = acc.find((item) => item.name === current.name);
      if (found) {
        found.count++;
        found.items.push({ ...current, name: `${current.name}${XHFGF}${found.count.toString().padStart(2, "0")}` });
      } else {
        acc.push({ name: current.name, count: 1, items: [{ ...current, name: `${current.name}${XHFGF}01` }] });
      }
      return acc;
    }, []);
    const flattened = typeof Array.prototype.flatMap === "function" ? n.flatMap((item) => item.items) : n.reduce((acc, item) => acc.concat(item.items), []);
    e.splice(0, e.length, ...flattened);
    return e;
  }

  function oneP(e) {
    const grouped = e.reduce((acc, item) => {
      const keyName = item.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, "");
      if (!acc[keyName]) acc[keyName] = [];
      acc[keyName].push(item);
      return acc;
    }, {});
    for (const keyName in grouped) {
      if (grouped[keyName].length === 1 && grouped[keyName][0].name.endsWith("01")) {
        grouped[keyName][0].name = grouped[keyName][0].name.replace(/[^.]01/, "");
      }
    }
    return e;
  }

  function fampx(proList) {
    const wis = [], wnout = [];
    for (const proxy of proList) {
      if (specialRegex.some((regex) => regex.test(proxy.name))) {
        wis.push(proxy);
      } else {
        wnout.push(proxy);
      }
    }
    const sps = wis.map((proxy) => specialRegex.findIndex((regex) => regex.test(proxy.name)));
    wis.sort((a, b) => sps[wis.indexOf(a)] - sps[wis.indexOf(b)] || a.name.localeCompare(b.name));
    wnout.sort((a, b) => proList.indexOf(a) - proList.indexOf(b));
    return wnout.concat(wis);
  }

  // 节点逻辑处理
  let pro = Array.isArray(proxies) ? proxies : [];
  const Allmap = {};
  const outList = getList(outputName);
  let inputList = inname !== "" ? [getList(inname)] : [ZH, FG, QC, EN];

  inputList.forEach((arr) => {
    arr.forEach((value, valueIndex) => {
      Allmap[value] = outList[valueIndex];
    });
  });

  if (clear || nx || blnx || key) {
    pro = pro.filter((res) => {
      const resname = res.name || "";
      return (
        !(clear && nameclear.test(resname)) &&
        !(nx && namenx.test(resname)) &&
        !(blnx && !nameblnx.test(resname)) &&
        !(key && !(keya.test(resname) && /2|4|6|7/i.test(resname)))
      );
    });
  }

  const BLKEYS = BLKEY ? BLKEY.split("+") : [];
  const AMK = Object.entries(Allmap);

  pro.forEach((e) => {
    if (!e || !e.name) return;
    let retainKey = "";

    Object.keys(rurekey).forEach((ikey) => {
      if (rurekey[ikey].test(e.name)) {
        e.name = e.name.replace(rurekey[ikey], ikey);
      }
    });

    if (blockquic === "on") e["block-quic"] = "on";
    else if (blockquic === "off") e["block-quic"] = "off";

    if (BLKEYS.length > 0) {
      let BLKEY_REPLACE = "", re = false;
      BLKEYS.forEach((i) => {
        const parts = i.split(">");
        if (parts[0] && e.name.includes(parts[0])) {
          if (parts[1]) {
            BLKEY_REPLACE = parts[1];
            re = true;
          }
        }
      });
      retainKey = re ? BLKEY_REPLACE : BLKEYS.filter((items) => e.name.includes(items));
    }

    let ikey = "", ikeys = "";
    if (blgd) {
      regexArray.forEach((regex, index) => {
        if (regex.test(e.name)) ikeys = valueArray[index];
      });
    }

    if (bl) {
      const match = e.name.match(/((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/);
      if (match) {
        const rev = match[0].match(/(\d[\d.]*)/);
        if (rev && rev[0] !== "1") ikey = rev[0] + "×";
      }
    }

    const findKey = AMK.find(([k]) => e.name.includes(k));
    let firstName = nf ? FNAME : "";
    let nNames = !nf ? FNAME : "";

    if (findKey?.[1]) {
      const findKeyValue = findKey[1];
      let keyover = [], usflag = "";
      if (addflag) {
        const index = outList.indexOf(findKeyValue);
        if (index !== -1) {
          usflag = FG[index] === "🇹🇼" ? "🇨🇳" : FG[index];
        }
      }
      keyover = keyover
        .concat(firstName, usflag, nNames, findKeyValue, retainKey, ikey, ikeys)
        .filter((k) => k !== "" && k !== undefined);
      e.name = keyover.join(FGF);
    } else {
      if (nm) {
        e.name = FNAME ? `${FNAME}${FGF}${e.name}` : e.name;
      } else {
        e.name = null;
      }
    }
  });

  pro = pro.filter((e) => e && e.name !== null);
  jxh(pro);
  numone && oneP(pro);
  blpx && (pro = fampx(pro));
  key && (pro = pro.filter((e) => !keyb.test(e.name)));

  return pro;
}
