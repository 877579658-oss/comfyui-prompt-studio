(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const pair = (zh, en, extra = {}) => ({ zh, en, ...extra });

  const PS = window.PS_DATA;
  if (!PS) {
    throw new Error("词库数据没有加载：请确认 index.html 中 data/prompts.js 在 app.js 之前引入。");
  }
  const { MODELS, O, ROLE_PRESETS } = PS;
  const FIELD_TO_OPTIONS = {
    gender: "gender",
    age: "age",
    appearance: "appearance",
    body: "body",
    face: "face",
    hairStyle: "hairStyle",
    hairColor: "hairColor",
    eyes: "eyes",
    expression: "expression",
    skin: "skin",
    rolePreset: "rolePreset",
    outfit: "outfit",
    fabric: "fabric",
    outfitColor: "outfitColor",
    fit: "fit",
    accessories: "accessories",
    footwear: "footwear",
    hosiery: "hosiery",
    hosieryMaterial: "hosieryMaterial",
    grooming: "grooming",
    pose: "pose",
    action: "action",
    interaction: "interaction",
    bodyOrientation: "bodyOrientation",
    gaze: "gaze",
    handPose: "handPose",
    legPose: "legPose",
    postureLine: "postureLine",
    motionLevel: "motionLevel",
    scene: "scene",
    timeOfDay: "timeOfDay",
    weather: "weather",
    background: "background",
    props: "props",
    mood: "mood",
    shotSize: "shotSize",
    angle: "angle",
    lens: "lens",
    composition: "composition",
    depthOfField: "depthOfField",
    cameraMove: "cameraMove",
    lighting: "lighting",
    palette: "palette",
    atmosphere: "atmosphere",
    filmLook: "filmLook",
    visualStyle: "visualStyle",
    render: "render",
    creatureType: "creatureType",
    adultArchetype: "adultArchetype",
    intimacyLevel: "intimacyLevel",
    audioMode: "audioMode",
    voiceTone: "voiceTone",
    consistencyFocus: "consistencyFocus",
    sound: "sound",
    aspectRatio: "aspectRatio"
  };

  const ADULT_OPTION_MERGES = {
    grooming: "adultStyling",
    scene: "adultScene",
    lighting: "adultLighting",
    visualStyle: "adultCameraStyle",
    composition: "adultFraming",
    mood: "adultAtmosphere",
    intimacyLevel: "adultRelationship"
  };

  const DEFAULTS = {
    model: "zimage_turbo",
    language: "en",
    detailLevel: "balanced",
    contentScale: "sfw",
    loraTrigger: "",
    imageWidth: "1024",
    imageHeight: "1024",
    subjectType: "person",
    rolePreset: "urban everyday",
    gender: "adult woman",
    age: "in their thirties",
    appearance: "East Asian features",
    body: "athletic build",
    face: "oval face",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "dark brown",
    eyes: "dark brown eyes",
    expression: "calm, natural expression",
    skin: "natural skin texture",
    outfit: "oversized white shirt",
    fabric: "soft cotton and linen",
    outfitColor: "",
    fit: "relaxed oversized fit",
    accessories: "minimal silver earrings",
    footwear: "barefoot",
    hosiery: "",
    hosieryMaterial: "",
    grooming: "light natural makeup",
    pose: "standing beside a window",
    action: "subtle breathing and natural blinking",
    interaction: "",
    bodyOrientation: "three-quarter view from the front left",
    gaze: "looking off-camera",
    handPose: "hands resting naturally",
    legPose: "standing with feet naturally placed",
    postureLine: "relaxed natural posture",
    motionLevel: "slow natural movement",
    scene: "a quiet hotel room in the morning",
    timeOfDay: "early morning",
    weather: "controlled indoor atmosphere",
    background: "clear foreground, midground, and background layers",
    props: "soft translucent curtains",
    mood: "quiet and calm",
    shotSize: "medium shot",
    angle: "eye-level camera",
    lens: "50mm natural-perspective lens",
    composition: "rule-of-thirds composition",
    depthOfField: "shallow depth of field",
    cameraMove: "static camera",
    lighting: "large soft window light",
    palette: "low-saturation cream palette",
    atmosphere: "airy atmospheric depth",
    filmLook: "35mm film look",
    visualStyle: "cinematic photorealism",
    render: "photorealistic rendering",
    aspectRatio: "aspect ratio 4:5, vertical portrait",
    creatureType: "elegant elf-like fantasy being",
    adultArchetype: "",
    intimacyLevel: "",
    audioMode: "ambient sound only, no dialogue",
    voiceTone: "natural conversational delivery",
    consistencyFocus: "preserve identity, outfit, environment, framing, and lighting",
    dialogueScript: "",
    voiceoverScript: "",
    oneSpeaker: true,
    sound: "quiet indoor room tone",
    duration: "5"
  };

  let toastTimer = null;
  let formSaveTimer = null;
  let latestOutput = null;

  const ADULT_GROUP_LABEL = "扩展 · 18+";

  // 内容尺度：只影响「成人向分组的展开状态」「负面词库」和「随机时抽成人向的比例」，不过滤任何选项
  const NEGATIVE_SCALES = {
    sfw: "",
    suggestive:
      "explicit nudity, exposed genitalia, sexual act, minors, child, underage, real person likeness, celebrity likeness, plastic skin, heavy airbrushing",
    boudoir:
      "exposed genitalia, explicit sexual act, minors, child, underage, real person likeness, celebrity likeness, distorted anatomy, plastic skin, over-smoothed skin, heavy airbrushing",
    adult:
      "explicit sexual act, exposed genitalia, minors, child, underage, real person likeness, celebrity likeness, distorted anatomy, extra legs, fused toes, plastic skin, over-smoothed skin, heavy airbrushing"
  };

  const ADULT_RANDOM_RATE = { sfw: 0, suggestive: 0.2, boudoir: 0.4, adult: 1 };

  function contentScale() {
    return $("contentScale")?.value || "sfw";
  }

  function syncScaleSwitch() {
    const scale = contentScale();
    $$("#scaleSwitch button").forEach((button) => {
      const on = button.dataset.scale === scale;
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", String(on));
    });
  }

  function setContentScale(scale) {
    const input = $("contentScale");
    if (!input) return;
    input.value = scale;
    syncScaleSwitch();
    refreshSelectsForSubject();
    let applied = 0;
    if (scale === "adult") applied = applyAdultStarter();
    if (applied) syncSizeFromAspectRatio();
    applyContentScale();
    updateOutput();
    saveAutosave();
    const label = { sfw: "日常", suggestive: "暗示", boudoir: "私房", adult: "扩展" }[scale] || scale;
    showToast(applied ? `${label}档 · 已套用 ${applied} 项私房基础值` : `${label}档`);
  }

  // 切到「成人向」档时，只替换用户没动过的字段，给一套能直接出片的起点
  const ADULT_STARTER = [
    ["scene", "精品酒店套房"],
    ["lighting", "暖色床头灯"],
    ["mood", "安静暧昧"],
    ["visualStyle", "高级私房摄影"],
    ["composition", "半身私密构图"],
    ["grooming", "高级私房写真"],
    ["outfit", "丝质系带睡袍"],
    ["pose", "侧卧手撑头"],
    ["expression", "柔和微张双唇"],
    ["shotSize", "半身像"],
    ["depthOfField", "浅景深"],
    ["timeOfDay", "夜晚"],
    ["aspectRatio", "4:5 竖版人像"]
  ];

  function applyAdultStarter() {
    let changed = 0;
    for (const [field, zh] of ADULT_STARTER) {
      if (!fieldAppliesTo(field)) continue;
      if (fieldModified(field)) continue;
      const option = getOptionPairs(field).find((item) => item.zh === zh);
      if (!option) continue;
      setSelectValue(field, option.en);
      changed += 1;
    }
    return changed;
  }

  function setAdultGroupExpanded(open) {
    for (const combo of combos.values()) {
      combo.overrides.set(ADULT_GROUP_LABEL, open);
    }
  }

  function applyContentScale() {
    setAdultGroupExpanded(contentScale() !== "sfw");
  }

  // 主体分组：以后加「动物 / 植物」只要在这里和 FIELD_SUBJECT_GROUPS 里各补一行
  const SUBJECT_GROUPS = {
    person: "human",
    couple: "human",
    group: "human",
    creature: "creature",
    object: "object"
  };

  // 字段适用于哪些主体分组；没列出来的字段对所有主体都显示
  const FIELD_SUBJECT_GROUPS = {
    rolePreset: ["human"],
    gender: ["human"],
    age: ["human"],
    appearance: ["human"],
    body: ["human"],
    face: ["human"],
    hairStyle: ["human"],
    hairColor: ["human"],
    eyes: ["human"],
    expression: ["human"],
    skin: ["human"],
    adultArchetype: ["human"],
    outfit: ["human"],
    fabric: ["human"],
    outfitColor: ["human"],
    fit: ["human"],
    accessories: ["human"],
    footwear: ["human"],
    hosiery: ["human"],
    hosieryMaterial: ["human"],
    grooming: ["human"],
    pose: ["human", "creature"],
    bodyOrientation: ["human"],
    gaze: ["human", "creature"],
    handPose: ["human", "creature"],
    legPose: ["human", "creature"],
    postureLine: ["human"],
    interaction: ["human"],
    intimacyLevel: ["human"],
    characterCustom: ["human"],
    creatureType: ["creature"],
    objectDescription: ["object"]
  };

  function subjectGroup() {
    return SUBJECT_GROUPS[currentSubjectType()] || "human";
  }

  function fieldAppliesTo(field, group = subjectGroup()) {
    const groups = FIELD_SUBJECT_GROUPS[field];
    return !groups || groups.includes(group);
  }

  // 简洁模式：只显示这些常用字段，以及你已经改动过的字段
  const CORE_FIELDS = new Set([
    "model",
    "customModelName",
    "customFormat",
    "language",
    "detailLevel",
    "contentScale",
    "aspectRatio",
    "subjectType",
    "rolePreset",
    "gender",
    "outfit",
    "pose",
    "interaction",
    "scene",
    "shotSize",
    "lighting",
    "visualStyle",
    "customDetails",
    "customNegative"
  ]);

  let compactMode = true;

  function fieldModified(field) {
    const element = $(field);
    if (!element) return false;
    const fallback = DEFAULTS[field];
    if (element.type === "checkbox") return element.checked !== Boolean(fallback);
    const value = String(element.value || "");
    return value !== String(fallback === undefined ? "" : fallback);
  }

  // 给字段打标记，CSS 据此在简洁模式下隐藏“没动过的高级字段”
  function refreshFieldMarks() {
    const fields = new Set([...Object.keys(FIELD_TO_OPTIONS), ...Object.keys(FIELD_SUBJECT_GROUPS)]);
    for (const field of fields) {
      const wrap = $(field)?.closest("label");
      if (!wrap) continue;
      wrap.classList.toggle("is-advanced", !CORE_FIELDS.has(field));
      wrap.classList.toggle("is-modified", fieldModified(field));
    }
  }

  function applyCompactMode() {
    document.body.classList.toggle("compact", Boolean(compactMode));
    const button = $("compactButton");
    if (!button) return;
    button.classList.toggle("is-on", Boolean(compactMode));
    button.setAttribute("aria-pressed", String(Boolean(compactMode)));
    button.textContent = compactMode ? "简洁" : "全部";
  }

  // ---------- 一句话预填 ----------
  // 常见说法 → 已存在的选项（中文标签）。找不到对应标签的提示会被跳过。
  const SENTENCE_HINTS = [
    [/女孩|女生|姑娘|女人|女性|美女/, "gender", "成年女性"],
    [/男孩|男生|小伙|男人|男性|帅哥/, "gender", "成年男性"],
    [/中性|androgynous/, "gender", "中性气质成年人"],
    [/情侣|双人|两个人|两人|一对|伴侣/, "subjectType", "couple"],
    [/群像|一群人|几个人|三人/, "subjectType", "group"],
    [/精灵|奇幻生物|妖怪|龙/, "subjectType", "creature"],
    [/产品|物体|静物|手表|香水|鞋|包/, "subjectType", "object"],
    [/雨夜/, "scene", "雨夜街道"],
    [/霓虹/, "scene", "霓虹后巷"],
    [/咖啡厅|咖啡馆/, "scene", "咖啡厅窗边"],
    [/街头|城市|街拍/, "scene", "城市街头"],
    [/天台|屋顶/, "scene", "天台夜景"],
    [/地铁/, "scene", "地铁车厢"],
    [/酒店/, "scene", "清晨酒店房间"],
    [/卧室|床上/, "scene", "暖光卧室"],
    [/客厅|公寓/, "scene", "现代公寓客厅"],
    [/图书馆/, "scene", "图书馆"],
    [/展厅|美术馆|画廊/, "scene", "艺术展厅"],
    [/舞台/, "scene", "舞台后台"],
    [/森林/, "scene", "森林空地"],
    [/雪山/, "scene", "雪山木屋"],
    [/海边|海滩|沙滩/, "scene", "热带海滩"],
    [/湖边|湖畔/, "scene", "湖边长椅"],
    [/花田|花海/, "scene", "花田"],
    [/沙漠/, "scene", "沙漠公路"],
    [/赛博/, "scene", "赛博城市"],
    [/太空|飞船/, "scene", "太空舱"],
    [/城堡/, "scene", "中世纪城堡"],
    [/庭院|园林/, "scene", "古典庭院"],
    [/清晨|早晨|早上/, "timeOfDay", "清晨"],
    [/正午|中午/, "timeOfDay", "正午"],
    [/午后|下午/, "timeOfDay", "午后"],
    [/黄昏|傍晚|日落/, "timeOfDay", "黄昏"],
    [/夜晚|晚上|夜里|深夜|夜景/, "timeOfDay", "夜晚"],
    [/蓝调时刻/, "timeOfDay", "蓝调时刻"],
    [/黄金时刻/, "timeOfDay", "黄金时刻"],
    [/下雨|雨中|雨天/, "weather", "小雨"],
    [/暴雨|大雨/, "weather", "大雨"],
    [/下雪|雪天/, "weather", "小雪"],
    [/起雾|薄雾|雾中/, "weather", "薄雾"],
    [/阴天/, "weather", "多云"],
    [/窗光|自然光/, "lighting", "柔和窗光"],
    [/逆光/, "lighting", "侧逆光"],
    [/轮廓光/, "lighting", "轮廓光"],
    [/烛光/, "lighting", "烛光"],
    [/台灯/, "lighting", "暖色台灯"],
    [/霓虹光|霓虹灯/, "lighting", "霓虹实用光"],
    [/三点布光|棚拍光/, "lighting", "三点布光"],
    [/特写/, "shotSize", "面部特写"],
    [/大特写|极近/, "shotSize", "极近特写"],
    [/半身/, "shotSize", "半身像"],
    [/全身|全景/, "shotSize", "全身"],
    [/远景|大全景/, "shotSize", "大全景"],
    [/微距/, "shotSize", "细节微距"],
    [/浅景深|背景虚化|虚化/, "depthOfField", "浅景深"],
    [/极浅景深/, "depthOfField", "极浅景深"],
    [/大景深|背景清晰/, "depthOfField", "大景深"],
    [/电影感|电影|cinematic/, "visualStyle", "电影写实"],
    [/时尚|杂志/, "visualStyle", "时尚编辑"],
    [/纪实/, "visualStyle", "纪实摄影"],
    [/广告/, "visualStyle", "广告摄影"],
    [/剧照/, "visualStyle", "电影剧照"],
    [/日系/, "visualStyle", "日系人像"],
    [/国风|东方/, "visualStyle", "东方美学"],
    [/暗黑/, "visualStyle", "暗黑电影"],
    [/复古|胶片感/, "visualStyle", "复古胶片"],
    [/赛博朋克/, "visualStyle", "赛博朋克"],
    [/奇幻|概念艺术/, "visualStyle", "奇幻概念艺术"],
    [/3d|三维/, "visualStyle", "3D动画"],
    [/动漫|二次元/, "visualStyle", "动漫插画"],
    [/水彩/, "visualStyle", "水彩插画"],
    [/漫画/, "visualStyle", "漫画分镜"],
    [/极简/, "visualStyle", "极简设计"],
    [/35mm/, "filmLook", "35mm胶片"],
    [/颗粒/, "filmLook", "16mm颗粒"],
    [/宝丽来/, "filmLook", "复古宝丽来"],
    [/微笑|笑/, "expression", "轻微微笑"],
    [/回头|回眸/, "expression", "回眸"],
    [/自信/, "expression", "自信"],
    [/忧郁|难过|悲伤/, "expression", "忧郁"],
    [/神秘/, "expression", "神秘"],
    [/害羞/, "expression", "害羞偏头"],
    [/看镜头|直视镜头/, "expression", "看向镜头"],
    [/靠窗/, "pose", "靠窗站立"],
    [/站立|站着/, "pose", "自然站立"],
    [/坐着|坐姿/, "pose", "坐在椅子上"],
    [/行走|走动|走路/, "pose", "向前行走"],
    [/躺着|平躺/, "pose", "仰卧"],
    [/白衬衫|衬衫/, "outfit", "白色宽松衬衫"],
    [/西装/, "outfit", "黑色修身西装"],
    [/连衣裙|长裙/, "outfit", "极简连衣裙"],
    [/晚礼服/, "outfit", "丝质晚礼服"],
    [/旗袍/, "outfit", "改良旗袍"],
    [/汉服/, "outfit", "汉服长袍"],
    [/浴衣/, "outfit", "和风浴衣"],
    [/浴袍/, "outfit", "白色浴袍"],
    [/牛仔/, "outfit", "牛仔夹克"],
    [/风衣/, "outfit", "长风衣"],
    [/针织/, "outfit", "灰色针织衫"],
    [/卫衣/, "outfit", "连帽卫衣"],
    [/睡衣/, "outfit", "缎面睡衣套装"],
    [/皮衣|机车/, "outfit", "皮质机车夹克"],
    [/长发/, "hairStyle", "黑色长直发"],
    [/短发/, "hairStyle", "齐肩短发"],
    [/马尾/, "hairStyle", "高马尾"],
    [/卷发/, "hairStyle", "卷发"],
    [/温暖|温馨/, "mood", "温暖"],
    [/孤独|寂寞/, "mood", "孤独"],
    [/宁静|安静/, "mood", "宁静"],
    [/浪漫/, "mood", "浪漫"],
    [/紧张/, "mood", "紧张"],
    [/未来感/, "mood", "未来感"],
    [/梦幻/, "mood", "梦幻"],
    [/高级感/, "mood", "高级感"],
    [/竖版|海报|封面/, "aspectRatio", "4:5 竖版人像"],
    [/横版|宽屏/, "aspectRatio", "16:9 电影横向"],
    [/方形|方图/, "aspectRatio", "1:1 方形"],
    [/金发|blonde/i, "hairColor", "金色"],
    [/银发|白发/, "hairColor", "银灰"],
    [/红发|红棕/, "hairColor", "红棕"],
    [/黑发|黑长直/, "hairColor", "自然黑"],
    [/蓝眼/, "eyes", "蓝色眼睛"],
    [/绿眼/, "eyes", "绿色眼睛"],
    [/灰眼/, "eyes", "灰色眼睛"],
    [/棕眼|褐眼/, "eyes", "深棕眼"],
    [/圆脸/, "face", "圆脸"],
    [/方脸/, "face", "方脸"],
    [/酒窝/, "face", "酒窝"],
    [/雀斑/, "face", "雀斑"],
    [/下颌线|下颌骨/, "face", "下颌线清晰"],
    [/混血/, "appearance", "多元混血外貌"],
    [/日韩|韩国|日本/, "appearance", "日韩外貌"],
    [/北欧/, "appearance", "北欧外貌"],
    [/地中海/, "appearance", "地中海外貌"]
  ];

  const SENTENCE_MAX_FIELDS = 8;
  let sentenceSnapshot = null;

  function sentenceOption(field, value) {
    const key = FIELD_TO_OPTIONS[field];
    if (!key) return null;
    return (O[key] || []).find((item) => item.zh === value || item.en === value) || null;
  }

  function sentenceFieldLabel(field) {
    const wrap = $(field)?.closest("label");
    const span = wrap ? wrap.querySelector("span") : null;
    return span ? span.textContent.trim() : field;
  }

  function sentenceCandidates(text) {
    const lower = String(text || "").trim().toLowerCase();
    if (!lower) return [];
    const picked = new Map();
    const put = (field, en, zh, score, via) => {
      if (!en) return;
      const prev = picked.get(field);
      if (!prev || score > prev.score) picked.set(field, { field, en, zh, score, via });
    };

    // 1) 关键词提示（同义词）
    for (const [re, field, target] of SENTENCE_HINTS) {
      if (!re.test(lower)) continue;
      if (field === "subjectType") {
        put(field, target, target, 100 + String(target).length, "hint");
      } else {
        const item = sentenceOption(field, target);
        if (item) put(field, item.en, item.zh, 100 + item.zh.length, "hint");
      }
    }

    // 2) 字面匹配：整条标签出现在句子里（强），或句子片段出现在标签里（弱，需 >=3 字）
    const grams = new Set();
    for (const run of lower.match(/[\u4e00-\u9fa5]{3,}/g) || []) {
      for (let n = 3; n <= 4; n += 1) {
        for (let i = 0; i + n <= run.length; i += 1) grams.add(run.slice(i, i + n));
      }
    }
    const words = lower.match(/[a-z]{4,}/g) || [];
    for (const [field, key] of Object.entries(FIELD_TO_OPTIONS)) {
      for (const item of O[key] || []) {
        if (!item.en || !item.zh) continue;
        if (item.adultOnly && contentScale() === "sfw") continue; // 日常档不主动预填成人向
        if (lower.includes(item.zh)) {
          put(field, item.en, item.zh, 60 + item.zh.length, "label");
          continue;
        }
        let best = 0;
        let via = "";
        for (const gram of grams) {
          if (item.zh.includes(gram) && gram.length > best) {
            best = gram.length;
            via = gram;
          }
        }
        for (const word of words) {
          if (item.en.toLowerCase().includes(word) && word.length > best) {
            best = word.length;
            via = word;
          }
        }
        if (best >= 3) put(field, item.en, item.zh, best, via);
      }
    }

    // 3) 人数不匹配的不要（单人主体不预填“成对”类选项）
    const subject = picked.get("subjectType")?.en || currentSubjectType();
    const limit = subject === "couple" ? 2 : subject === "group" ? 3 : 1;
    const fits = (item) => {
      const option = sentenceOption(item.field, item.en);
      return !option || (option.people || 1) <= limit;
    };
    let sorted = [...picked.values()].filter(fits).sort((a, b) => b.score - a.score);

    // 4) 弱匹配如果只是被强匹配的片段包含（例如“浅景深背景”里的“浅景深”），丢掉
    const strong = sorted.filter((item) => item.score >= 60);
    sorted = sorted.filter((item) => {
      if (item.score >= 60) return true;
      if (item.zh && item.zh.length > item.score + 1) return false; // 只匹配到标签的一小段，可信度低
      return !strong.some((s) => s.zh && s.zh.includes(item.via));
    });

    const subjectItem = sorted.find((item) => item.field === "subjectType");
    const others = sorted.filter((item) => item.field !== "subjectType");
    const result = subjectItem ? [subjectItem, ...others] : others;
    return result.slice(0, SENTENCE_MAX_FIELDS);
  }

  function renderSentenceChips(items) {
    const root = $("sentenceChips");
    root.innerHTML = "";
    for (const item of items) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "sentence-chip";
      chip.title = "点击取消这一项";
      const label = sentenceFieldLabel(item.field);
      let valueText = item.zh || item.en;
      if (item.field === "subjectType") {
        const option = [...$("subjectType").options].find((entry) => entry.value === item.en);
        if (option) valueText = option.textContent;
      }
      chip.textContent = `${label} · ${valueText}`;
      chip.addEventListener("click", () => {
        const snapshot = sentenceSnapshot ? sentenceSnapshot[item.field] : undefined;
        if (snapshot !== undefined) {
          if (item.field === "subjectType") {
            $("subjectType").value = snapshot;
            refreshSelectsForSubject();
          } else {
            setSelectValue(item.field, snapshot);
          }
        }
        chip.disabled = true;
        chip.classList.add("removed");
        updateVisibility();
        updateOutput();
        saveAutosave();
      });
      root.append(chip);
    }
  }

  function applySentence(items) {
    if (!items.length) return;
    sentenceSnapshot = collectState();
    const subject = items.find((item) => item.field === "subjectType");
    if (subject) {
      $("subjectType").value = subject.en;
      refreshSelectsForSubject();
    }
    for (const item of items) {
      if (item.field === "subjectType") continue;
      setSelectValue(item.field, item.en);
    }
    resolveConflicts(null);
    if (items.some((item) => item.field === "aspectRatio")) syncSizeFromAspectRatio();
    updateVisibility();
    updateOutput();
    saveAutosave();
    renderSentenceChips(items);
    $("sentenceEmpty").hidden = true;
    $("sentenceResult").hidden = false;
    $("sentenceSummary").textContent = items.length >= SENTENCE_MAX_FIELDS
      ? `已预填 ${items.length} 个字段（最多 ${SENTENCE_MAX_FIELDS} 项，点下面的标签可单项取消）`
      : `已预填 ${items.length} 个字段（点标签可单项取消）`;
  }

  // 当前主体能容纳的人数上限：单人 1、双人 2、群像不限
  function currentSubjectType() {
    return $("subjectType")?.value || "person";
  }

  function subjectPeopleLimit() {
    const type = currentSubjectType();
    if (type === "couple") return 2;
    if (type === "group") return 3;
    return 1;
  }

  function getOptionPairs(field) {
    const key = FIELD_TO_OPTIONS[field];
    const list = O[key] || [];
    const mergeKey = ADULT_OPTION_MERGES[field];
    const merged = mergeKey ? [...list, ...(O[mergeKey] || []).filter((item) => item.en)] : list;
    const unique = [...new Map(merged.map((item) => [item.en.toLowerCase(), item])).values()];
    const type = currentSubjectType();
    const limit = subjectPeopleLimit();
    let fits = unique.filter((item) => (item.people || 1) <= limit);
    // 双人主体时，性别只保留“成对”选项，避免拼出一个人的描述
    if (field === "gender" && type === "couple") {
      const pairOnly = fits.filter((item) => item.people === 2);
      if (pairOnly.length) fits = pairOnly;
    }
    // 成人向条目不隐藏，只是排到最后并归入「成人向 · 18+」分组
    return [...fits.filter((item) => !item.adultOnly), ...fits.filter((item) => item.adultOnly)];
  }

  // 主体类型变了，所有下拉要重算（原来能选的“成对”选项要消失）
  function refreshSelectsForSubject() {
    for (const field of Object.keys(FIELD_TO_OPTIONS)) {
      fillSelect(field, getOptionPairs(field));
    }
  }

  function fillSelect(id, items, placeholder) {
    const select = $(id);
    if (!select) return;
    const previous = select.value;
    const hasPlaceholder = placeholder !== undefined;
    const allItems = hasPlaceholder ? [pair(placeholder, ""), ...items] : items;
    const general = allItems.filter((item) => !item.adultOnly);
    const adult = allItems.filter((item) => item.adultOnly);
    select.innerHTML = "";
    const addOption = (parent, item, tagged) => {
      const option = document.createElement("option");
      option.value = item.en;
      option.textContent = tagged ? `·AD ${item.zh}` : item.zh;
      parent.append(option);
    };
    // 按 group 归类；没有 group 的排在最前面
    const groups = new Map();
    for (const item of general) {
      const key = item.group || "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    const adultFirst = contentScale() === "adult";
    const appendAdultGroup = () => {
      if (!adult.length) return;
      const group = document.createElement("optgroup");
      group.label = ADULT_GROUP_LABEL;
      for (const item of adult) addOption(group, item, true);
      select.append(group);
    };
    if (adultFirst) appendAdultGroup();
    if (groups.has("")) {
      for (const item of groups.get("")) addOption(select, item, false);
    }
    for (const [key, items] of groups) {
      if (!key) continue;
      const group = document.createElement("optgroup");
      group.label = key;
      for (const item of items) addOption(group, item, false);
      select.append(group);
    }
    if (!adultFirst) appendAdultGroup();
    if ([...select.options].some((option) => option.value === previous)) {
      select.value = previous;
    } else if (select.options.length) {
      select.selectedIndex = 0;
    }
    syncCombo(id);
  }

  function populateSelects({ preserve = true } = {}) {
    const modelSelect = $("model");
    const oldModel = modelSelect.value;
    modelSelect.innerHTML = "";
    for (const [key, model] of Object.entries(MODELS)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = model.label;
      modelSelect.append(option);
    }
    modelSelect.value = preserve && MODELS[oldModel] ? oldModel : DEFAULTS.model;
    syncCombo("model");

    for (const field of Object.keys(FIELD_TO_OPTIONS)) {
      fillSelect(field, getOptionPairs(field));
    }

    const qualityGroup = $("qualityChips");
    qualityGroup.innerHTML = "";
    for (const item of O.qualityChips) {
      const label = document.createElement("label");
      label.className = "quality-chip";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item.en;
      checkbox.dataset.quality = "true";
      const text = document.createElement("span");
      text.textContent = item.zh;
      label.append(checkbox, text);
      qualityGroup.append(label);
    }
  }

  function setSelectValue(id, value) {
    const select = $(id);
    if (!select) return;
    if ([...select.options].some((option) => option.value === value)) {
      select.value = value;
    }
    syncCombo(id);
  }

  // ---------- 可搜索下拉 ----------
  // 原生 select 仍然是“真相”，只是被隐藏；外面套一个能搜索的输入框 + 列表。
  const combos = new Map();

  function comboEntries(select, query, overrides) {
    const q = String(query || "").trim().toLowerCase();
    const entries = [];
    const match = (text, value) =>
      !q || String(text).toLowerCase().includes(q) || String(value || "").toLowerCase().includes(q);
    for (const child of select.children) {
      if (child.tagName === "OPTGROUP") {
        const options = [...child.children].filter((option) => match(option.textContent, option.value));
        if (!options.length) continue;
        // 分组默认全部展开（不再需要多点一次）；用户手动点分组标题才收起
        const fallbackOpen = true;
        const isOpen = overrides && overrides.has(child.label) ? overrides.get(child.label) : fallbackOpen;
        if (!q) entries.push({ group: child.label, collapsed: !isOpen, count: options.length });
        if (q || isOpen) {
          for (const option of options) entries.push({ value: option.value, text: option.textContent });
        }
      } else if (child.tagName === "OPTION") {
        if (match(child.textContent, child.value)) {
          entries.push({ value: child.value, text: child.textContent });
        }
      }
    }
    return entries.slice(0, 240);
  }

  function syncCombo(field) {
    const combo = combos.get(field);
    if (!combo) return;
    const selected = combo.select.selectedOptions[0];
    const text = selected ? selected.textContent : "";
    combo.input.value = text;
    combo.input.title = text;
  }

  function syncAllCombos() {
    for (const field of combos.keys()) syncCombo(field);
  }

  function setComboActive(field, index) {
    const combo = combos.get(field);
    if (!combo) return;
    const rows = [...combo.list.querySelectorAll(".combo-option")];
    rows.forEach((row) => row.classList.remove("is-active"));
    const entry = combo.items[index];
    if (!entry || entry.group) {
      combo.active = -1;
      return;
    }
    combo.active = index;
    const target = rows.find((row) => row.dataset.comboValue === entry.value);
    if (target) {
      target.classList.add("is-active");
      target.scrollIntoView({ block: "nearest" });
    }
  }

  function renderComboList(field, query) {
    const combo = combos.get(field);
    if (!combo) return;
    combo.list.innerHTML = "";
    combo.query = String(query || "");
    // 当前选中项所在的分组，打开时自动展开
    const selectedOption = combo.select.selectedOptions[0];
    if (selectedOption && selectedOption.parentElement && selectedOption.parentElement.tagName === "OPTGROUP") {
      const label = selectedOption.parentElement.label;
      if (combo.overrides.get(label) === false) combo.overrides.set(label, true);
    }
    combo.items = comboEntries(combo.select, combo.query, combo.overrides);
    if (!combo.items.length) {
      const empty = document.createElement("div");
      empty.className = "combo-empty";
      empty.textContent = "没有匹配的选项";
      combo.list.append(empty);
      combo.active = -1;
      return;
    }
    combo.items.forEach((entry, index) => {
      const row = document.createElement("div");
      if (entry.group) {
        row.className = "combo-group";
        row.dataset.comboGroup = entry.group;
        row.textContent = entry.collapsed
          ? `${entry.group} ▸ ${entry.count} 项`
          : `${entry.group} ▾`;
      } else {
        row.className = "combo-option";
        row.textContent = entry.text;
        row.dataset.comboValue = entry.value;
        row.dataset.index = String(index);
      }
      combo.list.append(row);
    });
    const current = combo.items.findIndex((entry) => !entry.group && entry.value === combo.select.value);
    if (current >= 0) setComboActive(field, current);
  }

  function closeCombo(field) {
    const combo = combos.get(field);
    if (!combo || !combo.open) return;
    combo.open = false;
    combo.list.hidden = true;
    combo.input.setAttribute("aria-expanded", "false");
    combo.input.readOnly = true;
    combo.input.classList.remove("is-editing");
    syncCombo(field);
  }

  function closeAllCombos(except) {
    for (const field of combos.keys()) {
      if (field !== except) closeCombo(field);
    }
  }

  function openCombo(field, query) {
    const combo = combos.get(field);
    if (!combo) return;
    closeAllCombos(field);
    combo.open = true;
    combo.list.hidden = false;
    combo.input.setAttribute("aria-expanded", "true");
    renderComboList(field, query);
  }

  function chooseCombo(field, value) {
    const combo = combos.get(field);
    if (!combo) return;
    const options = [...combo.select.options];
    if (options.some((option) => option.value === value)) {
      combo.select.value = value;
    } else {
      // 选项被重建/过滤掉时兜底：按标签文本再找一次
      const byText = options.find((option) => option.textContent === value);
      if (!byText) {
        closeCombo(field);
        return;
      }
      combo.select.value = byText.value;
    }
    syncCombo(field);
    closeCombo(field);
    combo.input.blur();
    combo.select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function enhanceSelect(select) {
    if (!select || select.dataset.comboReady === "1") return;
    const field = select.id;
    if (!field) return;
    select.dataset.comboReady = "1";
    const wrap = document.createElement("div");
    wrap.className = "combo";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "combo-input";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");
    input.readOnly = true;
    const list = document.createElement("div");
    list.className = "combo-list";
    list.hidden = true;
    list.setAttribute("role", "listbox");
    select.parentNode.insertBefore(wrap, select);
    wrap.append(input, list, select);
    select.classList.add("combo-native");
    select.tabIndex = -1;
    const combo = { field, select, wrap, input, list, open: false, active: -1, items: [], overrides: new Map(), query: "" };
    combos.set(field, combo);
    syncCombo(field);

    input.addEventListener("focus", () => {
      openCombo(field, "");
    });
    input.addEventListener("input", () => openCombo(field, input.value));
    input.addEventListener("keydown", (event) => {
      // 只有真正开始打字时才进入编辑状态（平时像一个按钮，不出现文本光标）
      const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
      const erasing = event.key === "Backspace" || event.key === "Delete";
      if ((printable || erasing) && input.readOnly) {
        input.readOnly = false;
        input.classList.add("is-editing");
        input.select();
        openCombo(field, "");
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!combo.open) openCombo(field, "");
        const step = event.key === "ArrowDown" ? 1 : -1;
        let index = combo.active;
        for (let i = 0; i < combo.items.length; i += 1) {
          index += step;
          if (index < 0) index = combo.items.length - 1;
          if (index >= combo.items.length) index = 0;
          if (!combo.items[index].group) break;
        }
        setComboActive(field, index);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const entry = combo.items[combo.active];
        if (entry && !entry.group) chooseCombo(field, entry.value);
        else closeCombo(field);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeCombo(field);
        input.blur();
      }
    });
    input.addEventListener("click", () => {
      if (!combo.open) openCombo(field, "");
    });
    input.addEventListener("blur", () => window.setTimeout(() => closeCombo(field), 120));
    list.addEventListener("mousedown", (event) => event.preventDefault());
    list.addEventListener("click", (event) => {
      // 列表在 label 内部：必须阻止默认行为，否则点选项会把焦点踢回输入框、立刻重新展开
      event.preventDefault();
      event.stopPropagation();
      const groupRow = event.target.closest("[data-combo-group]");
      if (groupRow) {
        const label = groupRow.getAttribute("data-combo-group");
        const current = combo.overrides.has(label)
          ? combo.overrides.get(label)
          : label !== ADULT_GROUP_LABEL || contentScale() !== "sfw";
        combo.overrides.set(label, !current);
        renderComboList(field, combo.query);
        return;
      }
      const row = event.target.closest("[data-combo-value]");
      if (row) chooseCombo(field, row.getAttribute("data-combo-value"));
    });
  }

  function enhanceAllSelects() {
    for (const select of $$(".form-card select")) enhanceSelect(select);
    document.addEventListener("click", (event) => {
      for (const combo of combos.values()) {
        if (combo.open && !combo.wrap.contains(event.target)) closeCombo(combo.field);
      }
    });
  }

  function selectedPair(field, lang = "en") {
    const select = $(field);
    if (!select) return "";
    const value = select.value;
    const options = getOptionPairs(field);
    const item = options.find((option) => option.en === value);
    if (!item || !item.en) return "";
    return item?.[lang] || value;
  }

  function inputValue(id) {
    return $(id)?.value?.trim() || "";
  }

  function collectState() {
    const state = {};
    $$("[data-state]").forEach((element) => {
      state[element.id] = element.type === "checkbox" ? element.checked : element.value;
    });
    state.quality = $$("[data-quality]:checked").map((element) => element.value);
    return state;
  }

  function applyState(state, { generate = true } = {}) {
    if (!state) return;
    // 先切主体类型，否则双人预设里的“成对”选项会因为还没重算而下拉里不存在
    if (state.subjectType) $("subjectType").value = state.subjectType;
    populateSelects();

    $$("[data-state]").forEach((element) => {
      if (state[element.id] === undefined) return;
      if (element.type === "checkbox") {
        element.checked = Boolean(state[element.id]);
      } else if (element.tagName === "SELECT") {
        // 只设置仍然存在的选项，避免词库变动后把下拉设成空值
        const value = String(state[element.id]);
        if ([...element.options].some((option) => option.value === value)) element.value = value;
      } else {
        element.value = String(state[element.id]);
      }
    });

    const qualityValues = new Set(Array.isArray(state.quality) ? state.quality : []);
    $$("[data-quality]").forEach((checkbox) => {
      checkbox.checked = qualityValues.has(checkbox.value);
    });
    // 尺度可能随状态变化（成人向要把成人向分组排到最前）
    refreshSelectsForSubject();
    syncAllCombos();
    syncScaleSwitch();
    updateVisibility();
    if (generate) updateOutput();
  }

  function applyDefaults() {
    populateSelects({ preserve: false });
    for (const [id, value] of Object.entries(DEFAULTS)) {
      const element = $(id);
      if (!element) continue;
      if (element.type === "checkbox") {
        element.checked = Boolean(value);
      } else {
        element.value = String(value);
      }
    }
    $("customModelName").value = "";
    $("customFormat").value = "natural";
    $("characterCustom").value = "";
    $("objectDescription").value = "";
    $("customDetails").value = "";
    $("customNegative").value = "";
    $$("[data-quality]").forEach((checkbox) => {
      checkbox.checked = ["natural skin texture", "sharp focus", "realistic fabric folds", "cinematic atmosphere"].includes(checkbox.value);
    });
    syncAllCombos();
    syncScaleSwitch();
    applyContentScale();
    updateVisibility();
  }

  // 每个模型的工程参数（来自本机模型参数表：分辨率 / 词数 / 负面通道 / 机位约束 / 自动触发词）
  const MODEL_TUNING = {
    zimage_turbo: { size: [1024, 1024], file: "z_image_turbo_bf16.safetensors", loras: ["主 LoRA（0.8）"] },
    zimage_int8: { size: [1024, 1024], file: "z_image_int8_convrot.safetensors", loras: ["主 LoRA（0.8）"] },
    flux2: { size: [1024, 1024], file: "flux-2-klein-4b-fp8.safetensors" },
    moss: { size: [1024, 1024], trigger: "moss_xvstyle", file: "moss_image_sft_int8_convrot.safetensors", loras: ["Moss xvstyle LoRA（0.8）"] },
    moss_edit: { size: [1024, 1024], file: "moss_image_sft_int8_convrot.safetensors" },
    h3_t2v: { size: [864, 480], minWords: 120, maxWords: 280, noNegative: true, cameraLocked: true, trigger: "hmmotion", file: "minimax_h3_fl2va_pruned_w6a8.safetensors" },
    h3_i2v: { size: [864, 480], minWords: 120, maxWords: 280, noNegative: true, cameraLocked: true, trigger: "hmmotion", file: "minimax_h3_fl2va_pruned_w6a8.safetensors" },
    h3_fast: { size: [864, 480], minWords: 120, maxWords: 280, noNegative: true, cameraLocked: true, trigger: "hmmotion", file: "minimax_h3_fl2va_pruned_w6a8.safetensors", loras: ["MiniMaxH3 turbo 4-step 加速 LoRA"] },
    wan_ti2v_5b: { size: [768, 768], cameraLocked: true, maxWords: 180, file: "wan2.2_ti2v_5B_fp16.safetensors", loras: ["lightx2v 4 步加速 LoRA"] },
    wan_i2v_a14b: { size: [640, 640], cameraLocked: true, maxWords: 180, file: "Wan2.2-I2V-A14B High/Low Q4_K_M.gguf", loras: ["lightx2v 4 步加速 LoRA（high / low 两份）"] },
    wan_i2v_fast: { size: [640, 640], cameraLocked: true, maxWords: 180, file: "Wan2.2-I2V-A14B High/Low Q4_K_M.gguf", loras: ["lightx2v 4 步加速 LoRA（high / low 两份）"] }
  };

  function getModel() {
    const key = $("model").value || DEFAULTS.model;
    const base = MODELS[key] || MODELS[DEFAULTS.model];
    const tuning = MODEL_TUNING[key] || {};
    if (key !== "custom") return { key, ...base, ...tuning };

    const format = $("customFormat").value;
    const type = format === "h3" || format === "i2v" ? "video" : "image";
    return {
      key,
      ...base,
      ...tuning,
      format,
      type,
      i2v: format === "i2v",
      label: inputValue("customModelName") || "我的自定义模型",
      note: type === "video"
        ? "自定义视频模型会使用所选结构；请确认模型实际支持的时长和运镜描述。"
        : "自定义图像模型会按所选输出结构拼接；建议先小分辨率测试。"
    };
  }

  // ---------- 画面尺寸（像素） ----------
  const IMAGE_SIZE_PRESETS = [
    [1024, 1024, "1:1 方图"],
    [1024, 1280, "4:5 竖版"],
    [1280, 1024, "5:4 横版"],
    [832, 1216, "2:3 竖版"],
    [1216, 832, "3:2 横版"],
    [896, 1152, "竖版近似"],
    [1152, 896, "横版近似"],
    [768, 1344, "9:16 竖屏"],
    [1344, 768, "16:9 宽屏"],
    [1024, 768, "4:3 经典"],
    [768, 1024, "3:4 竖版经典"],
    [1024, 1536, "2:3 竖长"],
    [1536, 1024, "3:2 横长"],
    [1536, 960, "16:10 宽屏"],
    [1344, 576, "21:9 超宽"],
    [512, 512, "小图草稿"]
  ];
  const VIDEO_SIZE_PRESETS = [
    [832, 480, "16:9 标清"],
    [480, 832, "9:16 竖屏"],
    [1280, 720, "16:9 HD"],
    [720, 1280, "9:16 HD"],
    [1024, 576, "16:9"],
    [576, 1024, "9:16"]
  ];
  const RATIO_TARGETS = [
    [1, "1:1 方形"],
    [0.8, "4:5 竖版人像"],
    [1.5, "3:2 横向摄影"],
    [16 / 9, "16:9 电影横向"],
    [9 / 16, "9:16 竖屏视频"],
    [2.39, "2.39:1 宽银幕"],
    [4 / 3, "4:3 经典比例"],
    [3 / 4, "3:4 竖版经典"],
    [2 / 3, "2:3 竖版人像"],
    [5 / 4, "5:4 中画幅"],
    [16 / 10, "16:10 宽屏"],
    [21 / 9, "21:9 超宽银幕"]
  ];
  const COMMON_RATIOS = [
    [1, "1:1"],
    [0.8, "4:5"],
    [1.25, "5:4"],
    [1.5, "3:2"],
    [2 / 3, "2:3"],
    [4 / 3, "4:3"],
    [0.75, "3:4"],
    [16 / 9, "16:9"],
    [9 / 16, "9:16"],
    [2.39, "2.39:1"],
    [16 / 10, "16:10"],
    [21 / 9, "21:9"]
  ];

  function ratioLabel(width, height) {
    const ratio = width / height;
    let best = null;
    for (const [value, label] of COMMON_RATIOS) {
      const diff = Math.abs(ratio - value) / value;
      if (diff <= 0.03 && (!best || diff < best.diff)) best = { diff, label };
    }
    if (best) return best.label;
    const g = gcd(width, height);
    return `${Math.round(width / g)}:${Math.round(height / g)}`;
  }

  let sizeTouched = false;

  function currentSizePresets() {
    return getModel().type === "video" ? VIDEO_SIZE_PRESETS : IMAGE_SIZE_PRESETS;
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      [x, y] = [y, x % y];
    }
    return x || 1;
  }

  function getSize() {
    const width = Math.round(Number($("imageWidth")?.value) || 0);
    const height = Math.round(Number($("imageHeight")?.value) || 0);
    return { width, height, ratio: width && height ? ratioLabel(width, height) : "" };
  }

  function updateSizeHint() {
    const hint = $("sizeHint");
    if (!hint) return;
    const { width, height, ratio } = getSize();
    if (!width || !height) {
      hint.textContent = "宽高都需要填写（256–4096）";
      return;
    }
    const parts = [`${width} × ${height}`, ratio];
    if (width < 256 || height < 256 || width > 4096 || height > 4096) parts.push("超出 256–4096 范围");
    else if (width % 64 || height % 64) parts.push("建议宽高取 64 的倍数");
    if (width * height > 2048 * 2048) parts.push("像素量偏大");
    hint.textContent = parts.join(" · ");
  }

  function syncSizePreset() {
    const select = $("sizePreset");
    if (!select) return;
    const { width, height } = getSize();
    const match = currentSizePresets().find(([w, h]) => w === width && h === height);
    select.value = match ? `${match[0]}x${match[1]}` : "";
    syncCombo("sizePreset");
    updateSizeHint();
  }

  function updateSizePresets() {
    const select = $("sizePreset");
    if (!select) return;
    select.innerHTML = "";
    const custom = document.createElement("option");
    custom.value = "";
    custom.textContent = "自定义";
    select.append(custom);
    for (const [w, h, note] of currentSizePresets()) {
      const option = document.createElement("option");
      option.value = `${w}x${h}`;
      option.textContent = `${w} × ${h}（${note}）`;
      select.append(option);
    }
    syncSizePreset();
  }

  function setSize(width, height, { syncRatio = true } = {}) {
    const w = $("imageWidth");
    const h = $("imageHeight");
    if (!w || !h) return;
    w.value = String(width);
    h.value = String(height);
    syncSizePreset();
    if (syncRatio) syncAspectRatioFromSize();
  }

  function syncAspectRatioFromSize() {
    const { width, height } = getSize();
    if (!width || !height) return;
    const ratio = width / height;
    let best = null;
    for (const [target, zh] of RATIO_TARGETS) {
      const diff = Math.abs(ratio - target) / target;
      if (diff <= 0.04 && (!best || diff < best.diff)) best = { diff, zh };
    }
    if (!best) {
      setSelectValue("aspectRatio", "");
      return;
    }
    const option = (O.aspectRatio || []).find((item) => item.zh === best.zh);
    if (option) setSelectValue("aspectRatio", option.en);
  }

  // ---------- 分步向导 ----------
  const WIZARD_STEPS = [
    ["section-model", "01", "模型"],
    ["section-character", "02", "角色"],
    ["section-outfit", "03", "服装"],
    ["section-action", "04", "动作"],
    ["section-scene", "05", "场景"],
    ["section-camera", "06", "镜头"],
    ["section-style", "07", "风格"]
  ];
  let wizardIndex = 0;

  function renderWizard() {
    const root = $("wizardSteps");
    if (!root) return;
    root.innerHTML = "";
    WIZARD_STEPS.forEach(([, num, label], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wizard-step";
      button.setAttribute("role", "tab");
      button.dataset.index = String(index);
      const number = document.createElement("span");
      number.className = "wizard-step-num";
      number.textContent = num;
      const text = document.createElement("span");
      text.className = "wizard-step-label";
      text.textContent = label;
      button.append(number, text);
      button.addEventListener("click", () => goToWizardStep(index));
      root.append(button);
    });
    applyWizardStep();
  }

  function applyWizardStep() {
    WIZARD_STEPS.forEach(([id], index) => {
      const section = $(id);
      if (section) section.classList.toggle("is-active", index === wizardIndex);
    });
    $$("#wizardSteps .wizard-step").forEach((button, index) => {
      const active = index === wizardIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    const prev = $("wizardPrev");
    const next = $("wizardNext");
    if (prev) prev.disabled = wizardIndex === 0;
    if (next) next.textContent = wizardIndex === WIZARD_STEPS.length - 1 ? "完成并检查" : "下一步";
  }

  function goToWizardStep(index) {
    wizardIndex = Math.max(0, Math.min(WIZARD_STEPS.length - 1, index));
    storageSet("promptStudio.wizardStep.v1", wizardIndex);
    applyWizardStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- 选项冲突规则 ----------
  // 结构：[字段A, 匹配A, 字段B, 匹配B, 自动修正目标, 说明]
  const CONFLICT_RULES = [
    ["timeOfDay", /^(night|late night)$/, "lighting", /^warm golden-hour sunlight$/, ["lighting", "low-key cinematic lighting"], "夜晚不搭配黄金时刻阳光，光线已改为低调电影光"],
    ["timeOfDay", /^(midday|late morning)$/, "lighting", /^warm golden-hour sunlight$/, ["lighting", "high-key soft lighting"], "白天正午不搭配黄金时刻，光线已改为高调柔光"],
    ["timeOfDay", /^warm indoor lighting$/, "lighting", /^(warm golden-hour sunlight|soft overcast diffusion)$/, ["lighting", "warm practical lamp light"], "室内暖光场景已把室外光改为暖色实用光"],
    ["shotSize", /^(wide shot|full-body shot|environmental portrait)$/, "composition", /^intimate close framing$/, ["composition", "rule-of-thirds composition"], "远景不搭配私密特写构图，构图已改为三分法"],
    ["shotSize", /^(extreme close-up|close-up portrait)$/, "composition", /^generous negative space$/, ["composition", "intimate close framing"], "特写不搭配大面积留白，构图已改为私密近景"],
    ["pose", /^(lying|reclining|half-lying|seated|sitting|kneeling)/, "action", /^(walking with natural motion|taking one deliberate step forward|spinning in a controlled dance movement|slowly turning around)$/, ["action", "subtle breathing and natural blinking"], "卧/坐/跪姿不搭配行走类动作，动作已改为自然呼吸"],
    ["pose", /^(standing|walking)/, "action", /^slowly sitting up$/, ["action", "subtle breathing and natural blinking"], "站姿不搭配“起身”动作，动作已改为自然呼吸"],
    ["pose", /^(?!lying|reclining|half-lying)/, "bodyOrientation", /^lying on one side and facing the camera$/, ["bodyOrientation", "three-quarter view from the front left"], "站/坐姿不搭配躺卧朝向，朝向已改为四分之三侧面"],
    ["bodyOrientation", /^viewed from behind$/, "gaze", /^(direct eye contact with the camera|an unblinking direct look|a slow steady look)$/, ["bodyOrientation", "viewed from behind while looking back"], "背对镜头无法直视镜头，朝向已改为“背对回望”"],
    ["expression", /^looking directly at the camera$/, "gaze", /^looking off-camera$/, ["expression", "calm, natural expression"], "表情与视线方向矛盾，表情已改为平静自然"],
    ["background", /^softly blurred background$/, "depthOfField", /^deep depth of field$/, ["depthOfField", "shallow depth of field"], "背景虚化与大景深矛盾，景深已改为浅景深"],
    ["timeOfDay", /^(midday|late morning)$/, "lighting", /^colorful practical neon lighting$/, ["timeOfDay", "night"], "霓虹光通常出现在夜里，时间已改为夜晚"],
    ["timeOfDay", /^(midday|late morning|afternoon)$/, "lighting", /^candlelight$/, ["lighting", "warm practical lamp light"], "白天正午不搭配烛光，光线已改为暖色实用光"],
    ["lighting", /^warm golden-hour sunlight$/, "timeOfDay", /^blue hour$/, ["lighting", "soft overcast diffusion"], "蓝调时刻与黄金时刻阳光矛盾，光线已改为阴天漫射光"],
    ["footwear", /^barefoot$/, "hosiery", /./, ["footwear", "minimal flats"], "穿了袜子就不能赤足，鞋履已改为平底鞋"],
    ["gaze", /^(eyes gently closed|eyes closed, feeling the light)$/, "expression", /^looking directly at the camera$/, ["expression", "calm, natural expression"], "闭眼状态不搭配“看向镜头”的表情，表情已改为平静自然"],
    ["scene", /beach|city street|forest|mountain cabin|desert road/, "timeOfDay", /^warm indoor lighting$/, ["timeOfDay", "dusk"], "室外场景不搭配室内暖光，时间已改为黄昏"],
    ["bodyOrientation", /^viewed from behind$/, "expression", /^looking directly at the camera$/, ["bodyOrientation", "viewed from behind while looking back"], "背对镜头看不到“看向镜头”的表情，朝向已改为背对回望"]
  ];

  function currentFieldValue(field) {
    return $(field)?.value || "";
  }

  function detectConflicts() {
    return CONFLICT_RULES.filter(
      ([fieldA, testA, fieldB, testB]) => testA.test(currentFieldValue(fieldA)) && testB.test(currentFieldValue(fieldB))
    ).map(([fieldA, testA, fieldB, testB, fix, message]) => ({
      fields: [fieldA, fieldB],
      fixField: fix[0],
      fixValue: fix[1],
      message
    }));
  }

  function optionExists(field, en) {
    const select = $(field);
    return Boolean(select) && [...select.options].some((option) => option.value === en);
  }

  // 改了一个字段后，如果和别的字段打架，自动把“可修正”的一侧改掉
  function resolveConflicts(changedField) {
    const applied = [];
    for (const conflict of detectConflicts()) {
      if (changedField && !conflict.fields.includes(changedField)) continue;
      if (!optionExists(conflict.fixField, conflict.fixValue)) continue;
      if (currentFieldValue(conflict.fixField) === conflict.fixValue) continue;
      setSelectValue(conflict.fixField, conflict.fixValue);
      applied.push(conflict.message);
    }
    if (applied.length) showToast(applied.join("；"));
    return applied;
  }

  // 随机/预填时先判断候选值是否会和当前选择打架
  function conflictsWithValue(field, en) {
    return CONFLICT_RULES.some(([fieldA, testA, fieldB, testB]) => {
      if (field === fieldA) return testA.test(en) && testB.test(currentFieldValue(fieldB));
      if (field === fieldB) return testB.test(en) && testA.test(currentFieldValue(fieldA));
      return false;
    });
  }

  // 手动改「画面比例」时，把像素宽高跟着改到匹配的尺寸，避免比例和像素打架
  const ASPECT_TO_RATIO = {
    "aspect ratio 1:1": 1,
    "aspect ratio 4:5, vertical portrait": 4 / 5,
    "aspect ratio 3:2, horizontal photography": 3 / 2,
    "aspect ratio 16:9, cinematic widescreen": 16 / 9,
    "aspect ratio 9:16, vertical short video": 9 / 16,
    "aspect ratio 2.39:1, anamorphic widescreen": 2.39,
    "aspect ratio 4:3, classic photography": 4 / 3,
    "aspect ratio 3:4, vertical classic": 3 / 4,
    "aspect ratio 2:3, portrait photography": 2 / 3,
    "aspect ratio 5:4, medium format": 5 / 4,
    "aspect ratio 16:10, widescreen": 16 / 10,
    "aspect ratio 21:9, ultrawide cinematic": 21 / 9
  };

  function syncSizeFromAspectRatio() {
    const en = currentFieldValue("aspectRatio");
    const target = ASPECT_TO_RATIO[en];
    if (!target) return;
    const preset = currentSizePresets().find(([w, h]) => Math.abs(w / h - target) / target < 0.02);
    if (preset) {
      setSize(preset[0], preset[1], { syncRatio: false });
      return;
    }
    const area = 1024 * 1024;
    const height = Math.round(Math.sqrt(area / target) / 8) * 8;
    const width = Math.round((height * target) / 8) * 8;
    setSize(width, height, { syncRatio: false });
  }

  function updateVisibility() {
    const model = getModel();
    const subjectType = $("subjectType").value;
    const isCustom = model.key === "custom";

    $$(".custom-only").forEach((element) => {
      element.hidden = !isCustom;
    });
    $$(".video-only").forEach((element) => {
      element.hidden = model.type !== "video";
    });
    $$(".h3-only").forEach((element) => {
      element.hidden = !["h3", "i2v"].includes(model.format);
    });
    const group = subjectGroup();
    for (const field of Object.keys(FIELD_SUBJECT_GROUPS)) {
      const wrap = $(field)?.closest("label");
      if (wrap) wrap.hidden = !fieldAppliesTo(field, group);
    }
    $$(".multi-only").forEach((element) => {
      element.hidden = !["couple", "group"].includes(subjectType);
    });
    $("modeBadge").textContent = model.type === "video" ? "视频" : model.type === "edit" ? "编辑" : "图像";
    updateSizePresets();
    $("outputModel").textContent = model.label;
    $("modelHint").textContent = model.note;
    $("modelSummary").textContent = model.note;

    const notice = $("modelNotice");
    if (model.i2v) {
      notice.textContent = "图生视频模式：人物、服装和构图来自首帧，输出会省略重复的外貌描述，重点描述动作、物理反馈和镜头。";
    } else if (model.format === "h3") {
      notice.textContent = "MiniMax H3 模式：输出包含单一连续镜头、时间段拆分、机位和音频线索。提示词建议 120–280 词；该模型没有负面通道，排除项已写在正面句尾。";
    } else if (model.format === "edit") {
      notice.textContent = "编辑模式：输出会要求保持人物身份、姿势、构图和背景，只修改你选定的目标。";
    } else if (model.key === "custom") {
      notice.textContent = model.note;
    } else {
      notice.textContent = `${model.label} 将使用自然语言结构。所有字段都可留空，页面会自动省略空项。`;
    }

    const negativeHint = $("negativeHint");
    if (negativeHint) {
      negativeHint.textContent = model.noNegative
        ? "该模型没有负面提示词通道：排除项（No text, no watermark, no cuts）已写在正面句尾。"
        : "部分工作流没有负面提示词输入框，可忽略此结果。";
    }

    if (model.trigger) {
      notice.textContent = `${notice.textContent} 已自动附加触发词 ${model.trigger}。`;
    }
    if (model.file) {
      notice.textContent = `${notice.textContent} 模型文件：${model.file}。`;
    }
    if (Array.isArray(model.loras) && model.loras.length) {
      notice.textContent = `${notice.textContent} 建议叠加：${model.loras.join(" / ")}。`;
    }
    const triggerHint = $("loraTriggerHint");
    if (triggerHint) {
      triggerHint.textContent = model.trigger
        ? `该模型会自动在提示词最前面加「${model.trigger}」；这里填了会覆盖它`
        : "只填你自己 LoRA 的触发词，留空则不写入";
    }
  }

  function applyRolePreset() {
    const preset = ROLE_PRESETS[$("rolePreset").value];
    if (!preset) return;
    for (const [id, value] of Object.entries(preset)) {
      setSelectValue(id, value);
    }
  }

  function languageJoin(parts, lang) {
    const clean = parts.map((part) => String(part || "").trim()).filter(Boolean);
    const unique = [...new Map(clean.map((part) => [part.toLowerCase(), part])).values()];
    return unique.join(lang === "zh" ? "，" : ", ");
  }

  function dedupePrompt(text, lang) {
    const separator = lang === "zh" ? /，/ : /,\s*/;
    const joiner = lang === "zh" ? "，" : ", ";
    const parts = text.split(separator);
    const unique = [];
    const seen = new Set();
    for (const part of parts) {
      const clean = part.trim();
      const key = clean.toLowerCase().replace(/[.。;；]+$/g, "");
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(clean);
    }
    return unique.join(joiner);
  }

  function capitalizeSentences(text) {
    return text.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
  }

  function pairText(field, lang) {
    return selectedPair(field, lang);
  }

  function subjectText(lang) {
    const type = $("subjectType").value;
    const custom = inputValue("characterCustom");
    if (type === "object") {
      return inputValue("objectDescription") || (lang === "zh" ? "一个精致的产品主体" : "a carefully designed product");
    }
    if (type === "creature") {
      const creature = pairText("creatureType", lang);
      return lang === "zh"
        ? `一个虚构的${creature}${custom ? `，${custom}` : ""}`
        : `a fictional ${creature}${custom ? `, ${custom}` : ""}`;
    }

    const gender = pairText("gender", lang);
    const details = [
      pairText("age", lang),
      pairText("appearance", lang),
      pairText("body", lang),
      pairText("face", lang),
      pairText("hairStyle", lang),
      pairText("hairColor", lang),
      pairText("eyes", lang),
      pairText("expression", lang),
      pairText("skin", lang),
      custom
    ];
    const detailText = languageJoin(details, lang);
    if (type === "couple") {
      const pairLabel = gender
        .replace(/^two adult /i, "two consenting adult fictional ")
        .replace(/^an adult woman and an adult man$/i, "one adult woman and one adult man");
      return lang === "zh"
        ? `两位明确成年、双方自愿的虚构角色，${gender.replace(/^成对/, "")}${detailText ? `，${detailText}` : ""}`
        : `two consenting adult fictional characters, ${pairLabel}${detailText ? `, ${detailText}` : ""}`;
    }
    if (type === "group") {
      return lang === "zh"
        ? `三位明确成年、彼此尊重的虚构角色，${gender}，视觉中心为${detailText}`
        : `three consenting adult fictional characters, ${gender}, centered on ${detailText}`;
    }
    return lang === "zh"
      ? `一位明确成年的虚构${gender.replace(/^成年/, "")}${detailText ? `，${detailText}` : ""}`
      : `an adult fictional ${gender.replace(/^adult\s+/i, "")}${detailText ? `, ${detailText}` : ""}`;
  }

  function outfitText(lang) {
    const type = $("subjectType").value;
    if (type !== "person" && type !== "couple" && type !== "group") return "";
    const outfit = pairText("outfit", lang);
    const fabric = pairText("fabric", lang);
    const colorValue = pairText("outfitColor", lang);
    const color = colorValue && !outfit.toLowerCase().includes(colorValue.toLowerCase()) ? colorValue : "";
    const fit = pairText("fit", lang);
    const accessories = pairText("accessories", lang);
    const footwear = pairText("footwear", lang);
    const grooming = pairText("grooming", lang);

    const clothes = languageJoin([color, fabric, outfit, fit], lang);
    const details = [];
    if (clothes) details.push(lang === "zh" ? `身穿${clothes}` : `wearing ${clothes}`);
    if (accessories) details.push(lang === "zh" ? `搭配${accessories}` : `styled with ${accessories}`);
    if (footwear) {
      if (footwear.toLowerCase() === "barefoot") {
        details.push(lang === "zh" ? "赤足" : "barefoot");
      } else {
        details.push(lang === "zh" ? `脚穿${footwear}` : `wearing ${footwear}`);
      }
    }
    if (grooming) details.push(lang === "zh" ? `妆发为${grooming}` : grooming);
    const hosiery = pairText("hosiery", lang);
    const hosieryMaterial = pairText("hosieryMaterial", lang);
    if (hosiery) {
      const hosieryText = languageJoin([hosieryMaterial, hosiery], lang);
      details.push(lang === "zh" ? `搭配${hosieryText}` : `with ${hosieryText}`);
    }
    return languageJoin(details, lang);
  }

  function motionText(lang) {
    const subjectType = $("subjectType").value;
    const action = pairText("action", lang);
    const motion = pairText("motionLevel", lang);
    const moving = getModel().type === "video" ? motion : "";
    // 产品/物体没有身体姿势，只保留动作与运动强度
    if (subjectType === "object") return languageJoin([action, moving], lang);
    const pose = pairText("pose", lang);
    const bodyOrientation = pairText("bodyOrientation", lang);
    const gaze = pairText("gaze", lang);
    const handPose = pairText("handPose", lang);
    const legPose = pairText("legPose", lang);
    const postureLine = pairText("postureLine", lang);
    const interaction = pairText("interaction", lang);
    return languageJoin([pose, bodyOrientation, gaze, handPose, legPose, postureLine, action, interaction, moving], lang);
  }

  function sceneText(lang, detailLevel) {
    const scene = pairText("scene", lang);
    const time = pairText("timeOfDay", lang);
    const weather = pairText("weather", lang);
    const props = pairText("props", lang);
    const background = pairText("background", lang);
    const mood = pairText("mood", lang);
    const sceneLower = scene.toLowerCase();
    const timeLower = time.toLowerCase();
    const redundantTime = Boolean(
      sceneLower &&
      timeLower &&
      (sceneLower.includes(timeLower) ||
        (timeLower.includes("morning") && sceneLower.includes("morning")) ||
        (timeLower.includes("night") && sceneLower.includes("night")) ||
        (timeLower.includes("dusk") && sceneLower.includes("dusk")))
    );
    const timeClause = redundantTime ? "" : time;
    return languageJoin(
      detailLevel === "concise"
        ? [scene, timeClause, weather]
        : [scene, timeClause, weather, props, background, mood],
      lang
    );
  }

  function cameraText(lang, detailLevel, includeMovement = true) {
    const shot = pairText("shotSize", lang);
    const angle = pairText("angle", lang);
    const lens = pairText("lens", lang);
    const composition = pairText("composition", lang);
    const depth = pairText("depthOfField", lang);
    const movement = includeMovement ? pairText("cameraMove", lang) : "";
    return languageJoin(
      detailLevel === "concise" ? [shot, angle, lens] : [shot, angle, lens, composition, depth, movement],
      lang
    );
  }

  function lightText(lang, detailLevel) {
    const lighting = pairText("lighting", lang);
    const palette = pairText("palette", lang);
    const atmosphere = pairText("atmosphere", lang);
    const filmLook = pairText("filmLook", lang);
    return languageJoin(
      detailLevel === "concise" ? [lighting] : [lighting, palette, atmosphere, filmLook],
      lang
    );
  }

  function qualityText(lang) {
    const values = $$("[data-quality]:checked").map((checkbox) => {
      return O.qualityChips.find((item) => item.en === checkbox.value)?.[lang] || checkbox.value;
    });
    return languageJoin(values, lang);
  }

  function styleText(lang, detailLevel) {
    const visualStyle = pairText("visualStyle", lang);
    const renderValue = pairText("render", lang);
    const render = /photo/i.test(visualStyle) && /photo/i.test(renderValue) ? "" : renderValue;
    const ratio = pairText("aspectRatio", lang);
    const quality = qualityText(lang);
    return languageJoin(
      detailLevel === "concise" ? [visualStyle] : [visualStyle, render, ratio, quality],
      lang
    );
  }

  function adultDetailsText(lang) {
    const type = $("subjectType").value;
    if (!["person", "couple", "group"].includes(type)) return "";
    return languageJoin([
      pairText("adultArchetype", lang),
      pairText("intimacyLevel", lang)
    ], lang);
  }

  function appendCustom(parts, lang) {
    const custom = inputValue("customDetails");
    if (custom) parts.push(custom);
    return parts;
  }

  function buildImagePrompt(lang, model) {
    const detail = $("detailLevel").value;
    const subject = subjectText(lang);
    const outfit = outfitText(lang);
    const motion = motionText(lang);
    const adultDetails = adultDetailsText(lang);
    const scene = sceneText(lang, detail);
    const camera = cameraText(lang, detail, false);
    const light = lightText(lang, detail);
    const style = styleText(lang, detail);

    if (model.format === "edit") {
      const editTarget = inputValue("customDetails") || motion || pairText("pose", lang);
      const replacement = outfit
        ? lang === "zh"
          ? `将服装替换为${pairText("outfit", lang)}`
          : `replace the outfit with ${pairText("outfit", lang)}`
        : "";
      const sceneInstruction = scene
        ? lang === "zh"
          ? `将环境调整为${scene}`
          : `adjust the environment to ${scene}`
        : "";
      if (lang === "zh") {
        return `编辑提供的图片：${languageJoin([replacement, editTarget, adultDetails, sceneInstruction], "zh")}。严格保持原图人物身份、五官、姿势、镜头角度、透视关系、物体位置、光线方向和背景结构；匹配纹理、色温、颗粒与边缘融合，使结果像同一张原始照片。`;
      }
      return `Edit the provided image: ${languageJoin([
        replacement,
        editTarget,
        adultDetails,
        sceneInstruction,
        "strictly preserve the person's identity, facial features, pose, camera angle, perspective, object positions, lighting direction, and background",
        "match texture, color temperature, grain, and edge blending so the result appears as one original photograph"
      ], "en")}.`;
    }

    if (model.format === "tags") {
      return languageJoin(appendCustom([
        qualityText(lang),
        subject,
        outfit,
        motion,
        adultDetails,
        scene,
        camera,
        light,
        pairText("visualStyle", lang),
        pairText("render", lang),
        pairText("aspectRatio", lang)
      ], lang), lang);
    }

    const parts = appendCustom([
      subject,
      outfit,
      motion,
      adultDetails,
      scene,
      camera,
      light,
      style
    ], lang);
    if (lang === "zh") {
      return `生成一幅完整画面：${languageJoin(parts, "zh")}。`;
    }
    return `A visually detailed image of ${languageJoin(parts, "en")}.`;
  }

  function timelineRanges(duration) {
    if (duration <= 3) return [
      [0, 1],
      [1, 2],
      [2, duration]
    ];
    if (duration <= 5) return [
      [0, 1],
      [1, 3],
      [3, duration]
    ];
    if (duration <= 8) return [
      [0, 2],
      [2, 5],
      [5, duration]
    ];
    return [
      [0, 2],
      [2, 7],
      [7, duration]
    ];
  }

  function buildH3Prompt(lang, model) {
    const duration = Number($("duration").value) || 5;
    const ranges = timelineRanges(duration);
    const pose = pairText("pose", lang);
    const poseDetails = languageJoin([
      pose,
      pairText("bodyOrientation", lang),
      pairText("gaze", lang),
      pairText("handPose", lang),
      pairText("legPose", lang),
      pairText("postureLine", lang)
    ], lang);
    const action = pairText("action", lang);
    const interaction = pairText("interaction", lang);
    const expression = pairText("expression", lang);
    const camera = pairText("cameraMove", lang);
    const sound = pairText("sound", lang);
    const audioMode = pairText("audioMode", lang);
    const voiceTone = pairText("voiceTone", lang);
    const consistency = pairText("consistencyFocus", lang);
    const dialogue = inputValue("dialogueScript").replace(/[。.!！?？\s]+$/g, "");
    const voiceover = inputValue("voiceoverScript").replace(/[。.!！?？\s]+$/g, "");
    const oneSpeaker = $("oneSpeaker").checked && ["couple", "group"].includes($("subjectType").value);
    const style = styleText(lang, "cinematic");
    const light = lightText(lang, "cinematic");
    const scene = sceneText(lang, "cinematic");
    const subject = model.i2v
      ? lang === "zh"
        ? "严格保持参考图中的人物、面部、体型、服装、构图和光线"
        : "keep the same person, face, body proportions, outfit, framing, and lighting as the reference image"
      : subjectText(lang);
    const outfit = model.i2v ? "" : outfitText(lang);
    const adultDetails = adultDetailsText(lang);
    const audioDetails = languageJoin([
      sound,
      audioMode,
      voiceTone,
      oneSpeaker ? (lang === "zh" ? "同一时刻只让一名角色说话" : "only one character speaks at a time") : ""
    ], lang);

    if (lang === "zh") {
      return [
        `电影感单一连续镜头，一镜到底，无剪辑、无转场，${duration}秒，24fps`,
        languageJoin([subject, outfit, adultDetails, `位于${scene}`, `一致性要求：${consistency}`], "zh"),
        `Timeline: [${ranges[0][0]}s-${ranges[0][1]}s] 建立人物与场景，${poseDetails || "自然呼吸与细微动作"}；[${ranges[1][0]}s-${ranges[1][1]}s] ${action || "一个清晰动作"}${interaction ? `，${interaction}` : ""}；[${ranges[2][0]}s-${ranges[2][1]}s] ${camera || "固定机位"}，画面自然收尾`,
        `镜头与光线：${languageJoin([cameraText(lang, "cinematic", false), light], "zh")}`,
        `Audio: ${audioDetails || "自然环境声"}`,
        dialogue ? `台词：${dialogue}` : "",
        voiceover ? `画外音：${voiceover}` : "",
        `风格：${style}`,
        inputValue("customDetails")
      ].filter(Boolean).join("。") + "。无文字、无水印、不切镜。";
    }

    return [
      `Cinematic single continuous shot, one take, no cuts, no transitions, ${duration} seconds at 24fps`,
      languageJoin([subject, outfit, adultDetails, `in ${scene}`, `continuity: ${consistency}`], "en"),
      `Timeline: [${ranges[0][0]}s-${ranges[0][1]}s] establish the subject and environment with ${poseDetails || "subtle natural breathing"}; [${ranges[1][0]}s-${ranges[1][1]}s] ${action || "perform one clear action"}${interaction ? `, ${interaction}` : ""}; [${ranges[2][0]}s-${ranges[2][1]}s] ${camera || "static camera"}, bring the scene to a natural finish`,
      `Camera and lighting: ${languageJoin([cameraText(lang, "cinematic", false), light], "en")}`,
      `Audio: ${audioDetails || "quiet natural environmental ambience"}`,
      dialogue ? `Dialogue: ${dialogue}` : "",
      voiceover ? `Voice-over: ${voiceover}` : "",
      `Style: ${style}`,
      inputValue("customDetails")
    ].filter(Boolean).join(". ") + ". No text, no watermark, no cuts.";
  }

  function buildWanPrompt(lang, model) {
    const duration = Number($("duration").value) || 5;
    const subject = model.i2v
      ? lang === "zh"
        ? "保持参考图同一人物、面部、体型、服装、构图与光线"
        : "keep the same person, face, body proportions, outfit, framing, and lighting as the reference image"
      : subjectText(lang);
    const outfit = model.i2v ? "" : outfitText(lang);
    const motion = motionText(lang);
    const adultDetails = adultDetailsText(lang);
    const scene = sceneText(lang, "balanced");
    const camera = cameraText(lang, "balanced", true);
    const light = lightText(lang, "balanced");
    const style = styleText(lang, "balanced");
    const parts = appendCustom([
      subject,
      outfit,
      motion,
      adultDetails,
      scene,
      camera,
      light,
      style
    ], lang);

    if (lang === "zh") {
      return `生成一段${duration}秒的电影感短视频，只包含一个主要动作：${languageJoin(parts, "zh")}。保持动作连贯、物理反馈真实、人物身份稳定，不切镜。`;
    }
    return `A ${duration}-second cinematic video with one primary action: ${languageJoin(parts, "en")}. Keep the motion continuous, physical secondary motion realistic, identity stable, and camera behavior consistent, with no cuts.`;
  }

  function buildPromptFor(lang, model) {
    if (model.format === "h3" || model.format === "i2v") return buildH3Prompt(lang, model);
    if (model.format === "wan") return buildWanPrompt(lang, model);
    return buildImagePrompt(lang, model);
  }

  function buildNegative(model) {
    const custom = inputValue("customNegative");
    const scale = NEGATIVE_SCALES[contentScale()] || "";
    // H3 没有负面通道：排除项写进正面句尾，负面输出留空并给出提示
    if (model.noNegative) return custom;
    return languageJoin([model.negative, scale, custom], "en");
  }

  // ---------- 我的 LoRA 清单 ----------
  const LORA_CATALOG_VERSION = PS.version || "1";

  function getMyLoras() {
    const list = storageGet("promptStudio.loras.v1", []);
    return Array.isArray(list) ? list : [];
  }

  function mergeLoraCatalog({ force = false } = {}) {
    const markerKey = "promptStudio.loraCatalogVersion.v1";
    if (!force && localStorage.getItem(markerKey) === LORA_CATALOG_VERSION) return getMyLoras();
    const existing = getMyLoras();
    const names = new Set(existing.map((item) => String(item.name || "").toLowerCase()).filter(Boolean));
    const ids = new Set(existing.map((item) => String(item.catalogId || item.id || "")).filter(Boolean));
    const merged = [...existing];
    for (const item of LORA_CATALOG) {
      const nameKey = String(item.name || "").toLowerCase();
      if (ids.has(item.catalogId) || names.has(nameKey)) continue;
      merged.push({
        ...item,
        id: item.catalogId,
        enabled: false
      });
      ids.add(item.catalogId);
      names.add(nameKey);
    }
    storageSet("promptStudio.loras.v1", merged);
    localStorage.setItem(markerKey, LORA_CATALOG_VERSION);
    return merged;
  }

  function saveMyLoras(list) {
    storageSet("promptStudio.loras.v1", list);
    renderLoras();
    updateOutput();
    saveAutosave();
  }

  function enabledLoras() {
    return getMyLoras().filter((item) => item.enabled && String(item.trigger || "").trim());
  }

  function activeLoraTokens(model = getModel()) {
    const tokens = [];
    const push = (value) => {
      const text = String(value || "").trim();
      if (text && !tokens.includes(text)) tokens.push(text);
    };
    push(inputValue("loraTrigger"));
    if (!tokens.length) push(model.trigger);
    for (const item of enabledLoras()) push(item.trigger);
    return tokens;
  }

  function renderLoras() {
    const root = $("loraList");
    if (!root) return;
    root.innerHTML = "";
    const list = getMyLoras();
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "lora-empty";
      empty.textContent = "还没有条目。点右上「＋ 添加」写一条，或先导入清单。";
      root.append(empty);
      return;
    }
    for (const item of list) {
      const row = document.createElement("div");
      row.className = `lora-row${item.enabled ? " is-on" : ""}`;
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(item.enabled);
      checkbox.title = "勾选后拼进提示词";
      checkbox.addEventListener("change", () => {
        const next = getMyLoras().map((entry) =>
          entry.id === item.id ? { ...entry, enabled: checkbox.checked } : entry
        );
        saveMyLoras(next);
      });
      const text = document.createElement("div");
      text.className = "lora-text";
      const title = document.createElement("strong");
      title.textContent = item.name || item.trigger;
      const sub = document.createElement("small");
      sub.textContent = `${item.trigger} · 权重 ${item.weight}`;
      text.append(title, sub);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-button danger";
      remove.textContent = "删除";
      remove.addEventListener("click", () => {
        saveMyLoras(getMyLoras().filter((entry) => entry.id !== item.id));
      });
      row.append(checkbox, text, remove);
      root.append(row);
    }
  }

  // 批量粘贴：每行一条，支持「触发词」「触发词,0.8」「名称,触发词,0.8」
  function parseLoraLines(text) {
    const existing = getMyLoras();
    const seen = new Set(existing.map((item) => item.trigger));
    const added = [];
    for (const raw of String(text || "").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const parts = line.split(/\s*[,，\t|]\s*/).filter((part) => part !== "");
      if (!parts.length) continue;
      let name = "";
      let trigger = "";
      let weight = 0.8;
      if (parts.length === 1) {
        trigger = parts[0];
      } else if (parts.length === 2 && !Number.isNaN(Number(parts[1]))) {
        trigger = parts[0];
        weight = Number(parts[1]);
      } else {
        name = parts[0];
        trigger = parts[1];
        weight = Number(parts[2]);
      }
      trigger = String(trigger || "").trim();
      if (!trigger || seen.has(trigger)) continue;
      seen.add(trigger);
      added.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name,
        trigger,
        weight: Number.isNaN(weight) ? 0.8 : Math.min(2, Math.max(0.1, weight)),
        enabled: true
      });
    }
    return added;
  }

  function addLora() {
    const trigger = inputValue("loraTriggerInput");
    if (!trigger) {
      showToast("先填触发词");
      return;
    }
    const weight = Number($("loraWeight").value) || 0.8;
    const list = getMyLoras();
    list.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: inputValue("loraName"),
      trigger,
      weight: Math.min(2, Math.max(0.1, weight)),
      enabled: true
    });
    saveMyLoras(list);
    $("loraName").value = "";
    $("loraTriggerInput").value = "";
    $("loraForm").hidden = true;
    showToast("已加入清单，并勾选启用");
  }

  function exportLoras() {
    const payload = { version: 1, loras: getMyLoras() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prompt-studio-loras-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importLoras(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const incoming = Array.isArray(data) ? data : data.loras;
      if (!Array.isArray(incoming)) throw new Error("格式不对");
      const existing = getMyLoras();
      const seen = new Set(existing.map((item) => item.trigger));
      let added = 0;
      for (const item of incoming) {
        const trigger = String(item?.trigger || "").trim();
        if (!trigger || seen.has(trigger)) continue;
        existing.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          name: String(item.name || ""),
          trigger,
          weight: Math.min(2, Math.max(0.1, Number(item.weight) || 0.8)),
          enabled: Boolean(item.enabled)
        });
        seen.add(trigger);
        added += 1;
      }
      saveMyLoras(existing);
      showToast(`已导入 ${added} 条`);
    } catch (error) {
      showToast("导入失败：文件格式不对");
    }
  }

  function buildOutput() {
    const model = getModel();
    const language = $("language").value;
    let positive;
    if (language === "bilingual") {
      positive = `${capitalizeSentences(dedupePrompt(buildPromptFor("en", model), "en"))}\n\n中文对照：\n${dedupePrompt(buildPromptFor("zh", model), "zh")}`;
    } else {
      positive = dedupePrompt(buildPromptFor(language, model), language);
      if (language === "en") positive = capitalizeSentences(positive);
    }
    const negative = buildNegative(model);
    const state = collectState();
    // 触发词顺序：手填 > 模型自带 > 清单里勾选的
    const tokens = activeLoraTokens(model);
    if (tokens.length) positive = `${tokens.join(", ")}, ${positive}`;
    const json = {
      version: 1,
      generatedAt: new Date().toISOString(),
      model: {
        id: model.key,
        name: model.label,
        type: model.type,
        format: model.format
      },
      settings: state,
      size: getSize(),
      trigger: tokens.join(", "),
      loras: enabledLoras().map((item) => ({ name: item.name, trigger: item.trigger, weight: item.weight })),
      prompt: positive,
      negativePrompt: negative
    };
    return { positive, negative, json, model };
  }

  // 输出框可以直接改，复制/收藏/检查都以框里的文本为准
  function currentPositive() {
    const el = $("promptOutput");
    if (el) return el.value;
    return latestOutput ? latestOutput.positive : "";
  }

  function currentJson() {
    if (!latestOutput) return "";
    const json = { ...latestOutput.json, prompt: currentPositive() };
    return JSON.stringify(json, null, 2);
  }

  function updatePromptStats() {
    const text = currentPositive();
    const characters = text.length;
    const hanCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const size = getSize();
    const sizeLabel = size.width && size.height ? ` · ${size.width}×${size.height}` : "";
    $("promptStats").textContent = (hanCount > wordCount * 2
      ? `${characters} 字符 · ${hanCount} 汉字`
      : `${characters} 字符 · ${wordCount} 词`) + sizeLabel;
    $("jsonOutput").value = currentJson();
  }

  function updateOutput() {
    latestOutput = buildOutput();
    $("promptOutput").value = latestOutput.positive;
    $("negativeOutput").value = latestOutput.negative;
    $("outputModel").textContent = latestOutput.model.label;
    const outputSize = $("outputSize");
    if (outputSize) {
      const size = getSize();
      outputSize.textContent = size.width && size.height ? `${size.width} × ${size.height}` : "";
    }
    updatePromptStats();
    refreshFieldMarks();
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1900);
  }

  async function copyText(text, successMessage = "已复制") {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement("textarea");
        temp.value = text;
        temp.setAttribute("readonly", "");
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.append(temp);
        temp.select();
        const copied = document.execCommand("copy");
        temp.remove();
        if (!copied) throw new Error("copy failed");
      }
      addHistory();
      showToast(successMessage);
    } catch (error) {
      showToast("自动复制失败，请手动选中右侧文本复制");
    }
  }

  function storageGet(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      showToast("浏览器存储不可用，当前修改不会持久保存");
    }
  }

  function getSavedPresets() {
    return storageGet("promptStudio.saved.v1", []);
  }

  function getHistory() {
    return storageGet("promptStudio.history.v1", []);
  }

  function addHistory() {
    if (!latestOutput) return;
    const history = getHistory();
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
      title: `${latestOutput.model.label} · ${currentPositive().slice(0, 42)}`,
      prompt: currentPositive(),
      state: collectState()
    };
    const next = [item, ...history.filter((entry) => entry.prompt !== item.prompt)].slice(0, 20);
    storageSet("promptStudio.history.v1", next);
    renderHistory();
  }

  function savePreset() {
    updateOutput();
    const suggested = new Date().toLocaleString("zh-CN", { hour12: false });
    const name = window.prompt("给这个方案起个名字：", `方案 ${suggested}`);
    if (!name?.trim()) return;
    const saved = getSavedPresets();
    saved.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: name.trim(),
      createdAt: Date.now(),
      state: collectState(),
      prompt: currentPositive()
    });
    storageSet("promptStudio.saved.v1", saved.slice(0, 100));
    renderSaved();
    showToast("方案已收藏");
  }

  function createSavedItem(item, { history = false } = {}) {
    const row = document.createElement("div");
    row.className = "saved-item";
    const text = document.createElement("div");
    const title = document.createElement("strong");
    const summary = document.createElement("small");
    title.textContent = history ? item.title : item.name;
    summary.textContent = new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false });
    text.append(title, summary);

    const actions = document.createElement("div");
    actions.className = "saved-item-actions";
    const load = document.createElement("button");
    load.className = "tiny-button";
    load.type = "button";
    load.title = "载入";
    load.textContent = "↺";
    load.addEventListener("click", () => {
      applyState(item.state);
      showToast(history ? "已恢复历史方案" : `已载入「${item.name}」`);
    });
    actions.append(load);

    if (!history) {
      const remove = document.createElement("button");
      remove.className = "tiny-button";
      remove.type = "button";
      remove.title = "删除";
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        if (!window.confirm(`删除收藏「${item.name}」？`)) return;
        storageSet("promptStudio.saved.v1", getSavedPresets().filter((entry) => entry.id !== item.id));
        renderSaved();
        showToast("收藏已删除");
      });
      actions.append(remove);
    }
    row.append(text, actions);
    return row;
  }

  function renderSaved() {
    const root = $("savedList");
    root.innerHTML = "";
    const saved = getSavedPresets();
    if (!saved.length) {
      const empty = document.createElement("div");
      empty.className = "saved-empty";
      empty.textContent = "还没有收藏。生成后点击“收藏”即可保存整套参数。";
      root.append(empty);
      return;
    }
    saved.forEach((item) => root.append(createSavedItem(item)));
  }

  function renderHistory() {
    const root = $("historyList");
    root.innerHTML = "";
    const history = getHistory();
    if (!history.length) {
      const empty = document.createElement("div");
      empty.className = "saved-empty";
      empty.textContent = "复制提示词后，这里会自动保留最近 20 条记录。";
      root.append(empty);
      return;
    }
    history.forEach((item) => root.append(createSavedItem(item, { history: true })));
  }

  // ---------- 整机备份 / 恢复 ----------
  function exportBackup() {
    const payload = {
      app: "ComfyUI Prompt Studio",
      type: "full-backup",
      version: 2,
      exportedAt: new Date().toISOString(),
      saved: getSavedPresets(),
      history: getHistory(),
      loras: getMyLoras(),
      state: collectState()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prompt-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    showToast("已导出完整备份");
  }

  async function importBackup(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || (!data.saved && !data.history && !data.loras && !data.state)) {
        showToast("这不是完整备份文件");
        return;
      }
      const restored = [];
      if (Array.isArray(data.saved)) {
        storageSet("promptStudio.saved.v1", data.saved);
        renderSaved();
        restored.push(`收藏 ${data.saved.length} 条`);
      }
      if (Array.isArray(data.history)) {
        storageSet("promptStudio.history.v1", data.history);
        renderHistory();
        restored.push(`历史 ${data.history.length} 条`);
      }
      if (Array.isArray(data.loras)) {
        storageSet("promptStudio.loras.v1", data.loras);
        renderLoras();
        restored.push(`LoRA ${data.loras.length} 条`);
      }
      if (data.state) {
        applyState(data.state);
        restored.push("当前选项");
      }
      updateOutput();
      saveAutosave();
      showToast(`已恢复：${restored.join("、")}`);
    } catch (error) {
      showToast("恢复失败：文件格式不对");
    }
  }

  function exportPresets() {
    const payload = {
      app: "ComfyUI Prompt Studio",
      version: 1,
      exportedAt: new Date().toISOString(),
      presets: getSavedPresets()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `prompt-studio-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    showToast("收藏已导出");
  }

  async function importPresets(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const incoming = Array.isArray(data) ? data : data.presets;
      if (!Array.isArray(incoming)) throw new Error("invalid format");
      const existing = getSavedPresets();
      const names = new Set(existing.map((item) => item.name));
      const valid = incoming.filter((item) => item?.name && item?.state);
      for (const item of valid) {
        if (names.has(item.name)) item.name = `${item.name}（导入）`;
        item.id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        item.createdAt = item.createdAt || Date.now();
      }
      storageSet("promptStudio.saved.v1", [...valid, ...existing].slice(0, 100));
      renderSaved();
      showToast(`已导入 ${valid.length} 个方案`);
    } catch {
      showToast("导入失败：不是有效的 Prompt Studio JSON 文件");
    } finally {
      $("importFile").value = "";
    }
  }

  function saveAutosave() {
    window.clearTimeout(formSaveTimer);
    formSaveTimer = window.setTimeout(() => {
      storageSet("promptStudio.autosave.v1", collectState());
    }, 250);
  }

  let lastRandomState = null;

  function updateUndoButton() {
    const button = $("undoButton");
    if (button) button.disabled = !lastRandomState;
  }

  function randomize() {
    const skip = new Set(["model", "language", "detailLevel", "contentScale", "subjectType", "customFormat", "rolePreset"]);
    lastRandomState = collectState();
    const rate = ADULT_RANDOM_RATE[contentScale()] ?? 0;
    for (const [field] of Object.entries(FIELD_TO_OPTIONS)) {
      if (skip.has(field)) continue;
      const options = getOptionPairs(field).filter((item) => item.en);
      if (!options.length) continue;
      const adultPool = options.filter((item) => item.adultOnly);
      const normalPool = options.filter((item) => !item.adultOnly);
      let pool;
      if (Math.random() < rate && adultPool.length) pool = adultPool;
      else if (normalPool.length) pool = normalPool;
      else pool = options;
      let pick = "";
      for (let attempt = 0; attempt < 8 && pool.length; attempt += 1) {
        const candidate = pool[Math.floor(Math.random() * pool.length)].en;
        if (!pick) pick = candidate;
        if (!conflictsWithValue(field, candidate)) {
          pick = candidate;
          break;
        }
      }
      if (pick) setSelectValue(field, pick);
    }
    resolveConflicts(null);
    // 随机到了新的画面比例时，像素尺寸要跟着变，否则比例和尺寸会对不上
    syncSizeFromAspectRatio();
    const qualityOptions = $$("[data-quality]");
    qualityOptions.forEach((checkbox) => {
      checkbox.checked = Math.random() > 0.72;
    });
    updateVisibility();
    updateOutput();
    saveAutosave();
    updateUndoButton();
    const label = { sfw: "日常", suggestive: "暗示", boudoir: "私房", adult: "扩展" }[contentScale()] || "日常";
    showToast(`已生成一组随机组合（${label}档）`);
  }

  function undoRandom() {
    if (!lastRandomState) return;
    applyState(lastRandomState);
    lastRandomState = null;
    updateUndoButton();
    showToast("已撤销上一次随机");
  }

  function measurePrompt(prompt, model) {
    const language = $("language").value;
    const han = (prompt.match(/[\u4e00-\u9fa5]/g) || []).length;
    const words = prompt.split(/\s+/).filter(Boolean).length;
    const minWords = model.minWords || 20;
    const maxWords = model.maxWords || (model.type === "video" ? 420 : 360);
    if (language === "bilingual") {
      const [enPart, zhPart = ""] = prompt.split("中文对照：");
      const enWords = enPart.split(/\s+/).filter(Boolean).length;
      const zhHan = (zhPart.match(/[\u4e00-\u9fa5]/g) || []).length;
      return {
        ok: enWords >= minWords && enWords <= maxWords && zhHan >= 40,
        metric: `英文 ${enWords} 词 / 中文 ${zhHan} 汉字`,
        hint: model.minWords ? `（该模型建议 ${minWords}–${maxWords} 词）` : ""
      };
    }
    if (language === "zh") {
      const maxHan = model.type === "video" ? 900 : 700;
      return { ok: han >= 60 && han <= maxHan, metric: `${han} 汉字`, hint: "" };
    }
    return {
      ok: words >= minWords && words <= maxWords,
      metric: `${words} 词`,
      hint: model.minWords ? `（该模型建议 ${minWords}–${maxWords} 词）` : ""
    };
  }

  function analyzePrompt() {
    const model = getModel();
    const prompt = currentPositive().trim();
    const lower = prompt.toLowerCase();
    const subjectType = $("subjectType").value;
    const clauses = prompt
      .split(/[,，\n]/)
      .map((part) => part.trim().toLowerCase().replace(/[.。;；]+$/g, ""))
      .filter(Boolean);
    const clauseCounts = new Map();
    for (const clause of clauses) clauseCounts.set(clause, (clauseCounts.get(clause) || 0) + 1);
    const duplicateClauses = [...clauseCounts.entries()].filter(([, count]) => count > 1);
    const placeholders = [...new Set(prompt.match(/\[[^\]\n]{2,120}\]/g) || [])]
      .filter((value) => !/^\[\d+(?:\.\d+)?s-\d+(?:\.\d+)?s\]$/i.test(value));
    const checks = [];

    const subjectReady = subjectType === "object"
      ? Boolean(inputValue("objectDescription"))
      : Boolean($("gender").value && $("age").value);
    checks.push({
      status: subjectReady ? "pass" : "fail",
      title: "主体信息",
      detail: subjectReady ? "主体类型、年龄或物体描述已填写。" : "请补充角色信息或物体描述。"
    });

    const genderOption = (O.gender || []).find((item) => item.en === $("gender").value);
    const genderPeople = (genderOption && genderOption.people) || 1;
    let peopleStatus = "pass";
    let peopleDetail = "主体人数与性别描述一致。";
    if (subjectType === "couple" && genderPeople < 2) {
      peopleStatus = "warn";
      peopleDetail = "主体是双人，但「性别与呈现」选的是单人描述，成片可能只出现一个人；建议选“成对…”选项。";
    } else if (subjectType === "person" && genderPeople > 1) {
      peopleStatus = "warn";
      peopleDetail = "主体是单人，但「性别与呈现」选的是双人描述，可能画出两个人。";
    }
    checks.push({ status: peopleStatus, title: "主体人数", detail: peopleDetail });

    const size = getSize();
    const sizeInRange = size.width >= 256 && size.width <= 4096 && size.height >= 256 && size.height <= 4096;
    const sizeBucket = size.width % 64 === 0 && size.height % 64 === 0;
    checks.push({
      status: sizeInRange ? (sizeBucket ? "pass" : "warn") : "fail",
      title: "画面尺寸",
      detail: sizeInRange
        ? `${size.width} × ${size.height}（${size.ratio}）${sizeBucket ? "" : "，宽高建议取 64 的倍数"}`
        : "宽高需要在 256–4096 之间"
    });

    const motionReady = Boolean($("pose").value || $("action").value || inputValue("characterCustom"));
    checks.push({
      status: motionReady ? "pass" : "warn",
      title: "姿势与动作",
      detail: motionReady ? "已包含姿势、动作或自定义描述。" : "建议至少选择一个姿势或动作，画面会更稳定。"
    });

    const sceneReady = Boolean($("scene").value);
    checks.push({
      status: sceneReady ? "pass" : "warn",
      title: "场景与环境",
      detail: sceneReady ? "场景已指定。" : "当前没有明确场景，模型可能自行补全环境。"
    });

    const cameraReady = Boolean($("shotSize").value || $("angle").value || $("lens").value);
    checks.push({
      status: cameraReady ? "pass" : "warn",
      title: "镜头语言",
      detail: cameraReady ? "已指定景别、机位或焦段。" : "建议至少选择一个镜头参数。"
    });

    const formatCheck = {
      title: "模型结构",
      status: "pass",
      detail: "已按所选模型生成自然语言结构。"
    };
    if (["h3", "i2v"].includes(model.format)) {
      const valid = lower.includes("timeline:") && lower.includes("audio:");
      formatCheck.status = valid ? "pass" : "fail";
      formatCheck.detail = valid ? "已包含 H3 时间轴与音频段落。" : "H3 结构不完整，请重新生成。";
    } else if (model.format === "wan") {
      const valid = lower.includes("one primary action") || lower.includes("一个主要动作");
      formatCheck.status = valid ? "pass" : "warn";
      formatCheck.detail = valid ? "已限制为一个主要动作，并保留连续镜头描述。" : "没有检测到单动作约束。";
    } else if (model.format === "edit") {
      const valid = lower.includes("preserve") || lower.includes("保持原图");
      formatCheck.status = valid ? "pass" : "fail";
      formatCheck.detail = valid ? "已包含保持身份、姿势和背景的编辑约束。" : "编辑结构不完整。";
    }
    checks.push(formatCheck);

    if (model.i2v) {
      const valid = lower.includes("reference image") || lower.includes("参考图");
      checks.push({
        status: valid ? "pass" : "fail",
        title: "首帧一致性",
        detail: valid ? "已要求保持参考图中的人物、构图和光线。" : "图生视频缺少首帧一致性描述。"
      });
    }

    checks.push({
      status: duplicateClauses.length ? "warn" : "pass",
      title: "重复短语",
      detail: duplicateClauses.length
        ? `发现 ${duplicateClauses.length} 个重复片段；生成器会尽量自动去重。`
        : "未发现完全重复的逗号分隔片段。"
    });

    checks.push({
      status: placeholders.length ? "warn" : "pass",
      title: "占位符",
      detail: placeholders.length
        ? `仍有 ${placeholders.length} 个方括号占位内容需要替换。`
        : "未发现未替换的方括号占位符。"
    });

    const conflicts = detectConflicts();
    checks.push({
      status: conflicts.length ? "warn" : "pass",
      title: "选项冲突",
      detail: conflicts.length
        ? conflicts.map((conflict) => conflict.message).join("；")
        : "未发现互相矛盾的选项组合。"
    });

    if (model.cameraLocked) {
      const cameraMove = $("cameraMove").value;
      const cameraLocked = !cameraMove || cameraMove === "static camera";
      checks.push({
        status: cameraLocked ? "pass" : "warn",
        title: "机位约束",
        detail: cameraLocked
          ? "固定机位，符合该模型的单镜头约束。"
          : "该模型建议固定机位（static camera），当前选择了运镜，容易画面不稳。"
      });
    }

    const lengthReport = measurePrompt(prompt, model);
    checks.push({
      status: lengthReport.ok ? "pass" : "warn",
      title: "提示词长度",
      detail: lengthReport.ok
        ? `当前${lengthReport.metric}，长度适合。${lengthReport.hint || ""}`
        : `当前${lengthReport.metric}，可能过短或过长，建议精简次要描述。${lengthReport.hint || ""}`
    });

    const points = checks.reduce((score, check) => {
      if (check.status === "pass") return score + 1;
      if (check.status === "warn") return score + 0.5;
      return score;
    }, 0);
    const percent = Math.round((points / checks.length) * 100);
    return { checks, percent, model };
  }

  function openReview() {
    updateOutput();
    const review = analyzePrompt();
    const score = $("reviewScore");
    const failed = review.checks.filter((check) => check.status === "fail").length;
    const warned = review.checks.filter((check) => check.status === "warn").length;
    const passed = review.checks.filter((check) => check.status === "pass").length;
    score.textContent = `${review.percent} 分 · 通过 ${passed}/${review.checks.length} 项${
      warned ? ` · 提醒 ${warned} 项` : ""
    }${failed ? ` · 未通过 ${failed} 项` : ""}`;
    score.className = `review-score ${failed ? "warn" : warned ? "warn" : "pass"}`;
    $("reviewSummary").textContent = failed
      ? "存在需要修正的项目。建议处理后再复制提示词。"
      : warned
        ? "核心结构已经完整，可以检查警告项后使用。"
        : "检查通过，可以复制并使用。";

    const list = $("reviewChecks");
    list.innerHTML = "";
    for (const check of review.checks) {
      const item = document.createElement("li");
      item.className = `review-check ${check.status}`;
      const icon = document.createElement("span");
      icon.className = "review-check-icon";
      icon.textContent = check.status === "pass" ? "✓" : check.status === "warn" ? "!" : "×";
      const text = document.createElement("div");
      const title = document.createElement("strong");
      const detail = document.createElement("small");
      title.textContent = check.title;
      detail.textContent = check.detail;
      text.append(title, detail);
      item.append(icon, text);
      list.append(item);
    }
    $("reviewDialog").showModal();
  }

  function setupTabs() {
    $$(".tab").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".tab").forEach((tab) => tab.classList.toggle("active", tab === button));
        $$(".tab-panel").forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.panel === button.dataset.tab);
        });
      });
    });
  }

  function setupEvents() {
    document.addEventListener("input", (event) => {
      if (!event.target.matches("[data-state], [data-quality]")) return;
      updateVisibility();
      updateOutput();
      saveAutosave();
    });

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.id === "sizePreset") {
        const [w, h] = String(target.value || "").split("x").map(Number);
        if (w && h) {
          sizeTouched = true;
          setSize(w, h);
          updateOutput();
          saveAutosave();
        }
        return;
      }
      if (target.id === "imageWidth" || target.id === "imageHeight") {
        sizeTouched = true;
        syncSizePreset();
        syncAspectRatioFromSize();
        updateOutput();
        saveAutosave();
        return;
      }
      if (target.matches("[data-quality]")) {
        updateOutput();
        saveAutosave();
        return;
      }
      if (!target.matches("[data-state]")) return;

      if (target.id === "aspectRatio") syncSizeFromAspectRatio();
      if (FIELD_TO_OPTIONS[target.id]) resolveConflicts(target.id);

      if (target.id === "model" || target.id === "customFormat") {
        // 换模型时套用该模型建议的像素尺寸（用户手动改过尺寸就不覆盖）
        const nextModel = getModel();
        if (target.id === "model" && nextModel.size && !sizeTouched) {
          setSize(nextModel.size[0], nextModel.size[1]);
          showToast(`已套用 ${nextModel.label} 建议尺寸 ${nextModel.size[0]}×${nextModel.size[1]}`);
        }
        updateVisibility();
      }
      if (target.id === "subjectType") {
        refreshSelectsForSubject();
        updateVisibility();
      }
      if (target.id === "contentScale") {
        applyContentScale();
      }
      if (target.id === "rolePreset") {
        applyRolePreset();
      }
      updateOutput();
      saveAutosave();
    });

    $("reviewButton").addEventListener("click", openReview);
    $("randomButton").addEventListener("click", randomize);
    $("resetButton").addEventListener("click", () => {
      applyDefaults();
      updateOutput();
      saveAutosave();
      showToast("已恢复初始选项");
    });
    $("copyPromptLarge").addEventListener("click", () => copyText(currentPositive(), "提示词已复制"));
    $("copyNegativeButton").addEventListener("click", () => copyText(latestOutput.negative, "负面提示词已复制"));
    $("copyNegativeTabButton").addEventListener("click", () => copyText(latestOutput.negative, "负面提示词已复制"));
    $("copyJsonButton").addEventListener("click", () => copyText(currentJson(), "JSON 已复制"));
    $("saveButton").addEventListener("click", savePreset);
    $("exportButton").addEventListener("click", exportPresets);
    $("backupExport").addEventListener("click", exportBackup);
    $("backupImport").addEventListener("click", () => $("backupFile").click());
    $("backupFile").addEventListener("change", () => {
      importBackup($("backupFile").files[0]);
      $("backupFile").value = "";
    });
    $("importButton").addEventListener("click", () => $("importFile").click());
    $("importFile").addEventListener("change", () => importPresets($("importFile").files[0]));
    $("clearHistoryButton").addEventListener("click", () => {
      if (!window.confirm("清空最近生成记录？收藏不会受影响。")) return;
      storageSet("promptStudio.history.v1", []);
      renderHistory();
      showToast("最近生成已清空");
    });

    $("themeButton").addEventListener("click", () => {
      document.body.classList.toggle("light");
      storageSet("promptStudio.theme.v1", document.body.classList.contains("light") ? "light" : "dark");
    });
    compactMode = storageGet("promptStudio.compact.v1", true);
    applyCompactMode();
    refreshFieldMarks();
    $("compactButton").addEventListener("click", () => {
      compactMode = !compactMode;
      storageSet("promptStudio.compact.v1", compactMode);
      applyCompactMode();
      refreshFieldMarks();
    });
    $("promptOutput").addEventListener("input", updatePromptStats);
    $("sentenceButton").addEventListener("click", () => {
      const text = $("sentenceInput").value.trim();
      const items = sentenceCandidates(text);
      if (!items.length) {
        $("sentenceResult").hidden = true;
        $("sentenceEmpty").hidden = false;
        return;
      }
      applySentence(items);
    });
    $("sentenceInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        $("sentenceButton").click();
      }
    });
    $("sentenceUndo").addEventListener("click", () => {
      if (sentenceSnapshot) applyState(sentenceSnapshot);
      $("sentenceResult").hidden = true;
      $("sentenceEmpty").hidden = true;
      showToast("已撤销本次预填");
    });
    $$("#scaleSwitch button").forEach((button) => {
      button.addEventListener("click", () => setContentScale(button.dataset.scale));
    });
    $("undoButton").addEventListener("click", undoRandom);
    updateUndoButton();

    const commandBar = document.querySelector(".command-bar");
    if (commandBar) {
      const syncCmdHeight = () => {
        document.documentElement.style.setProperty("--cmd-h", `${Math.round(commandBar.offsetHeight)}px`);
      };
      syncCmdHeight();
      window.addEventListener("resize", syncCmdHeight);
      if ("ResizeObserver" in window) new ResizeObserver(syncCmdHeight).observe(commandBar);
    }

    let outputCollapsed = storageGet("promptStudio.outputCollapsed.v1", false);
    const applyOutputCollapsed = () => {
      document.body.classList.toggle("output-collapsed", Boolean(outputCollapsed));
      const button = $("outputToggle");
      if (button) button.textContent = outputCollapsed ? "⟨" : "⟩";
    };
    applyOutputCollapsed();
    $("outputToggle").addEventListener("click", () => {
      outputCollapsed = !outputCollapsed;
      storageSet("promptStudio.outputCollapsed.v1", outputCollapsed);
      applyOutputCollapsed();
    });
    // 收起后，点整条竖栏也能展开（避免找不到按钮）
    document.querySelector(".output-panel").addEventListener("click", (event) => {
      if (event.target.closest("#outputToggle")) return;
      if (!document.body.classList.contains("output-collapsed")) return;
      outputCollapsed = false;
      storageSet("promptStudio.outputCollapsed.v1", false);
      applyOutputCollapsed();
    });

    wizardIndex = Number(storageGet("promptStudio.wizardStep.v1", 0)) || 0;
    wizardIndex = Math.max(0, Math.min(WIZARD_STEPS.length - 1, wizardIndex));
    renderWizard();
    $("wizardPrev").addEventListener("click", () => goToWizardStep(wizardIndex - 1));
    $("wizardNext").addEventListener("click", () => {
      if (wizardIndex === WIZARD_STEPS.length - 1) openReview();
      else goToWizardStep(wizardIndex + 1);
    });

    renderLoras();
    $("loraAdd").addEventListener("click", () => {
      const form = $("loraForm");
      form.hidden = !form.hidden;
      if (!form.hidden) $("loraTriggerInput").focus();
    });
    $("loraCancel").addEventListener("click", () => {
      $("loraForm").hidden = true;
    });
    $("loraSave").addEventListener("click", addLora);
    $("loraTriggerInput").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addLora();
      }
    });
    $("loraPaste").addEventListener("click", () => {
      const box = $("loraPasteBox");
      box.hidden = !box.hidden;
      if (!box.hidden) $("loraPasteText").focus();
    });
    $("loraPasteCancel").addEventListener("click", () => {
      $("loraPasteBox").hidden = true;
    });
    $("loraPasteSave").addEventListener("click", () => {
      const added = parseLoraLines($("loraPasteText").value);
      if (!added.length) {
        showToast("没有可加入的新条目");
        return;
      }
      saveMyLoras([...getMyLoras(), ...added]);
      $("loraPasteText").value = "";
      $("loraPasteBox").hidden = true;
      showToast(`已加入 ${added.length} 条`);
    });
    $("loraExport").addEventListener("click", exportLoras);
    $("loraImport").addEventListener("click", () => $("loraImportFile").click());
    $("loraImportFile").addEventListener("change", () => {
      importLoras($("loraImportFile").files[0]);
      $("loraImportFile").value = "";
    });
    $("helpButton").addEventListener("click", () => $("helpDialog").showModal());
    $("helpCloseButton").addEventListener("click", () => $("helpDialog").close());
    $("helpDialog").addEventListener("click", (event) => {
      if (event.target === $("helpDialog")) $("helpDialog").close();
    });
    $("reviewCloseButton").addEventListener("click", () => $("reviewDialog").close());
    $("reviewCloseButton2").addEventListener("click", () => $("reviewDialog").close());
    $("reviewCopyButton").addEventListener("click", async () => {
      await copyText(currentPositive(), "提示词已复制");
      $("reviewDialog").close();
    });
    $("reviewDialog").addEventListener("click", (event) => {
      if (event.target === $("reviewDialog")) $("reviewDialog").close();
    });

    const sections = $$(".form-card[id]");
    const links = $$(".step-nav a");
    if (links.length && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      }, { rootMargin: "-15% 0px -65% 0px", threshold: [0.1, 0.35] });
      sections.forEach((section) => observer.observe(section));
    }
  }

  // 词库自检：改完 data/prompts.js 后打开控制台就能看到哪里写错了
  function validateData() {
    const problems = [];
    for (const [field, key] of Object.entries(FIELD_TO_OPTIONS)) {
      const list = O[key];
      if (!Array.isArray(list)) {
        problems.push(`字段 ${field} 没有对应的选项库 ${key}`);
        continue;
      }
      const seen = new Set();
      for (const item of list) {
        if (!item || typeof item.en !== "string" || typeof item.zh !== "string") {
          problems.push(`${key} 里有一条格式不完整的选项`);
          continue;
        }
        if (!item.zh) problems.push(`${key} 缺少中文标签: ${item.en}`);
        if (!item.en) continue;
        const id = item.en.toLowerCase();
        if (seen.has(id)) problems.push(`${key} 有重复选项: ${item.en}`);
        seen.add(id);
      }
    }
    for (const [name, preset] of Object.entries(ROLE_PRESETS)) {
      for (const [field, value] of Object.entries(preset)) {
        const key = FIELD_TO_OPTIONS[field];
        if (!key) {
          problems.push(`角色预设「${name}」用了不存在的字段 ${field}`);
          continue;
        }
        if (!(O[key] || []).some((item) => item.en === value)) {
          problems.push(`角色预设「${name}」的 ${field} 值不在选项里: ${value}`);
        }
      }
    }
    for (const field of Object.keys(FIELD_SUBJECT_GROUPS)) {
      if (!$(field)) problems.push(`字段适用性表里的 ${field} 在页面上没有控件`);
    }
    if (problems.length) console.warn("[词库自检] 发现 " + problems.length + " 个问题：", problems);
    return problems;
  }

  function init() {
    validateData();
    populateSelects({ preserve: false });
    enhanceAllSelects();
    applyDefaults();
    applyContentScale();
    syncScaleSwitch();
    renderSaved();
    renderHistory();
    setupTabs();
    setupEvents();

    const savedTheme = localStorage.getItem("promptStudio.theme.v1");
    if (savedTheme === "dark") document.body.classList.remove("light");
    else document.body.classList.add("light");
    const autosave = storageGet("promptStudio.autosave.v1", null);
    if (autosave) applyState(autosave);
    updateOutput();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
