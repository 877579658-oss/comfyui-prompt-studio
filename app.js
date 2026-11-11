(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const pair = (zh, en, extra = {}) => ({ zh, en, ...extra });
  const NONE = pair("不指定", "");

  const MODELS = {
    zimage_turbo: {
      label: "Z-Image Turbo",
      type: "image",
      format: "natural",
      note: "适合快速写实出图。优先写主体、材质、动作、镜头和光线，不建议堆砌大量画质词。",
      negative: "low quality, blurry, pixelated, jpeg artifacts, deformed anatomy, extra limbs, fused fingers, duplicate subject, inconsistent lighting, text, watermark"
    },
    zimage_int8: {
      label: "Z-Image INT8",
      type: "image",
      format: "natural",
      note: "与 Z-Image Turbo 共用自然语言结构，适合当前 INT8 工作流。",
      negative: "low quality, blurry, pixelated, jpeg artifacts, deformed anatomy, extra limbs, fused fingers, duplicate subject, inconsistent lighting, text, watermark"
    },
    flux2: {
      label: "Flux2 Klein",
      type: "image",
      format: "natural",
      note: "自然语言理解强，适合清晰叙事、海报、文字与材质控制。描述尽量具体连贯。",
      negative: "low quality, blurry, distorted typography, misspelled text, bad anatomy, extra fingers, inconsistent perspective, watermark"
    },
    moss: {
      label: "MOSS Image",
      type: "image",
      format: "natural",
      note: "适合自然语言画面描述。优先保持主体、空间关系和光线逻辑一致。",
      negative: "low quality, blurry, deformed anatomy, extra limbs, fused fingers, broken perspective, inconsistent lighting, text, watermark"
    },
    moss_edit: {
      label: "MOSS 图像编辑",
      type: "image",
      format: "edit",
      note: "编辑模式会输出保持身份、姿势、构图和背景的修改指令。不要重复描述首图已有的全部内容。",
      negative: "identity change, pose drift, composition change, inconsistent lighting, warped background, extra objects, seam artifacts, watermark"
    },
    h3_t2v: {
      label: "MiniMax H3 文生视频",
      type: "video",
      format: "h3",
      note: "使用单一连续镜头与时间轴。一个时间段只写一个清晰动作，避免多动作和频繁转场。",
      negative: "flicker, temporal inconsistency, identity drift, warped limbs, morphing objects, jump cuts, abrupt camera movement, text, subtitles, watermark"
    },
    h3_i2v: {
      label: "MiniMax H3 图生视频",
      type: "video",
      format: "h3",
      i2v: true,
      note: "人物、服装和构图由参考图决定。提示词重点写动作、物理反馈、镜头与音频。",
      negative: "identity drift, body morphing, outfit change, background morphing, flicker, warped limbs, jump cuts, abrupt camera movement, text, watermark"
    },
    wan_ti2v_5b: {
      label: "Wan 2.2 TI2V-5B",
      type: "video",
      format: "wan",
      note: "适合较短视频。一个镜头只保留一个主要动作，用头发、衣摆和环境次级运动增强真实感。",
      negative: "flicker, temporal inconsistency, identity drift, warped limbs, morphing objects, extra subjects, jump cuts, camera shake, watermark"
    },
    wan_i2v_a14b: {
      label: "Wan 2.2 I2V-A14B",
      type: "video",
      format: "wan",
      i2v: true,
      note: "首帧决定人物与构图。提示词只描述动作、物理联动、镜头和光线，避免重复长相。",
      negative: "identity drift, body morphing, outfit change, background morphing, flicker, warped limbs, extra subjects, jump cuts, watermark"
    },
    custom: {
      label: "我的自定义模型",
      type: "image",
      format: "natural",
      note: "请填写模型名称并选择输出结构。页面会按所选结构生成可复制的提示词。",
      negative: "low quality, blurry, deformed anatomy, extra limbs, fused fingers, inconsistent lighting, text, watermark"
    }
  };

  const O = {
    aspectRatio: [
      pair("自动", ""),
      pair("1:1 方形", "aspect ratio 1:1"),
      pair("4:5 竖版人像", "aspect ratio 4:5, vertical portrait"),
      pair("3:2 横向摄影", "aspect ratio 3:2, horizontal photography"),
      pair("16:9 电影横向", "aspect ratio 16:9, cinematic widescreen"),
      pair("9:16 竖屏视频", "aspect ratio 9:16, vertical short video"),
      pair("2.39:1 宽银幕", "aspect ratio 2.39:1, anamorphic widescreen")
    ],
    gender: [
      pair("成年女性", "adult woman"),
      pair("成年男性", "adult man"),
      pair("中性气质成年人", "adult androgynous person"),
      pair("成对女性角色", "two adult women"),
      pair("成对男女角色", "an adult woman and an adult man"),
      pair("成对男性角色", "two adult men")
    ],
    age: [
      pair("二十多岁", "in their twenties"),
      pair("三十多岁", "in their thirties"),
      pair("四十多岁", "in their forties"),
      pair("五十多岁", "in their fifties"),
      pair("六十多岁", "in their sixties"),
      pair("成熟年龄未知但明确成年", "clearly adult, age unspecified")
    ],
    appearance: [
      pair("东亚外貌", "East Asian features"),
      pair("东南亚外貌", "Southeast Asian features"),
      pair("南亚外貌", "South Asian features"),
      pair("欧洲外貌", "European features"),
      pair("非洲外貌", "African features"),
      pair("拉美外貌", "Latin American features"),
      pair("中东外貌", "Middle Eastern features"),
      pair("多元混血外貌", "mixed-heritage features"),
      pair("不指定", "")
    ],
    body: [
      pair("自然匀称", "natural balanced build"),
      pair("苗条", "slender build"),
      pair("运动型", "athletic build"),
      pair("曲线型", "curvy figure"),
      pair("肌肉型", "muscular build"),
      pair("高挑", "tall stature"),
      pair("娇小成年人", "petite adult build"),
      pair("宽肩", "broad-shouldered build"),
      pair("丰满", "full figure"),
      pair("模特比例", "runway model proportions"),
      pair("写实普通体型", "realistic everyday body proportions")
    ],
    face: [
      pair("鹅蛋脸", "oval face"),
      pair("瓜子脸", "heart-shaped face"),
      pair("圆脸", "round face"),
      pair("棱角分明", "angular facial structure"),
      pair("柔和轮廓", "soft facial contours"),
      pair("高颧骨", "defined cheekbones"),
      pair("雀斑", "light natural freckles"),
      pair("成熟轮廓", "mature facial structure"),
      pair("中性化轮廓", "androgynous facial features"),
      pair("不指定", "")
    ],
    hairStyle: [
      pair("亚麻长发微卷", "long wavy hair with natural texture"),
      pair("黑色长直发", "long straight hair"),
      pair("齐肩短发", "shoulder-length bob"),
      pair("利落短发", "short textured crop"),
      pair("低马尾", "low ponytail"),
      pair("高马尾", "high ponytail"),
      pair("双马尾", "twin tails"),
      pair("松散盘发", "loose updo"),
      pair("法式编发", "soft French braid"),
      pair("层次感中长发", "layered medium-length hair"),
      pair("凌乱自然短发", "messy natural short hair"),
      pair("狼尾发型", "wolf cut"),
      pair("寸头", "buzz cut"),
      pair("卷发", "voluminous curls"),
      pair("不指定", "")
    ],
    hairColor: [
      pair("自然黑", "natural black"),
      pair("深棕", "dark brown"),
      pair("栗棕", "chestnut brown"),
      pair("亚麻棕", "ash brown"),
      pair("金色", "blonde"),
      pair("铂金", "platinum blonde"),
      pair("红棕", "auburn"),
      pair("酒红", "burgundy"),
      pair("银灰", "silver gray"),
      pair("蓝黑", "blue-black"),
      pair("粉色挑染", "pink highlight"),
      pair("渐变发色", "subtle gradient color"),
      pair("不指定", "")
    ],
    eyes: [
      pair("深棕眼", "dark brown eyes"),
      pair("琥珀眼", "amber eyes"),
      pair("绿色眼睛", "green eyes"),
      pair("蓝色眼睛", "blue eyes"),
      pair("灰色眼睛", "gray eyes"),
      pair("异色瞳", "heterochromia"),
      pair("细长眼型", "elongated eyes"),
      pair("圆润大眼", "large round eyes"),
      pair("下垂眼", "soft downturned eyes"),
      pair("不指定", "")
    ],
    expression: [
      pair("平静自然", "calm, natural expression"),
      pair("轻微微笑", "subtle closed-mouth smile"),
      pair("自信", "confident expression"),
      pair("温柔", "gentle expression"),
      pair("忧郁", "melancholic expression"),
      pair("专注", "focused expression"),
      pair("惊讶", "subtle surprised expression"),
      pair("回眸", "looking back over the shoulder"),
      pair("看向镜头", "looking directly at the camera"),
      pair("看向画外", "looking off-camera"),
      pair("沉思", "thoughtful expression"),
      pair("克制微笑", "restrained smile"),
      pair("轻松愉快", "lighthearted expression"),
      pair("神秘", "mysterious expression"),
      pair("低垂目光", "lowered gaze"),
      pair("私密而克制", "restrained intimate expression", { adultOnly: true }),
      pair("略带诱惑", "subtly alluring expression", { adultOnly: true }),
      pair("半垂眼睑", "half-lidded gaze", { adultOnly: true }),
      pair("柔和微张双唇", "soft parted lips", { adultOnly: true }),
      pair("邀请式凝视", "inviting direct gaze", { adultOnly: true }),
      pair("自信而撩人", "confident alluring expression", { adultOnly: true }),
      pair("害羞偏头", "shy head tilt", { adultOnly: true }),
      pair("克制渴望", "restrained longing expression", { adultOnly: true }),
      pair("轻柔笑意", "soft knowing smile", { adultOnly: true }),
      pair("亲密放松", "relaxed intimate expression", { adultOnly: true }),
      pair("不指定", "")
    ],
    skin: [
      pair("自然皮肤纹理", "natural skin texture"),
      pair("可见细微毛孔", "subtle visible pores"),
      pair("柔和通透", "soft translucent skin"),
      pair("哑光质感", "matte skin finish"),
      pair("轻微油润高光", "subtle natural highlights"),
      pair("真实日晒肤色", "natural sun-kissed skin"),
      pair("白皙肤色", "fair skin"),
      pair("小麦肤色", "warm tan skin"),
      pair("深色肤色", "deep skin tone"),
      pair("带少量雀斑", "light freckles"),
      pair("不指定", "")
    ],
    rolePreset: [
      pair("不指定", ""),
      pair("都市日常", "urban everyday"),
      pair("时尚编辑", "fashion editorial"),
      pair("职场人物", "modern professional"),
      pair("复古名伶", "vintage screen siren"),
      pair("赛博探员", "cyberpunk investigator"),
      pair("奇幻旅者", "fantasy traveler"),
      pair("古典侠客", "classical martial hero"),
      pair("科幻机师", "sci-fi pilot"),
      pair("音乐人", "musician"),
      pair("艺术家", "artist"),
      pair("运动员", "athlete"),
      pair("学者", "scholar"),
      pair("贵族角色", "aristocratic character")
    ],
    outfit: [
      pair("不指定", ""),
      pair("白色宽松衬衫", "oversized white shirt"),
      pair("黑色修身西装", "tailored black suit"),
      pair("灰色针织衫", "soft gray knit sweater"),
      pair("牛仔夹克", "denim jacket"),
      pair("长风衣", "long trench coat"),
      pair("皮质机车夹克", "black leather biker jacket"),
      pair("极简连衣裙", "minimalist slip dress"),
      pair("丝质晚礼服", "floor-length silk evening gown"),
      pair("休闲T恤与长裤", "relaxed t-shirt and trousers"),
      pair("运动夹克", "technical sports jacket"),
      pair("瑜伽运动装", "athletic yoga wear"),
      pair("连帽卫衣", "oversized hoodie"),
      pair("复古格纹套装", "vintage plaid suit"),
      pair("汉服长袍", "layered traditional Hanfu robe"),
      pair("改良旗袍", "modern fitted qipao"),
      pair("和风浴衣", "lightweight yukata"),
      pair("中世纪长裙", "medieval layered gown"),
      pair("奇幻皮甲", "fantasy leather armor"),
      pair("科幻功能服", "futuristic utility suit"),
      pair("机甲驾驶服", "sci-fi pilot flight suit"),
      pair("实验室白大褂", "structured laboratory coat"),
      pair("舞台演出服", "stage performance outfit"),
      pair("海滩度假装", "linen beachwear"),
      pair("高级家居服", "premium loungewear"),
      pair("白色浴袍", "white hotel bathrobe"),
      pair("真丝睡裙", "silk slip dress", { adultOnly: true }),
      pair("蕾丝家居服", "black lace loungewear", { adultOnly: true }),
      pair("宽松衬衫半敞领口", "oversized shirt with a relaxed open collar", { adultOnly: true }),
      pair("薄纱外搭与丝质内搭", "sheer robe over a silk slip", { adultOnly: true }),
      pair("丝质吊带睡裙", "bias-cut satin camisole dress", { adultOnly: true }),
      pair("象牙色蕾丝连体衣", "ivory lace bodysuit", { adultOnly: true }),
      pair("缎面睡衣套装", "satin pajama set", { adultOnly: true }),
      pair("束腰外搭衬衫", "fitted corset layered beneath a loose shirt", { adultOnly: true }),
      pair("长袜与宽衬衫", "sheer stockings paired with an oversized shirt", { adultOnly: true }),
      pair("露肩晚礼服", "strapless evening dress", { adultOnly: true }),
      pair("薄纱罩衫", "sheer chiffon overlay", { adultOnly: true }),
      pair("温泉浴巾", "spa towel wrap", { adultOnly: true }),
      pair("亚麻敞领衬衫", "linen shirt with a relaxed open collar", { adultOnly: true }),
      pair("缎面吊带与长裤", "satin camisole with tailored trousers", { adultOnly: true })
    ],
    fabric: [
      pair("不指定", ""),
      pair("棉麻", "soft cotton and linen"),
      pair("真丝", "fluid silk"),
      pair("羊毛", "brushed wool"),
      pair("皮革", "matte leather"),
      pair("丹宁", "textured denim"),
      pair("针织", "fine knit"),
      pair("薄纱", "translucent chiffon"),
      pair("缎面", "satin"),
      pair("科技面料", "technical performance fabric"),
      pair("金属装甲", "brushed metal armor"),
      pair("天鹅绒", "rich velvet")
    ],
    outfitColor: [
      pair("不指定", ""),
      pair("黑色", "black"),
      pair("白色", "white"),
      pair("奶油色", "cream"),
      pair("灰色", "gray"),
      pair("深蓝", "navy blue"),
      pair("酒红", "burgundy"),
      pair("棕色", "brown"),
      pair("橄榄绿", "olive green"),
      pair("银灰", "silver gray"),
      pair("金色", "gold"),
      pair("柔和粉色", "soft pink"),
      pair("撞色", "contrasting color blocking")
    ],
    fit: [
      pair("不指定", ""),
      pair("合身", "tailored fit"),
      pair("修身", "slim fit"),
      pair("宽松", "relaxed oversized fit"),
      pair("自然褶皱", "natural fabric folds"),
      pair("结构感", "structured silhouette"),
      pair("流动感", "flowing silhouette"),
      pair("层次叠穿", "layered styling"),
      pair("轻微使用痕迹", "subtle signs of wear")
    ],
    accessories: [
      pair("不指定", ""),
      pair("银色耳环", "minimal silver earrings"),
      pair("细项链", "delicate necklace"),
      pair("金属腕表", "metal wristwatch"),
      pair("墨镜", "sunglasses"),
      pair("皮包", "leather handbag"),
      pair("帽子", "hat"),
      pair("围巾", "scarf"),
      pair("手套", "gloves"),
      pair("发带", "hair ribbon"),
      pair("胸针", "brooch"),
      pair("战术装备", "compact tactical gear"),
      pair("机械装置", "subtle mechanical device"),
      pair("手持花束", "holding a small bouquet"),
      pair("手持咖啡杯", "holding a coffee cup"),
      pair("阅读眼镜", "reading glasses")
    ],
    footwear: [
      pair("不指定", ""),
      pair("白色运动鞋", "white sneakers"),
      pair("黑色皮鞋", "black leather shoes"),
      pair("短靴", "ankle boots"),
      pair("高跟鞋", "high heels"),
      pair("平底鞋", "minimal flats"),
      pair("凉鞋", "sandals"),
      pair("长靴", "knee-high boots"),
      pair("赤足", "barefoot"),
      pair("战术靴", "tactical boots"),
      pair("工作靴", "work boots")
    ],
    grooming: [
      pair("不指定", ""),
      pair("自然素颜", "natural bare makeup"),
      pair("轻薄底妆", "light natural makeup"),
      pair("电影妆", "cinematic makeup"),
      pair("复古红唇", "vintage red lip"),
      pair("烟熏眼妆", "soft smoky eye"),
      pair("湿润发感", "subtle wet-look hair"),
      pair("凌乱造型", "intentionally tousled styling"),
      pair("精致盘发", "polished salon styling"),
      pair("胡茬", "neat stubble")
    ],
    pose: [
      pair("自然站立", "standing naturally"),
      pair("靠窗站立", "standing beside a window"),
      pair("坐在床边", "sitting on the edge of a bed"),
      pair("坐在椅子上", "seated on a chair"),
      pair("倚靠墙面", "leaning against a wall"),
      pair("倚靠栏杆", "leaning on a railing"),
      pair("侧身回眸", "turning back over the shoulder"),
      pair("半身侧坐", "side-seated three-quarter pose"),
      pair("仰卧", "lying on their back"),
      pair("侧卧", "lying on one side"),
      pair("俯卧", "lying face down"),
      pair("向后倾靠", "leaning back comfortably"),
      pair("双手抱臂", "arms lightly crossed"),
      pair("双手插袋", "hands in pockets"),
      pair("整理衣领", "adjusting a collar"),
      pair("拨动头发", "brushing hair aside"),
      pair("向前行走", "walking toward the camera"),
      pair("转身动作", "mid-turn movement"),
      pair("舞蹈动作", "expressive dance pose"),
      pair("动态跳跃", "mid-air jump"),
      pair("蹲姿", "crouching pose"),
      pair("跪坐", "kneeling comfortably"),
      pair("侧躺手肘支撑", "reclining on one side, propped on one elbow", { adultOnly: true }),
      pair("斜卧在床上", "lying diagonally across the bed", { adultOnly: true }),
      pair("跪坐于床沿", "kneeling upright near the edge of the bed", { adultOnly: true }),
      pair("靠坐床头", "leaning back against the headboard", { adultOnly: true }),
      pair("对镜整理头发", "adjusting hair while facing a mirror", { adultOnly: true }),
      pair("坐在地面靠墙", "sitting on the floor and leaning against the wall", { adultOnly: true }),
      pair("伸懒腰", "stretching in a relaxed pose", { adultOnly: true }),
      pair("俯身倚靠桌面", "leaning across a table on their forearms", { adultOnly: true }),
      pair("不指定", "")
    ],
    action: [
      pair("不指定", ""),
      pair("轻微呼吸与自然眨眼", "subtle breathing and natural blinking"),
      pair("缓慢转身", "slowly turning around"),
      pair("向前走一步", "taking one deliberate step forward"),
      pair("回头", "looking back"),
      pair("抬头看向远处", "raising their gaze toward the distance"),
      pair("拨开头发", "gently moving hair away from the face"),
      pair("整理衣摆", "smoothing the hem of the clothing"),
      pair("伸手触碰桌面", "reaching toward the table"),
      pair("推开一扇门", "opening a door"),
      pair("坐起", "slowly sitting up"),
      pair("伸展身体", "gently stretching"),
      pair("轻声笑", "softly laughing"),
      pair("拿起物件", "picking up an object"),
      pair("望向窗外", "looking out of the window"),
      pair("风吹动头发和衣摆", "wind moving hair and fabric"),
      pair("自然行走", "walking with natural motion"),
      pair("舞蹈旋转", "spinning in a controlled dance movement")
    ],
    interaction: [
      pair("不指定", ""),
      pair("并排站立", "standing shoulder to shoulder"),
      pair("牵手", "holding hands"),
      pair("温柔拥抱", "sharing a gentle embrace"),
      pair("面对面交流", "facing each other in conversation"),
      pair("互相注视", "looking into each other's eyes"),
      pair("背靠背", "standing back to back"),
      pair("一人看向另一人", "one person looking toward the other"),
      pair("共同完成一个动作", "working together on one action"),
      pair("靠近低语", "leaning close and speaking softly", { adultOnly: true }),
      pair("轻柔拥抱", "sharing a soft close embrace", { adultOnly: true }),
      pair("额头相触", "standing with foreheads gently touching", { adultOnly: true }),
      pair("手抚脸颊", "gently cupping the other person's cheek", { adultOnly: true }),
      pair("身旁依偎", "sitting close and leaning against each other", { adultOnly: true }),
      pair("并卧交谈", "lying side by side in quiet conversation", { adultOnly: true }),
      pair("缓慢共舞", "slow dancing together", { adultOnly: true }),
      pair("相拥凝视", "holding each other while making eye contact", { adultOnly: true })
    ],
    motionLevel: [
      pair("几乎静止", "very subtle natural motion"),
      pair("缓慢自然", "slow natural movement"),
      pair("中等动作", "clear moderate motion"),
      pair("明显动态", "pronounced dynamic motion"),
      pair("强烈动作", "fast energetic action")
    ],
    scene: [
      pair("不指定", ""),
      pair("清晨酒店房间", "a quiet hotel room in the morning"),
      pair("暖光卧室", "a warm bedroom with soft practical lamps"),
      pair("现代公寓客厅", "a modern apartment living room"),
      pair("极简摄影棚", "a minimalist photography studio"),
      pair("落地窗公寓", "an apartment with floor-to-ceiling windows"),
      pair("咖啡厅窗边", "a quiet cafe beside a large window"),
      pair("城市街头", "a city street"),
      pair("雨夜街道", "a rain-soaked city street at night"),
      pair("霓虹后巷", "a neon-lit urban alley"),
      pair("天台夜景", "a rooftop overlooking the city at night"),
      pair("地下停车场", "an underground parking garage"),
      pair("地铁车厢", "inside a moving subway car"),
      pair("火车站台", "a railway platform"),
      pair("豪华酒店走廊", "a luxurious hotel corridor"),
      pair("图书馆", "a quiet library with tall bookshelves"),
      pair("艺术展厅", "a contemporary art gallery"),
      pair("室内泳池", "an indoor swimming pool"),
      pair("健身房", "a modern gym"),
      pair("舞蹈室", "a dance studio with mirrored walls"),
      pair("舞台后台", "a theater backstage area"),
      pair("森林空地", "a calm forest clearing"),
      pair("雪山木屋", "a wooden cabin in snowy mountains"),
      pair("海岸悬崖", "a coastal cliff"),
      pair("热带海滩", "a tropical beach"),
      pair("湖边长椅", "a lakeside bench"),
      pair("花田", "a field of flowers"),
      pair("沙漠公路", "a desert highway"),
      pair("赛博城市", "a futuristic cyberpunk city"),
      pair("太空舱", "a spacecraft interior"),
      pair("未来实验室", "a futuristic laboratory"),
      pair("古典庭院", "a classical courtyard"),
      pair("中世纪城堡", "a medieval castle hall"),
      pair("奇幻森林", "an enchanted fantasy forest"),
      pair("废墟神殿", "a ruined ancient temple")
    ],
    timeOfDay: [
      pair("不指定", ""),
      pair("清晨", "early morning"),
      pair("上午", "late morning"),
      pair("正午", "midday"),
      pair("午后", "afternoon"),
      pair("黄金时刻", "golden hour"),
      pair("黄昏", "dusk"),
      pair("蓝调时刻", "blue hour"),
      pair("夜晚", "night"),
      pair("深夜", "late night"),
      pair("室内暖光", "warm indoor lighting")
    ],
    weather: [
      pair("不指定", ""),
      pair("晴朗", "clear weather"),
      pair("多云", "soft overcast sky"),
      pair("薄雾", "light fog"),
      pair("小雨", "light rain"),
      pair("大雨", "heavy rain"),
      pair("雷雨", "distant thunderstorm"),
      pair("小雪", "light snow"),
      pair("大风", "strong wind"),
      pair("潮湿空气", "humid air"),
      pair("室内无天气", "controlled indoor atmosphere")
    ],
    background: [
      pair("不指定", ""),
      pair("浅景深背景", "softly blurred background"),
      pair("前景虚化", "blurred foreground elements"),
      pair("丰富前后景", "clear foreground, midground, and background layers"),
      pair("极简背景", "minimal clean background"),
      pair("环境叙事细节", "environmental storytelling details"),
      pair("人群虚化", "softly blurred distant people"),
      pair("几何建筑背景", "strong geometric architectural background"),
      pair("自然纹理背景", "natural organic textures in the background")
    ],
    props: [
      pair("不指定", ""),
      pair("旧书", "an old book"),
      pair("咖啡杯", "a ceramic coffee cup"),
      pair("玻璃杯", "a glass of water"),
      pair("鲜花", "fresh flowers"),
      pair("台灯", "a warm table lamp"),
      pair("相机", "a vintage camera"),
      pair("耳机", "over-ear headphones"),
      pair("雨伞", "a black umbrella"),
      pair("手提包", "a leather handbag"),
      pair("怀表", "a vintage pocket watch"),
      pair("车钥匙", "car keys"),
      pair("笔记本电脑", "a slim laptop"),
      pair("画笔与画布", "brushes and a canvas"),
      pair("乐器", "a musical instrument"),
      pair("镜子", "a large mirror"),
      pair("窗帘", "soft translucent curtains"),
      pair("蜡烛", "a small candle"),
      pair("烟雾", "thin drifting smoke"),
      pair("机械零件", "scattered mechanical parts"),
      pair("全息屏幕", "floating holographic displays")
    ],
    mood: [
      pair("不指定", ""),
      pair("宁静", "quiet and calm"),
      pair("温暖", "warm and inviting"),
      pair("怀旧", "nostalgic"),
      pair("孤独", "quietly lonely"),
      pair("浪漫", "romantic"),
      pair("神秘", "mysterious"),
      pair("紧张", "tense"),
      pair("未来感", "futuristic"),
      pair("梦幻", "dreamlike"),
      pair("高级感", "refined and premium"),
      pair("纪实感", "documentary realism"),
      pair("私密克制", "restrained intimacy", { adultOnly: true }),
      pair("浪漫张力", "romantic tension", { adultOnly: true }),
      pair("亲密信任", "intimate trust", { adultOnly: true }),
      pair("奢华私密", "luxurious private atmosphere", { adultOnly: true }),
      pair("暧昧安静", "quiet ambiguity", { adultOnly: true }),
      pair("自信迷人", "confident allure", { adultOnly: true }),
      pair("柔和脆弱", "tender vulnerability", { adultOnly: true }),
      pair("清晨余韵", "calm morning-after atmosphere", { adultOnly: true })
    ],
    shotSize: [
      pair("不指定", ""),
      pair("极近特写", "extreme close-up"),
      pair("面部特写", "close-up portrait"),
      pair("半身像", "medium shot"),
      pair("七分身", "cowboy shot"),
      pair("全身", "full-body shot"),
      pair("大全景", "wide shot"),
      pair("环境人像", "environmental portrait"),
      pair("过肩镜头", "over-the-shoulder shot"),
      pair("细节微距", "macro detail shot")
    ],
    angle: [
      pair("不指定", ""),
      pair("平视", "eye-level camera"),
      pair("低角度", "low-angle camera"),
      pair("高角度俯拍", "high-angle camera"),
      pair("鸟瞰", "top-down bird's-eye view"),
      pair("越过肩膀", "over-the-shoulder framing"),
      pair("背后视角", "rear view"),
      pair("侧面视角", "side profile view"),
      pair("荷兰倾斜", "subtle Dutch angle")
    ],
    lens: [
      pair("不指定", ""),
      pair("24mm 广角", "24mm wide-angle lens"),
      pair("35mm 纪实", "35mm documentary lens"),
      pair("50mm 自然", "50mm natural-perspective lens"),
      pair("85mm 人像", "85mm portrait lens"),
      pair("100mm 微距", "100mm macro lens"),
      pair("135mm 长焦压缩", "135mm telephoto compression"),
      pair("变形宽银幕", "anamorphic widescreen lens"),
      pair("鱼眼", "fisheye lens")
    ],
    composition: [
      pair("不指定", ""),
      pair("三分法", "rule-of-thirds composition"),
      pair("中心构图", "centered symmetrical composition"),
      pair("对角线构图", "dynamic diagonal composition"),
      pair("引导线构图", "strong leading lines"),
      pair("框景构图", "natural frame-within-a-frame composition"),
      pair("大量负空间", "generous negative space"),
      pair("紧凑裁切", "intimate close framing"),
      pair("前景遮挡", "layered foreground framing")
    ],
    depthOfField: [
      pair("不指定", ""),
      pair("大景深", "deep depth of field"),
      pair("中景深", "moderate depth of field"),
      pair("浅景深", "shallow depth of field"),
      pair("极浅景深", "very shallow depth of field")
    ],
    cameraMove: [
      pair("固定机位", "static camera"),
      pair("缓慢推近", "slow steady push-in"),
      pair("缓慢拉远", "slow steady pull-out"),
      pair("横向跟拍", "smooth lateral tracking shot"),
      pair("环绕拍摄", "slow orbital camera movement"),
      pair("手持跟随", "subtle handheld follow"),
      pair("无人机上升", "smooth drone rise"),
      pair("焦点转移", "gentle rack focus"),
      pair("轻微倾斜", "subtle tilt movement"),
      pair("跟随后退", "camera moves backward with the subject")
    ],
    lighting: [
      pair("不指定", ""),
      pair("柔和窗光", "large soft window light"),
      pair("侧逆光", "soft side backlight"),
      pair("轮廓光", "clear rim light"),
      pair("伦勃朗光", "Rembrandt lighting"),
      pair("三点布光", "controlled three-point studio lighting"),
      pair("黄金时刻", "warm golden-hour sunlight"),
      pair("阴天漫射光", "soft overcast diffusion"),
      pair("霓虹实用光", "colorful practical neon lighting"),
      pair("暖色台灯", "warm practical lamp light"),
      pair("冷色屏幕光", "cool screen glow"),
      pair("烛光", "candlelight"),
      pair("顶光", "dramatic overhead light"),
      pair("低照度电影光", "low-key cinematic lighting"),
      pair("高调柔光", "high-key soft lighting")
    ],
    palette: [
      pair("不指定", ""),
      pair("暖金色", "warm golden palette"),
      pair("奶油低饱和", "low-saturation cream palette"),
      pair("青蓝冷调", "cool teal-blue palette"),
      pair("霓虹粉蓝", "neon pink and cyan palette"),
      pair("黑白单色", "monochrome black-and-white palette"),
      pair("复古胶片色", "muted vintage film colors"),
      pair("高对比电影色", "high-contrast cinematic color grade"),
      pair("大地色", "earth-tone palette"),
      pair("柔粉肤色", "soft rose and skin-tone palette"),
      pair("深海蓝", "deep ocean-blue palette")
    ],
    atmosphere: [
      pair("不指定", ""),
      pair("空气感", "airy atmospheric depth"),
      pair("轻雾", "thin atmospheric haze"),
      pair("雨雾", "rain mist"),
      pair("体积光", "volumetric light rays"),
      pair("漂浮尘埃", "fine floating dust"),
      pair("烟尘", "subtle drifting smoke"),
      pair("蒸汽", "soft steam"),
      pair("电影颗粒", "fine film grain"),
      pair("清晰锐利", "clean crisp atmosphere"),
      pair("柔焦高光", "soft glowing highlights")
    ],
    filmLook: [
      pair("不指定", ""),
      pair("35mm胶片", "35mm film look"),
      pair("16mm颗粒", "16mm film grain"),
      pair("数码电影机", "digital cinema camera look"),
      pair("复古宝丽来", "vintage Polaroid look"),
      pair("高保真数码", "high-fidelity digital rendering"),
      pair("柔和高光滚降", "gentle highlight roll-off"),
      pair("低对比灰调", "low-contrast muted look"),
      pair("商业精修", "polished commercial finish")
    ],
    visualStyle: [
      pair("不指定", ""),
      pair("电影写实", "cinematic photorealism"),
      pair("时尚编辑", "high-fashion editorial"),
      pair("纪实摄影", "documentary photography"),
      pair("广告摄影", "premium commercial photography"),
      pair("电影剧照", "cinematic film still"),
      pair("日系人像", "Japanese portrait photography"),
      pair("东方美学", "modern East Asian aesthetic"),
      pair("暗黑电影", "dark cinematic aesthetic"),
      pair("复古胶片", "vintage film aesthetic"),
      pair("赛博朋克", "cyberpunk visual style"),
      pair("奇幻概念艺术", "fantasy concept art"),
      pair("3D动画", "stylized 3D animation"),
      pair("动漫插画", "anime illustration"),
      pair("水彩插画", "watercolor illustration"),
      pair("漫画分镜", "comic panel art"),
      pair("极简设计", "minimalist graphic design")
    ],
    render: [
      pair("不指定", ""),
      pair("照片级渲染", "photorealistic rendering"),
      pair("物理光线追踪", "physically based ray-traced lighting"),
      pair("CG角色渲染", "high-end CG character rendering"),
      pair("Unreal风格", "Unreal Engine cinematic render"),
      pair("Octane质感", "Octane render material response"),
      pair("二维赛璐璐", "cel-shaded 2D illustration"),
      pair("手绘水彩", "hand-painted watercolor"),
      pair("矢量平面", "clean vector-style graphics")
    ],
    qualityChips: [
      pair("自然皮肤纹理", "natural skin texture"),
      pair("清晰焦点", "sharp focus"),
      pair("真实布料褶皱", "realistic fabric folds"),
      pair("高细节", "highly detailed"),
      pair("统一光线", "coherent lighting"),
      pair("电影氛围", "cinematic atmosphere"),
      pair("细腻阴影", "delicate shadow gradation"),
      pair("丰富材质", "rich material response"),
      pair("空气质量感", "atmospheric depth"),
      pair("构图稳定", "stable coherent composition"),
      pair("身份一致", "consistent identity"),
      pair("运动连贯", "coherent motion"),
      pair("无文字水印", "no text, no watermark"),
      pair("精细调色", "refined color grading")
    ],
    creatureType: [
      pair("精灵", "elegant elf-like fantasy being"),
      pair("龙族", "humanoid dragon character"),
      pair("机械生命体", "sentient mechanical being"),
      pair("天使", "ethereal winged being"),
      pair("恶魔", "dignified demonic character"),
      pair("机器人", "humanoid robot"),
      pair("猫科拟人", "anthropomorphic feline character"),
      pair("狐狸拟人", "anthropomorphic fox character"),
      pair("元素生命", "elemental being"),
      pair("外星生命", "non-human alien being")
    ],
    bodyOrientation: [
      pair("不指定", ""),
      pair("正面朝向镜头", "facing the camera directly"),
      pair("左前方四分之三", "three-quarter view from the front left"),
      pair("右前方四分之三", "three-quarter view from the front right"),
      pair("左侧面", "left profile"),
      pair("右侧面", "right profile"),
      pair("背面", "viewed from behind"),
      pair("背面回眸", "viewed from behind while looking back"),
      pair("侧躺面向镜头", "lying on one side and facing the camera"),
      pair("身体朝向画外", "body angled away from the camera"),
      pair("镜中正面", "front-facing reflection in a mirror"),
      pair("镜中背面", "rear reflection in a mirror")
    ],
    gaze: [
      pair("不指定", ""),
      pair("直视镜头", "direct eye contact with the camera"),
      pair("看向画外", "looking off-camera"),
      pair("回眸看镜头", "looking back toward the camera"),
      pair("低垂目光", "lowered gaze"),
      pair("向上抬眸", "glancing upward"),
      pair("侧目", "subtle side glance"),
      pair("闭眼", "eyes gently closed"),
      pair("透过镜子对视", "eye contact through a mirror"),
      pair("闭眼感受光线", "eyes closed, feeling the light"),
      pair("看向另一人", "looking toward another person"),
      pair("视线越过肩膀", "gaze directed over the shoulder"),
      pair("半垂眼睑看向镜头", "half-lidded gaze toward the camera")
    ],
    handPose: [
      pair("不指定", ""),
      pair("双手自然放松", "hands resting naturally"),
      pair("单手拨头发", "one hand moving through the hair"),
      pair("双手梳理头发", "both hands lifting the hair"),
      pair("手放锁骨", "one hand resting near the collarbone"),
      pair("手扶脖颈", "one hand lightly touching the neck"),
      pair("手放腰侧", "one hand resting at the waist"),
      pair("手扶髋部", "one hand resting on the hip"),
      pair("双手抱膝", "arms wrapped around the knees"),
      pair("双臂举过头顶", "arms stretched above the head"),
      pair("手撑床面", "one hand supporting the body on the bed"),
      pair("手扶椅背", "one hand resting on the back of a chair"),
      pair("手扶墙面", "one hand resting against the wall"),
      pair("手持布料边缘", "fingers lightly holding the edge of the fabric"),
      pair("手托下巴", "chin resting lightly on one hand"),
      pair("手指轻触双唇", "fingertip resting near the lips"),
      pair("双手轻握", "hands gently clasped"),
      pair("一只手伸向镜头", "one hand reaching toward the camera"),
      pair("手放桌面", "one hand resting on the table"),
      pair("手持道具", "one hand holding a visible prop"),
      pair("手搭肩头", "one hand resting on the partner's shoulder")
    ],
    legPose: [
      pair("不指定", ""),
      pair("双脚自然站立", "standing with feet naturally placed"),
      pair("重心落在一条腿", "weight shifted onto one leg"),
      pair("脚踝轻交叉", "ankles lightly crossed"),
      pair("双腿并拢", "legs held together"),
      pair("双膝并拢", "knees kept together"),
      pair("双腿自然交叉", "legs casually crossed"),
      pair("一腿向前", "one leg placed forward"),
      pair("一膝抬起", "one knee drawn upward"),
      pair("双腿侧向摆放", "legs arranged to one side"),
      pair("双腿向前伸展", "legs extended forward"),
      pair("侧卧双腿并拢", "legs held together while lying on one side"),
      pair("跪坐正姿", "upright kneeling posture"),
      pair("单膝点地", "one knee resting on the floor"),
      pair("蜷腿侧坐", "seated with legs curled to one side"),
      pair("一脚轻点地面", "one foot lightly touching the floor"),
      pair("赤足自然摆放", "bare feet resting naturally")
    ],
    postureLine: [
      pair("不指定", ""),
      pair("自然放松", "relaxed natural posture"),
      pair("优雅挺立", "elegant upright posture"),
      pair("纵向拉长", "elongated vertical silhouette"),
      pair("柔和 S 形线条", "soft S-curve body line"),
      pair("轻微侧弯", "subtle lateral curve"),
      pair("克制后仰", "gently leaning back"),
      pair("躯干斜向延伸", "diagonal torso line"),
      pair("肩部放松", "relaxed shoulders"),
      pair("身体重心下沉", "lowered relaxed center of gravity"),
      pair("扭转体态", "subtle torso twist"),
      pair("舒展拉伸", "open extended posture"),
      pair("身体蜷曲", "tucked curled posture")
    ],
    adultArchetype: [
      pair("不指定", ""),
      pair("优雅酒店客人", "elegant boutique-hotel guest"),
      pair("电影感女主角", "cinematic lead character"),
      pair("奢华广告缪斯", "luxury campaign muse"),
      pair("黑色电影人物", "film-noir protagonist"),
      pair("私人画室模特", "adult private-studio model"),
      pair("成熟魅力角色", "confident mature adult character"),
      pair("浪漫伴侣", "romantic adult partner"),
      pair("时尚名伶", "fashion muse"),
      pair("清晨慵懒角色", "relaxed adult morning character"),
      pair("神秘夜行者", "mysterious nocturnal adult character"),
      pair("舞蹈演员", "adult dancer"),
      pair("游泳与度假角色", "adult resort character"),
      pair("温泉访客", "adult spa guest"),
      pair("私人俱乐部客人", "member of a luxury private club"),
      pair("复古银幕明星", "vintage screen star"),
      pair("中世纪贵族", "adult aristocratic character"),
      pair("赛博都市人物", "cyber-city adult character"),
      pair("幻想宫廷角色", "fantasy court adult character")
    ],
    adultStyling: [
      pair("不指定", ""),
      pair("高级私房写真", "tasteful boudoir editorial styling"),
      pair("奢华酒店晨光", "luxury hotel-morning styling"),
      pair("丝质与阴影", "silk-and-shadow styling"),
      pair("晨起微乱发型", "softly tousled morning hair"),
      pair("湿润柔光妆", "dewy soft-focus makeup"),
      pair("淡香水与珠宝", "perfume and delicate jewelry"),
      pair("赤足优雅", "barefoot elegance"),
      pair("黑色电影造型", "film-noir glamour"),
      pair("极简性感", "minimal sophisticated allure"),
      pair("浪漫花边", "romantic lace details"),
      pair("高定晚装", "haute-couture evening styling"),
      pair("度假奢华", "resort-luxe styling"),
      pair("复古好莱坞", "vintage Hollywood styling"),
      pair("舞蹈演员热身服", "dancer warm-up styling"),
      pair("居家高级感", "polished at-home styling"),
      pair("自然真实感", "natural realistic adult styling")
    ],
    intimacyLevel: [
      pair("不指定", ""),
      pair("独处安静", "quiet private solitude"),
      pair("浪漫期待", "romantic anticipation"),
      pair("亲密距离", "close personal distance"),
      pair("温柔相拥", "tender embrace"),
      pair("额头相触", "foreheads touching"),
      pair("手抚面部", "gentle hand-to-face contact"),
      pair("靠近耳边低语", "whispering close to the ear"),
      pair("并肩依偎", "leaning together side by side"),
      pair("轻柔亲吻", "a gentle closed-mouth kiss"),
      pair("亲密信任", "intimate trust and emotional closeness"),
      pair("克制暧昧", "restrained romantic tension"),
      pair("高级时装式亲密", "fashion-editorial intimacy")
    ],
    adultScene: [
      pair("不指定", ""),
      pair("精品酒店套房", "a boutique hotel suite"),
      pair("丝质床品卧室", "a bedroom with silk bedding"),
      pair("大理石浴室蒸汽", "a marble bathroom filled with soft steam"),
      pair("私人温泉房", "a private spa room"),
      pair("壁炉休息室", "a fireplace lounge"),
      pair("镜前化妆间", "a vanity room with mirrors"),
      pair("纱帘卧室", "a bedroom with layered sheer curtains"),
      pair("清晨私人阳台", "a private balcony at dawn"),
      pair("深色奢华公寓", "a dark luxury apartment"),
      pair("复古更衣室", "a vintage dressing room"),
      pair("湖畔度假屋", "a lakeside vacation home"),
      pair("沙漠别墅", "a private desert villa"),
      pair("摄影棚沙发区", "a studio lounge with a large sofa"),
      pair("船舱私人卧室", "a private cabin bedroom on a yacht"),
      pair("花园玻璃房", "a glass conservatory beside a garden"),
      pair("雨夜卧室", "a bedroom during a quiet rainy night")
    ],
    adultLighting: [
      pair("不指定", ""),
      pair("薄纱晨光", "soft morning light filtered through sheer curtains"),
      pair("百叶窗条光", "striped window light through blinds"),
      pair("暖色床头灯", "warm bedside lamp light"),
      pair("壁炉火光", "warm firelight"),
      pair("柔和顶光", "soft low overhead light"),
      pair("明暗对比", "quiet chiaroscuro lighting"),
      pair("霓虹窗外光", "neon glow entering from outside"),
      pair("烛光群", "clustered candlelight"),
      pair("蒸汽柔光", "diffused steam-filled light"),
      pair("清晨余晖", "soft dawn glow"),
      pair("侧窗轮廓光", "side-window rim light"),
      pair("金色实用光", "warm practical golden light"),
      pair("低饱和夜灯", "muted low-light bedside glow"),
      pair("镜面反射光", "soft reflected mirror light")
    ],
    adultCameraStyle: [
      pair("不指定", ""),
      pair("高级私房摄影", "tasteful boudoir photography"),
      pair("亲密编辑人像", "intimate editorial portrait"),
      pair("奢华魅力人像", "premium glamour portrait"),
      pair("黑色电影人像", "film-noir portrait"),
      pair("浪漫电影剧照", "romantic cinematic still"),
      pair("纪实式亲密感", "documentary-style intimacy"),
      pair("镜面人像", "mirror portrait"),
      pair("酒店广告摄影", "luxury hotel campaign photography"),
      pair("复古胶片人像", "vintage film portrait"),
      pair("低调情绪摄影", "low-key mood photography"),
      pair("生活化私密感", "natural intimate lifestyle photography"),
      pair("时尚双人肖像", "fashion editorial couples portrait"),
      pair("晨光环境人像", "morning-light environmental portrait"),
      pair("电影近景肖像", "cinematic close-up portrait")
    ],
    adultFraming: [
      pair("不指定", ""),
      pair("眼神特写", "intimate eye-level close-up"),
      pair("面部与锁骨", "face-and-collarbone framing"),
      pair("半身私密构图", "intimate medium framing"),
      pair("七分身姿态", "cowboy-shot framing"),
      pair("全身环境关系", "full-body environmental framing"),
      pair("越过织物", "framed through soft fabric"),
      pair("镜面双重构图", "dual reflection composition"),
      pair("前景遮挡", "layered foreground framing"),
      pair("略微俯拍", "slightly elevated framing"),
      pair("略低机位", "slightly low camera framing"),
      pair("宽银幕留白", "widescreen negative-space framing"),
      pair("局部细节构图", "selective detail framing")
    ],
    adultAtmosphere: [
      pair("不指定", ""),
      pair("柔和浪漫", "soft romantic atmosphere"),
      pair("安静暧昧", "quiet suggestive atmosphere"),
      pair("奢华私密", "luxurious private atmosphere"),
      pair("清晨慵懒", "lazy morning atmosphere"),
      pair("夜色神秘", "mysterious night atmosphere"),
      pair("温暖信任", "warm trusting atmosphere"),
      pair("克制渴望", "restrained longing atmosphere"),
      pair("电影张力", "cinematic tension"),
      pair("雨声包围", "rain-wrapped intimacy"),
      pair("蒸汽朦胧", "steamy diffused atmosphere"),
      pair("复古精致", "polished vintage atmosphere"),
      pair("海滩度假", "private resort atmosphere"),
      pair("高定秀场后台", "couture backstage atmosphere"),
      pair("梦幻朦胧", "dreamlike soft atmosphere")
    ],
    adultRelationship: [
      pair("不指定", ""),
      pair("独自一人", "alone and self-assured"),
      pair("双方自愿的伴侣", "consenting adult partners"),
      pair("浪漫情侣", "romantic adult couple"),
      pair("新婚伴侣", "newly partnered adults"),
      pair("长期伴侣", "long-term adult partners"),
      pair("互相尊重", "mutual respect and trust"),
      pair("亲密朋友", "close adult companions"),
      pair("初次约会", "adult first-date atmosphere"),
      pair("久别重逢", "adult reunion after time apart"),
      pair("安静陪伴", "quiet companionship"),
      pair("双向吸引", "mutual adult attraction"),
      pair("平等关系", "equal and mutually consenting relationship")
    ],
    audioMode: [
      pair("仅环境音", "ambient sound only, no dialogue"),
      pair("单人画外音", "one character provides voice-over"),
      pair("单人现场对白", "one character speaks on camera"),
      pair("双人现场对白", "two characters exchange dialogue"),
      pair("对白加画外音", "on-camera dialogue with additional voice-over"),
      pair("自然声音优先", "natural ambience with restrained vocal performance")
    ],
    voiceTone: [
      pair("自然平实", "natural conversational delivery"),
      pair("安静温柔", "quiet gentle delivery"),
      pair("克制低沉", "restrained low-volume delivery"),
      pair("自信清晰", "confident articulate delivery"),
      pair("紧张急促", "tense quickened delivery"),
      pair("轻柔耳语", "soft whispered delivery"),
      pair("含笑说话", "gently smiling speech"),
      pair("情绪压抑", "emotionally restrained delivery"),
      pair("画外叙述", "calm voice-over narration")
    ],
    consistencyFocus: [
      pair("全部保持一致", "preserve identity, outfit, environment, framing, and lighting"),
      pair("人物身份优先", "prioritize facial identity and body proportions"),
      pair("服装与发型优先", "prioritize outfit, hairstyle, and accessories"),
      pair("场景与背景优先", "prioritize environment, background layout, and object positions"),
      pair("构图与机位优先", "prioritize camera framing, angle, and composition"),
      pair("动作连贯优先", "prioritize continuous motion and realistic physical interaction")
    ],
    sound: [
      pair("安静室内环境声", "quiet indoor room tone"),
      pair("雨声", "steady rain against the windows"),
      pair("城市远处环境声", "distant city ambience"),
      pair("轻柔呼吸", "soft natural breathing"),
      pair("布料摩擦", "subtle fabric movement"),
      pair("脚步声", "soft measured footsteps"),
      pair("咖啡厅低语", "quiet cafe chatter"),
      pair("森林鸟鸣", "distant forest birds"),
      pair("海浪", "gentle ocean waves"),
      pair("机械低频", "low mechanical hum"),
      pair("音乐氛围", "soft ambient music atmosphere"),
      pair("无人声", "no voices")
    ]
  };

  const ROLE_PRESETS = {
    "urban everyday": {
      gender: "adult woman",
      hairStyle: "long wavy hair with natural texture",
      hairColor: "dark brown",
      outfit: "oversized white shirt",
      fabric: "soft cotton and linen",
      accessories: "minimal silver earrings",
      pose: "standing beside a window",
      scene: "a quiet cafe beside a large window",
      lighting: "large soft window light",
      visualStyle: "Japanese portrait photography"
    },
    "fashion editorial": {
      gender: "adult woman",
      body: "runway model proportions",
      face: "defined cheekbones",
      hairStyle: "layered medium-length hair",
      outfit: "tailored black suit",
      fabric: "matte leather",
      accessories: "metal wristwatch",
      pose: "turning back over the shoulder",
      scene: "a minimalist photography studio",
      lighting: "controlled three-point studio lighting",
      visualStyle: "high-fashion editorial"
    },
    "modern professional": {
      gender: "adult man",
      hairStyle: "short textured crop",
      outfit: "tailored black suit",
      accessories: "reading glasses",
      pose: "standing naturally",
      scene: "an apartment with floor-to-ceiling windows",
      lighting: "soft side backlight",
      visualStyle: "premium commercial photography"
    },
    "vintage screen siren": {
      gender: "adult woman",
      hairStyle: "soft French braid",
      hairColor: "auburn",
      expression: "subtle closed-mouth smile",
      outfit: "floor-length silk evening gown",
      fabric: "rich velvet",
      grooming: "vintage red lip",
      pose: "leaning on a railing",
      scene: "a luxurious hotel corridor",
      lighting: "warm practical lamp light",
      palette: "muted vintage film colors",
      visualStyle: "vintage film aesthetic"
    },
    "cyberpunk investigator": {
      gender: "adult androgynous person",
      hairStyle: "short textured crop",
      hairColor: "blue-black",
      outfit: "futuristic utility suit",
      fabric: "technical performance fabric",
      accessories: "compact tactical gear",
      pose: "leaning against a wall",
      scene: "a neon-lit urban alley",
      lighting: "colorful practical neon lighting",
      palette: "neon pink and cyan palette",
      visualStyle: "cyberpunk visual style"
    },
    "fantasy traveler": {
      gender: "adult woman",
      hairStyle: "soft French braid",
      hairColor: "platinum blonde",
      outfit: "fantasy leather armor",
      fabric: "brushed wool",
      accessories: "small mechanical device",
      pose: "walking toward the camera",
      scene: "an enchanted fantasy forest",
      lighting: "volumetric light rays",
      visualStyle: "fantasy concept art"
    },
    "classical martial hero": {
      gender: "adult man",
      hairStyle: "high ponytail",
      hairColor: "natural black",
      outfit: "layered traditional Hanfu robe",
      fabric: "fluid silk",
      accessories: "hat",
      pose: "mid-turn movement",
      scene: "a classical courtyard",
      lighting: "soft overcast diffusion",
      palette: "earth-tone palette",
      visualStyle: "modern East Asian aesthetic"
    },
    "sci-fi pilot": {
      gender: "adult woman",
      hairStyle: "low ponytail",
      hairColor: "blue-black",
      outfit: "sci-fi pilot flight suit",
      fabric: "technical performance fabric",
      accessories: "metal wristwatch",
      pose: "seated on a chair",
      scene: "a spacecraft interior",
      lighting: "cool screen glow",
      palette: "deep ocean-blue palette",
      visualStyle: "cinematic photorealism"
    },
    musician: {
      gender: "adult man",
      hairStyle: "messy natural short hair",
      outfit: "black leather biker jacket",
      accessories: "over-ear headphones",
      pose: "seated on a chair",
      scene: "a theater backstage area",
      lighting: "low-key cinematic lighting",
      visualStyle: "documentary photography"
    },
    artist: {
      gender: "adult woman",
      hairStyle: "loose updo",
      outfit: "oversized hoodie",
      accessories: "",
      props: "brushes and a canvas",
      pose: "standing naturally",
      scene: "a contemporary art gallery",
      lighting: "soft overcast diffusion",
      visualStyle: "documentary photography"
    },
    athlete: {
      gender: "adult man",
      body: "athletic build",
      hairStyle: "buzz cut",
      outfit: "athletic yoga wear",
      fabric: "technical performance fabric",
      pose: "gently stretching",
      scene: "a modern gym",
      lighting: "large soft window light",
      visualStyle: "premium commercial photography"
    },
    scholar: {
      gender: "adult woman",
      face: "soft facial contours",
      hairStyle: "low ponytail",
      outfit: "soft gray knit sweater",
      accessories: "reading glasses",
      pose: "seated on a chair",
      scene: "a quiet library with tall bookshelves",
      lighting: "large soft window light",
      visualStyle: "cinematic film still"
    },
    "aristocratic character": {
      gender: "adult man",
      face: "mature facial structure",
      hairStyle: "layered medium-length hair",
      outfit: "vintage plaid suit",
      fabric: "rich velvet",
      accessories: "brooch",
      pose: "leaning on a railing",
      scene: "a medieval castle hall",
      lighting: "low-key cinematic lighting",
      visualStyle: "dark cinematic aesthetic"
    }
  };

  const QUICK_PRESETS = [
    {
      icon: "◐",
      name: "清晨酒店",
      sub: "柔光 / 人像 / 安静",
      state: {
        model: "zimage_turbo",
        subjectType: "person",
        gender: "adult woman",
        age: "in their thirties",
        outfit: "oversized white shirt",
        pose: "standing beside a window",
        action: "subtle breathing and natural blinking",
        scene: "a quiet hotel room in the morning",
        timeOfDay: "early morning",
        weather: "controlled indoor atmosphere",
        lighting: "large soft window light",
        palette: "low-saturation cream palette",
        filmLook: "35mm film look",
        visualStyle: "cinematic photorealism"
      }
    },
    {
      icon: "☂",
      name: "雨夜电影",
      sub: "霓虹 / 街头 / 情绪",
      state: {
        model: "zimage_turbo",
        subjectType: "person",
        gender: "adult man",
        age: "in their thirties",
        outfit: "long trench coat",
        pose: "walking toward the camera",
        action: "walking with natural motion",
        scene: "a rain-soaked city street at night",
        timeOfDay: "late night",
        weather: "light rain",
        props: "a black umbrella",
        lighting: "colorful practical neon lighting",
        palette: "cool teal-blue palette",
        atmosphere: "rain mist",
        visualStyle: "cinematic film still"
      }
    },
    {
      icon: "◇",
      name: "时尚编辑",
      sub: "棚拍 / 造型 / 高级感",
      state: {
        model: "flux2",
        subjectType: "person",
        gender: "adult woman",
        age: "in their twenties",
        body: "runway model proportions",
        outfit: "tailored black suit",
        pose: "turning back over the shoulder",
        scene: "a minimalist photography studio",
        lighting: "controlled three-point studio lighting",
        visualStyle: "high-fashion editorial"
      }
    },
    {
      icon: "⌁",
      name: "赛博城市",
      sub: "未来 / 霓虹 / 动作",
      state: {
        model: "h3_t2v",
        subjectType: "person",
        gender: "adult androgynous person",
        age: "in their thirties",
        outfit: "futuristic utility suit",
        pose: "leaning against a wall",
        action: "slowly turning around",
        scene: "a neon-lit urban alley",
        timeOfDay: "night",
        lighting: "colorful practical neon lighting",
        visualStyle: "cyberpunk visual style",
        cameraMove: "slow steady push-in"
      }
    },
    {
      icon: "✦",
      name: "奇幻旅者",
      sub: "森林 / 冒险 / 电影感",
      state: {
        model: "h3_t2v",
        subjectType: "person",
        gender: "adult woman",
        age: "in their thirties",
        outfit: "fantasy leather armor",
        pose: "walking toward the camera",
        action: "taking one deliberate step forward",
        scene: "an enchanted fantasy forest",
        lighting: "volumetric light rays",
        atmosphere: "thin atmospheric haze",
        visualStyle: "fantasy concept art",
        motionLevel: "clear moderate motion"
      }
    },
    {
      icon: "▣",
      name: "产品广告",
      sub: "棚拍 / 微距 / 商业",
      state: {
        model: "flux2",
        subjectType: "object",
        objectDescription: "精密黑色机械腕表",
        scene: "a minimalist photography studio",
        lighting: "controlled three-point studio lighting",
        shotSize: "macro detail shot",
        composition: "centered symmetrical composition",
        palette: "warm golden palette",
        visualStyle: "premium commercial photography"
      }
    },
    {
      icon: "◒",
      name: "日系人像",
      sub: "窗光 / 通透 / 清新",
      state: {
        model: "zimage_turbo",
        subjectType: "person",
        gender: "adult woman",
        age: "in their twenties",
        expression: "gentle expression",
        skin: "soft translucent skin",
        outfit: "relaxed t-shirt and trousers",
        pose: "standing beside a window",
        scene: "a quiet cafe beside a large window",
        timeOfDay: "late morning",
        lighting: "large soft window light",
        palette: "soft rose and skin-tone palette",
        atmosphere: "airy atmospheric depth",
        visualStyle: "Japanese portrait photography"
      }
    },
    {
      icon: "▶",
      name: "短视频分镜",
      sub: "Wan / 单动作 / 竖屏",
      state: {
        model: "wan_ti2v_5b",
        subjectType: "person",
        gender: "adult woman",
        age: "in their twenties",
        outfit: "relaxed t-shirt and trousers",
        pose: "standing naturally",
        action: "looking back",
        interaction: "standing shoulder to shoulder",
        scene: "a city street",
        timeOfDay: "golden hour",
        lighting: "warm golden-hour sunlight",
        aspectRatio: "aspect ratio 9:16, vertical short video",
        cameraMove: "subtle handheld follow",
        visualStyle: "cinematic photorealism"
      }
    }
  ];

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
    adultStyling: "",
    intimacyLevel: "",
    adultScene: "",
    adultLighting: "",
    adultCameraStyle: "",
    adultFraming: "",
    adultAtmosphere: "",
    adultRelationship: "",
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

  function currentAdultMode() {
    return Boolean($("adultMode")?.checked);
  }

  function getOptionPairs(field) {
    const key = FIELD_TO_OPTIONS[field];
    const list = O[key] || [];
    const base = currentAdultMode() ? list : list.filter((item) => !item.adultOnly);
    const mergeKey = ADULT_OPTION_MERGES[field];
    if (!currentAdultMode() || !mergeKey) return base;
    const merged = [...base, ...(O[mergeKey] || []).filter((item) => item.en)];
    return [...new Map(merged.map((item) => [item.en.toLowerCase(), item])).values()];
  }

  function fillSelect(id, items, placeholder) {
    const select = $(id);
    if (!select) return;
    const previous = select.value;
    const hasPlaceholder = placeholder !== undefined;
    const allItems = hasPlaceholder ? [pair(placeholder, ""), ...items] : items;
    select.innerHTML = "";
    for (const item of allItems) {
      const option = document.createElement("option");
      option.value = item.en;
      option.textContent = item.zh;
      select.append(option);
    }
    if ([...select.options].some((option) => option.value === previous)) {
      select.value = previous;
    } else if (select.options.length) {
      select.selectedIndex = 0;
    }
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
    if (state.adultMode !== undefined) $("adultMode").checked = Boolean(state.adultMode);
    populateSelects();

    $$("[data-state]").forEach((element) => {
      if (state[element.id] === undefined) return;
      if (element.type === "checkbox") {
        element.checked = Boolean(state[element.id]);
      } else {
        element.value = String(state[element.id]);
      }
    });

    const qualityValues = new Set(Array.isArray(state.quality) ? state.quality : []);
    $$("[data-quality]").forEach((checkbox) => {
      checkbox.checked = qualityValues.has(checkbox.value);
    });
    updateVisibility();
    if (generate) updateOutput();
  }

  function applyDefaults() {
    $("adultMode").checked = false;
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
    updateVisibility();
  }

  function getModel() {
    const key = $("model").value || DEFAULTS.model;
    const base = MODELS[key] || MODELS[DEFAULTS.model];
    if (key !== "custom") return { key, ...base };

    const format = $("customFormat").value;
    const type = format === "h3" || format === "i2v" ? "video" : "image";
    return {
      key,
      ...base,
      format,
      type,
      i2v: format === "i2v",
      label: inputValue("customModelName") || "我的自定义模型",
      note: type === "video"
        ? "自定义视频模型会使用所选结构；请确认模型实际支持的时长和运镜描述。"
        : "自定义图像模型会按所选输出结构拼接；建议先小分辨率测试。"
    };
  }

  function updateVisibility() {
    const model = getModel();
    const subjectType = $("subjectType").value;
    const hasHuman = ["person", "couple", "group"].includes(subjectType);
    const isCustom = model.key === "custom";
    const adultVisible = currentAdultMode() && hasHuman;

    $$(".custom-only").forEach((element) => {
      element.hidden = !isCustom;
    });
    $$(".video-only").forEach((element) => {
      element.hidden = model.type !== "video";
    });
    $$(".h3-only").forEach((element) => {
      element.hidden = !["h3", "i2v"].includes(model.format);
    });
    $$(".character-only").forEach((element) => {
      element.hidden = !hasHuman;
    });
    $$(".creature-only").forEach((element) => {
      element.hidden = subjectType !== "creature";
    });
    $$(".object-only").forEach((element) => {
      element.hidden = subjectType !== "object";
    });
    $$(".adult-card, .adult-nav").forEach((element) => {
      element.hidden = !adultVisible;
    });

    $("modeBadge").textContent = model.type === "video" ? "视频" : model.type === "edit" ? "编辑" : "图像";
    $("outputModel").textContent = model.label;
    $("modelHint").textContent = model.note;
    $("modelSummary").textContent = model.note;

    const notice = $("modelNotice");
    if (model.i2v) {
      notice.textContent = "图生视频模式：人物、服装和构图来自首帧，输出会省略重复的外貌描述，重点描述动作、物理反馈和镜头。";
    } else if (model.format === "h3") {
      notice.textContent = "MiniMax H3 模式：输出包含单一连续镜头、时间段拆分、机位和音频线索。";
    } else if (model.format === "edit") {
      notice.textContent = "编辑模式：输出会要求保持人物身份、姿势、构图和背景，只修改你选定的目标。";
    } else if (model.key === "custom") {
      notice.textContent = model.note;
    } else {
      notice.textContent = `${model.label} 将使用自然语言结构。所有字段都可留空，页面会自动省略空项。`;
    }
  }

  function applyRolePreset() {
    const preset = ROLE_PRESETS[$("rolePreset").value];
    if (!preset) return;
    for (const [id, value] of Object.entries(preset)) {
      setSelectValue(id, value);
    }
  }

  function applyQuickPreset(preset) {
    const state = { ...collectState(), ...preset.state };
    applyState(state);
    showToast(`已载入「${preset.name}」`);
    document.querySelector(".output-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    return languageJoin(details, lang);
  }

  function motionText(lang) {
    const pose = pairText("pose", lang);
    const bodyOrientation = pairText("bodyOrientation", lang);
    const gaze = pairText("gaze", lang);
    const handPose = pairText("handPose", lang);
    const legPose = pairText("legPose", lang);
    const postureLine = pairText("postureLine", lang);
    const action = pairText("action", lang);
    const interaction = pairText("interaction", lang);
    const motion = pairText("motionLevel", lang);
    const moving = getModel().type === "video" ? motion : "";
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
    if (!currentAdultMode() || !["person", "couple", "group"].includes(type)) return "";
    return languageJoin([
      pairText("adultArchetype", lang),
      pairText("intimacyLevel", lang),
      lang === "zh" ? "克制且非露骨" : "tasteful non-explicit presentation"
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
      ].filter(Boolean).join("。") + "。";
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
    ].filter(Boolean).join(". ") + ".";
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
    return languageJoin([model.negative, custom], "en");
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
      prompt: positive,
      negativePrompt: negative
    };
    return { positive, negative, json, model };
  }

  function updateOutput() {
    latestOutput = buildOutput();
    $("promptOutput").value = latestOutput.positive;
    $("negativeOutput").value = latestOutput.negative;
    $("jsonOutput").value = JSON.stringify(latestOutput.json, null, 2);
    $("outputModel").textContent = latestOutput.model.label;
    const characters = latestOutput.positive.length;
    const words = latestOutput.positive.trim() ? latestOutput.positive.trim().split(/\s+/).length : 0;
    $("promptStats").textContent = `${characters} 字符 · ${words} 词`;
  }

  function refreshAdultDependentFields() {
    for (const field of [
      "expression",
      "outfit",
      "grooming",
      "pose",
      "interaction",
      "scene",
      "lighting",
      "composition",
      "mood",
      "visualStyle",
      "intimacyLevel"
    ]) {
      fillSelect(field, getOptionPairs(field));
    }
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
      title: `${latestOutput.model.label} · ${latestOutput.positive.slice(0, 42)}`,
      prompt: latestOutput.positive,
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
      prompt: latestOutput.positive
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

  function randomize() {
    const skip = new Set(["model", "language", "detailLevel", "subjectType", "customFormat", "rolePreset"]);
    for (const [field, key] of Object.entries(FIELD_TO_OPTIONS)) {
      if (skip.has(field)) continue;
      const options = getOptionPairs(field).filter((item) => item.en);
      if (!options.length) continue;
      setSelectValue(field, options[Math.floor(Math.random() * options.length)].en);
    }
    const qualityOptions = $$("[data-quality]");
    qualityOptions.forEach((checkbox) => {
      checkbox.checked = Math.random() > 0.72;
    });
    updateVisibility();
    updateOutput();
    saveAutosave();
    showToast("已生成一组随机组合");
  }

  function analyzePrompt() {
    const model = getModel();
    const prompt = latestOutput.positive.trim();
    const lower = prompt.toLowerCase();
    const subjectType = $("subjectType").value;
    const humanSubject = ["person", "couple", "group"].includes(subjectType);
    const clauses = prompt
      .split(/[,，\n]/)
      .map((part) => part.trim().toLowerCase().replace(/[.。;；]+$/g, ""))
      .filter(Boolean);
    const clauseCounts = new Map();
    for (const clause of clauses) clauseCounts.set(clause, (clauseCounts.get(clause) || 0) + 1);
    const duplicateClauses = [...clauseCounts.entries()].filter(([, count]) => count > 1);
    const placeholders = [...new Set(prompt.match(/\[[^\]\n]{2,120}\]/g) || [])]
      .filter((value) => !/^\[\d+(?:\.\d+)?s-\d+(?:\.\d+)?s\]$/i.test(value));
    const words = prompt.split(/\s+/).filter(Boolean).length;
    const checks = [];

    const subjectReady = subjectType === "object"
      ? Boolean(inputValue("objectDescription"))
      : Boolean($("gender").value && $("age").value);
    checks.push({
      status: subjectReady ? "pass" : "fail",
      title: "主体信息",
      detail: subjectReady ? "主体类型、年龄或物体描述已填写。" : "请补充角色信息或物体描述。"
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

    if (currentAdultMode()) {
      const safeText = lower.includes("non-explicit") || lower.includes("非露骨");
      checks.push({
        status: humanSubject && safeText ? "pass" : "warn",
        title: "成人模式边界",
        detail: humanSubject && safeText ? "已标记成年人、虚构角色和非露骨内容。" : "建议开启人物主体并保留安全边界说明。"
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

    const lengthOk = words >= 20 && words <= (model.type === "video" ? 420 : 360);
    checks.push({
      status: lengthOk ? "pass" : "warn",
      title: "提示词长度",
      detail: lengthOk ? `当前约 ${words} 词，长度适合。` : `当前约 ${words} 词，可能过短或过长，建议精简次要描述。`
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
    score.textContent = `${review.percent} 分 · ${review.checks.length - failed - warned}/${review.checks.length} 项通过`;
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
      if (target.matches("[data-quality]")) {
        updateOutput();
        saveAutosave();
        return;
      }
      if (!target.matches("[data-state]")) return;

      if (target.id === "model" || target.id === "customFormat") {
        updateVisibility();
      }
      if (target.id === "subjectType") {
        updateVisibility();
      }
      if (target.id === "rolePreset") {
        applyRolePreset();
      }
      if (target.id === "adultMode") {
        refreshAdultDependentFields();
      }
      updateOutput();
      saveAutosave();
    });

    $("generateButton").addEventListener("click", () => {
      updateOutput();
      showToast("提示词已更新");
      document.querySelector(".output-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("reviewButton").addEventListener("click", openReview);
    $("randomButton").addEventListener("click", randomize);
    $("resetButton").addEventListener("click", () => {
      applyDefaults();
      updateOutput();
      saveAutosave();
      showToast("已恢复初始选项");
    });
    $("copyPromptButton").addEventListener("click", () => copyText(latestOutput.positive, "正向提示词已复制"));
    $("copyPromptLarge").addEventListener("click", () => copyText(latestOutput.positive, "正向提示词已复制"));
    $("copyNegativeButton").addEventListener("click", () => copyText(latestOutput.negative, "负面提示词已复制"));
    $("copyNegativeTabButton").addEventListener("click", () => copyText(latestOutput.negative, "负面提示词已复制"));
    $("copyJsonButton").addEventListener("click", () => copyText($("jsonOutput").value, "JSON 已复制"));
    $("saveButton").addEventListener("click", savePreset);
    $("exportButton").addEventListener("click", exportPresets);
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
    $("helpButton").addEventListener("click", () => $("helpDialog").showModal());
    $("helpCloseButton").addEventListener("click", () => $("helpDialog").close());
    $("helpDialog").addEventListener("click", (event) => {
      if (event.target === $("helpDialog")) $("helpDialog").close();
    });
    $("reviewCloseButton").addEventListener("click", () => $("reviewDialog").close());
    $("reviewCloseButton2").addEventListener("click", () => $("reviewDialog").close());
    $("reviewCopyButton").addEventListener("click", async () => {
      await copyText(latestOutput.positive, "提示词已复制");
      $("reviewDialog").close();
    });
    $("reviewDialog").addEventListener("click", (event) => {
      if (event.target === $("reviewDialog")) $("reviewDialog").close();
    });

    const sections = $$(".form-card[id]");
    const links = $$(".step-nav a");
    if ("IntersectionObserver" in window) {
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

  function renderPromptPresets() {
    const root = $("promptPresetList");
    for (const preset of QUICK_PRESETS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-button";
      const icon = document.createElement("span");
      icon.className = "preset-icon";
      icon.textContent = preset.icon;
      const text = document.createElement("span");
      const title = document.createElement("strong");
      const sub = document.createElement("small");
      title.textContent = preset.name;
      sub.textContent = preset.sub;
      text.append(title, sub);
      button.append(icon, text);
      button.addEventListener("click", () => applyQuickPreset(preset));
      root.append(button);
    }
  }

  function init() {
    populateSelects({ preserve: false });
    applyDefaults();
    renderPromptPresets();
    renderSaved();
    renderHistory();
    setupTabs();
    setupEvents();

    const savedTheme = localStorage.getItem("promptStudio.theme.v1");
    if (savedTheme === "light") document.body.classList.add("light");
    const autosave = storageGet("promptStudio.autosave.v1", null);
    if (autosave) applyState(autosave);
    updateOutput();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
