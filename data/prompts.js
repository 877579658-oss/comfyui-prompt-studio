/* ComfyUI Prompt Studio - 词库数据
 *
 * 这个文件只放数据，不放逻辑。新增词条、改默认值、加模型都在这里改，
 * 不需要碰 app.js。
 *
 * pair(中文, English)              —— 中文显示、英文写入提示词
 * pair(中文, English, { adultOnly: true }) —— 成人向条目：界面上加 ·AD 标记并归入「成人向 · 18+」分组
 *
 * 改完刷新页面即可；若提示“词库数据没有加载”，检查 index.html 里 data/prompts.js
 * 是否在 app.js 之前引入。
 */
(() => {
  "use strict";

  const pair = (zh, en, extra = {}) => ({ zh, en, ...extra });

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
  h3_fast: {
    label: "MiniMax H3（turbo 4 步）",
    type: "video",
    format: "h3",
    note: "H3 快出模式：叠加 turbo 4 步加速 LoRA，出片快、细节略低。提示词仍按 120–280 词长散文写，排除项已自动附加到句尾。",
    negative: "flicker, temporal inconsistency, identity drift, warped limbs, morphing objects, jump cuts, abrupt camera movement, text, subtitles, watermark"
  },
  wan_i2v_fast: {
    label: "Wan 2.2 I2V（4 步加速）",
    type: "video",
    format: "wan",
    i2v: true,
    note: "叠加 lightx2v 4 步加速 LoRA 的工作流。首帧决定人物与构图，提示词只写动作、物理联动、镜头和光线。",
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
    pair("2.39:1 宽银幕", "aspect ratio 2.39:1, anamorphic widescreen"),
    pair("4:3 经典比例", "aspect ratio 4:3, classic photography"),
    pair("3:4 竖版经典", "aspect ratio 3:4, vertical classic"),
    pair("2:3 竖版人像", "aspect ratio 2:3, portrait photography"),
    pair("5:4 中画幅", "aspect ratio 5:4, medium format"),
    pair("16:10 宽屏", "aspect ratio 16:10, widescreen"),
    pair("21:9 超宽银幕", "aspect ratio 21:9, ultrawide cinematic"),
  
  ],
  gender: [
    pair("成年女性", "adult woman"),
    pair("成年男性", "adult man"),
    pair("中性气质成年人", "adult androgynous person"),
    pair("成对女性角色", "two adult women", { people: 2 }),
    pair("成对男女角色", "an adult woman and an adult man", { people: 2 }),
    pair("成对男性角色", "two adult men", { people: 2 }),
    pair("成对成年人，性别不限定", "two adult characters with varied gender presentation", { people: 2 }),
    pair("三位女性角色", "three adult women", { people: 3 }),
    pair("两女一男角色", "two adult women and one adult man", { people: 3 }),
    pair("一女两男角色", "one adult woman and two adult men", { people: 3 }),
    pair("三位男性角色", "three adult men", { people: 3 })
  ],
  characterPresentation: [
    pair("不指定", ""),
    pair("成年女性", "adult woman"),
    pair("成年男性", "adult man"),
    pair("中性气质成年人", "adult androgynous person")
  ],
  characterPosition: [
    pair("不指定", ""),
    pair("左前景", "left foreground"),
    pair("中间前景", "center foreground"),
    pair("右前景", "right foreground"),
    pair("左中景", "left midground"),
    pair("中间中景", "center midground"),
    pair("右中景", "right midground"),
    pair("左侧后方", "left background"),
    pair("中间后方", "center background"),
    pair("右侧后方", "right background"),
    pair("位于角色 A 身后", "behind character A"),
    pair("位于角色 A 与 B 之间", "between characters A and B")
  ],
  visualEmphasis: [
    pair("均衡", ""),
    pair("情绪与关系", "expressive eye contact, intimate body language, restrained relational tension"),
    pair("身体线条", "clear body-line composition, camera-facing posture, sculpted rim light"),
    pair("时装与材质", "fashion-editorial styling, visible fabric texture, detailed accessories"),
    pair("氛围与叙事", "environmental storytelling, atmospheric depth, cinematic mood"),
    pair("动作与姿态", "dynamic pose emphasis, clear body mechanics, expressive posture")
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
    pair("东亚外貌", "East Asian features", { group: "东亚" }),
    pair("东南亚外貌", "Southeast Asian features", { group: "东南亚南亚" }),
    pair("南亚外貌", "South Asian features", { group: "东南亚南亚" }),
    pair("欧洲外貌", "European features", { group: "欧洲" }),
    pair("非洲外貌", "African features", { group: "非洲" }),
    pair("拉美外貌", "Latin American features", { group: "美洲太平洋" }),
    pair("中东外貌", "Middle Eastern features", { group: "西亚中亚" }),
    pair("多元混血外貌", "mixed-heritage features", { group: "混血" }),
    pair("不指定", ""),
    pair("日韩外貌", "Japanese and Korean features", { group: "东亚" }),
    pair("北欧外貌", "Nordic features", { group: "欧洲" }),
    pair("东欧斯拉夫外貌", "Slavic features", { group: "欧洲" }),
    pair("地中海外貌", "Mediterranean features", { group: "欧洲" }),
    pair("西欧外貌", "Western European features", { group: "欧洲" }),
    pair("西非外貌", "West African features", { group: "非洲" }),
    pair("东非外貌", "East African features", { group: "非洲" }),
    pair("北非阿拉伯外貌", "North African Arab features", { group: "非洲" }),
    pair("中亚外貌", "Central Asian features", { group: "西亚中亚" }),
    pair("土耳其与西亚外貌", "Turkish and West Asian features", { group: "西亚中亚" }),
    pair("犹太裔外貌", "Ashkenazi features", { group: "西亚中亚" }),
    pair("美洲原住民外貌", "Indigenous American features", { group: "美洲太平洋" }),
    pair("太平洋岛民外貌", "Pacific Islander features", { group: "美洲太平洋" }),
    pair("欧亚混血外貌", "Eurasian mixed features", { group: "混血" }),
    pair("非欧混血外貌", "Afro-European mixed features", { group: "混血" }),
    pair("拉美混血外貌", "Latin American mixed features", { group: "混血" }),
  
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
  bodyProportion: [
    pair("不指定", ""),
    pair("自然比例", "natural body proportions"),
    pair("长腿比例", "long-legged proportions"),
    pair("上身修长比例", "elongated torso proportions"),
    pair("紧凑比例", "compact overall proportions"),
    pair("沙漏型轮廓", "hourglass silhouette"),
    pair("梨形轮廓", "pear-shaped silhouette"),
    pair("倒三角运动轮廓", "athletic V-shaped silhouette"),
    pair("矩形轮廓", "rectangular silhouette"),
    pair("模特级纵向比例", "elongated runway proportions")
  ],
  waistShape: [
    pair("不指定", ""),
    pair("自然腰线", "natural waistline"),
    pair("腰线清晰", "clearly defined waist"),
    pair("细腰", "narrow waist"),
    pair("高腰比例", "high-waisted proportion"),
    pair("腰部收紧", "gently cinched waist"),
    pair("腰腹柔和", "soft midsection"),
    pair("腰胯比明显", "pronounced waist-to-hip ratio")
  ],
  hipContour: [
    pair("不指定", ""),
    pair("自然臀胯线条", "natural hip line"),
    pair("髋部较窄", "narrow hip line"),
    pair("髋部圆润", "rounded hip contour"),
    pair("胯部丰满", "full hip curve"),
    pair("胯部曲线明显", "pronounced hip curve"),
    pair("臀部紧致", "toned glute contour"),
    pair("臀部上翘", "lifted rounded glute contour"),
    pair("臀部柔和圆润", "soft rounded glute contour")
  ],
  chestContour: [
    pair("不指定", ""),
    pair("自然胸部轮廓", "natural chest contour"),
    pair("胸部轮廓平坦", "flat chest contour"),
    pair("胸部轮廓适中", "medium bust silhouette"),
    pair("胸部轮廓丰满", "full bust silhouette"),
    pair("胸部轮廓挺拔", "uplifted bust silhouette"),
    pair("胸廓宽阔", "broad chest"),
    pair("胸肌轮廓明显", "defined pectoral contour"),
    pair("胸部轮廓柔和", "soft chest contour")
  ],
  legProportion: [
    pair("不指定", ""),
    pair("腿部比例自然", "balanced leg proportions"),
    pair("长腿", "long legs"),
    pair("纤细腿型", "slender legs"),
    pair("紧实腿型", "toned legs"),
    pair("大腿有力量感", "athletic thigh definition"),
    pair("腿部曲线明显", "curved leg silhouette"),
    pair("腿部线条笔直", "straight leg lines")
  ],
  muscleTone: [
    pair("不指定", ""),
    pair("柔软自然", "soft natural muscle tone"),
    pair("轻度紧致", "lightly toned physique"),
    pair("线条清晰", "defined muscle contour"),
    pair("运动型紧实", "athletic muscle tone"),
    pair("精瘦有力", "lean and strong physique"),
    pair("力量感明显", "pronounced muscular definition")
  ],
  bodyEmphasis: [
    pair("不指定", ""),
    pair("自然呈现", "natural understated proportions"),
    pair("轻微强化", "subtly emphasized body contour"),
    pair("明显强化", "clearly defined body silhouette"),
    pair("高定风格化", "high-fashion stylized body proportions")
  ],
  face: [
    pair("鹅蛋脸", "oval face", { group: "轮廓" }),
    pair("瓜子脸", "heart-shaped face", { group: "轮廓" }),
    pair("圆脸", "round face", { group: "轮廓" }),
    pair("棱角分明", "angular facial structure", { group: "轮廓" }),
    pair("柔和轮廓", "soft facial contours", { group: "轮廓" }),
    pair("高颧骨", "defined cheekbones", { group: "轮廓" }),
    pair("雀斑", "light natural freckles", { group: "细节" }),
    pair("成熟轮廓", "mature facial structure", { group: "轮廓" }),
    pair("中性化轮廓", "androgynous facial features", { group: "轮廓" }),
    pair("不指定", ""),
    pair("方脸", "a square jawline", { group: "轮廓" }),
    pair("长脸", "a long oval face", { group: "轮廓" }),
    pair("心形脸", "a heart-shaped face with a wide forehead", { group: "轮廓" }),
    pair("三角脸", "a triangular face shape", { group: "轮廓" }),
    pair("下颌线清晰", "a clearly defined jawline", { group: "轮廓" }),
    pair("下颌线柔和", "a softly rounded jawline", { group: "轮廓" }),
    pair("窄下颌", "a narrow lower face", { group: "轮廓" }),
    pair("宽下颌", "a broad lower face", { group: "轮廓" }),
    pair("高额头", "a high forehead", { group: "轮廓" }),
    pair("眉骨明显", "a pronounced brow ridge", { group: "轮廓" }),
    pair("骨相明显", "strong facial bone structure", { group: "轮廓" }),
    pair("皮相柔和", "smooth soft-contoured features", { group: "轮廓" }),
    pair("婴儿肥", "a softly rounded face", { group: "细节" }),
    pair("酒窝", "subtle dimples", { group: "细节" }),
    pair("法令纹浅", "faint smile lines", { group: "细节" }),
    pair("面部留白多", "a spacious facial layout", { group: "细节" }),
  
  ],
  hairStyle: [
    pair("自然微卷长发", "long wavy hair with natural texture"),
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
    pair("两侧渐层短发", "short back-and-sides haircut"),
    pair("后梳油头", "slicked-back hair"),
    pair("纹理飞机头", "textured quiff"),
    pair("三七分短发", "classic side-part haircut"),
    pair("中长层次背头", "medium-length swept-back hair"),
    pair("自然卷短发", "short curly crop"),
    pair("法式短发", "French bob"),
    pair("低盘发", "low chignon"),
    pair("侧分波波头", "side-parted bob"),
    pair("长层次直发", "long layered straight hair"),
    pair("编发盘发", "braided updo"),
    pair("湿发背头", "wet-look slicked hair"),
    pair("不指定", "")
  ],
  hairColor: [
    pair("自然黑", "natural black", { group: "自然色" }),
    pair("深棕", "dark brown", { group: "自然色" }),
    pair("栗棕", "chestnut brown", { group: "自然色" }),
    pair("亚麻棕", "ash brown", { group: "自然色" }),
    pair("金色", "blonde", { group: "暖色调" }),
    pair("铂金", "platinum blonde", { group: "冷色调" }),
    pair("红棕", "auburn", { group: "暖色调" }),
    pair("酒红", "burgundy", { group: "暖色调" }),
    pair("银灰", "silver gray", { group: "冷色调" }),
    pair("蓝黑", "blue-black", { group: "冷色调" }),
    pair("粉色挑染", "pink highlight", { group: "挑染渐变" }),
    pair("渐变发色", "subtle gradient color", { group: "挑染渐变" }),
    pair("不指定", ""),
    pair("黑茶色", "black-tea brown", { group: "自然色" }),
    pair("巧克力棕", "chocolate brown", { group: "自然色" }),
    pair("深栗色", "deep chestnut", { group: "自然色" }),
    pair("暖棕色", "warm brown", { group: "暖色调" }),
    pair("蜂蜜金", "honey blonde", { group: "暖色调" }),
    pair("草莓金", "strawberry blonde", { group: "暖色调" }),
    pair("红铜色", "copper red", { group: "暖色调" }),
    pair("橘红色", "orange-red", { group: "暖色调" }),
    pair("莓果红", "berry red", { group: "暖色调" }),
    pair("银白色", "silver white", { group: "冷色调" }),
    pair("冷棕色", "cool ash brown", { group: "冷色调" }),
    pair("墨蓝色", "midnight blue", { group: "冷色调" }),
    pair("灰紫色", "gray lavender", { group: "冷色调" }),
    pair("奶茶色", "milk-tea beige", { group: "流行染发" }),
    pair("灰粉色", "dusty pink", { group: "流行染发" }),
    pair("薄荷灰绿", "mint ash green", { group: "流行染发" }),
    pair("紫罗兰色", "violet", { group: "流行染发" }),
    pair("蓝紫色", "blue-violet", { group: "流行染发" }),
    pair("蓝色挑染", "blue highlights", { group: "挑染渐变" }),
    pair("紫色挑染", "purple highlights", { group: "挑染渐变" }),
    pair("金色挑染", "golden balayage", { group: "挑染渐变" }),
    pair("双色渐变", "two-tone gradient color", { group: "挑染渐变" }),
    pair("发尾渐变", "ombre ends", { group: "挑染渐变" }),
    pair("冷灰挑染", "cool gray highlights", { group: "挑染渐变" }),
  
  ],
  eyes: [
    pair("深棕眼", "dark brown eyes", { group: "瞳色" }),
    pair("琥珀眼", "amber eyes", { group: "瞳色" }),
    pair("绿色眼睛", "green eyes", { group: "瞳色" }),
    pair("蓝色眼睛", "blue eyes", { group: "瞳色" }),
    pair("灰色眼睛", "gray eyes", { group: "瞳色" }),
    pair("异色瞳", "heterochromia", { group: "瞳色" }),
    pair("细长眼型", "elongated eyes", { group: "眼型" }),
    pair("圆润大眼", "large round eyes", { group: "眼型" }),
    pair("下垂眼", "soft downturned eyes", { group: "眼型" }),
    pair("不指定", ""),
    pair("杏眼", "almond-shaped eyes", { group: "眼型" }),
    pair("丹凤眼", "phoenix eyes with upturned outer corners", { group: "眼型" }),
    pair("桃花眼", "peach-blossom eyes with a soft outer curve", { group: "眼型" }),
    pair("狐狸眼", "fox-like upturned eyes", { group: "眼型" }),
    pair("圆眼", "round eyes", { group: "眼型" }),
    pair("细长眼", "narrow elongated eyes", { group: "眼型" }),
    pair("上挑眼", "upturned eyes", { group: "眼型" }),
    pair("下垂眼尾", "gently downturned outer corners", { group: "眼型" }),
    pair("内双", "a subtle inner double eyelid", { group: "眼型" }),
    pair("单眼皮", "monolid eyes", { group: "眼型" }),
    pair("双眼皮", "a clear double eyelid", { group: "眼型" }),
    pair("眼距偏宽", "slightly wide-set eyes", { group: "眼型" }),
    pair("眼距偏窄", "close-set eyes", { group: "眼型" }),
    pair("深眼窝", "deep-set eyes", { group: "眼型" }),
    pair("卧蚕明显", "a soft under-eye roll", { group: "眉眼细节" }),
    pair("长睫毛", "long lashes", { group: "眉眼细节" }),
    pair("浓密眉", "full natural eyebrows", { group: "眉眼细节" }),
    pair("细眉", "thin arched brows", { group: "眉眼细节" }),
    pair("眉峰明显", "a defined brow arch", { group: "眉眼细节" }),
    pair("榛色瞳", "hazel irises", { group: "瞳色" }),
    pair("灰蓝瞳", "gray-blue irises", { group: "瞳色" }),
    pair("蓝绿瞳", "blue-green irises", { group: "瞳色" }),
    pair("紫灰瞳", "violet-gray irises", { group: "瞳色" }),
    pair("近黑瞳", "near-black irises", { group: "瞳色" }),
  
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
    pair("不指定", ""),
    pair("慵懒半睁眼", "sleepy half-open eyes", { adultOnly: true }),
    pair("含羞侧目", "a shy sideways glance", { adultOnly: true }),
    pair("眼底含笑", "a knowing smile in the eyes", { adultOnly: true }),
    pair("轻咬唇", "a soft lip bite", { adultOnly: true }),
    pair("克制的期待", "restrained anticipation", { adultOnly: true }),
    pair("失神", "a distant, absorbed look", { adultOnly: true }),
  
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
    pair("都市女性日常", "urban everyday", { group: "都市与职业" }),
    pair("都市男性日常", "urban men everyday", { group: "都市与职业" }),
    pair("创意工作室女性", "creative studio woman", { group: "都市与职业" }),
    pair("创意工作室男性", "creative studio man", { group: "都市与职业" }),
    pair("商务女性正装", "business woman", { group: "都市与职业" }),
    pair("商务男性正装", "modern professional", { group: "都市与职业" }),
    pair("医疗专业人士", "medical professional", { group: "都市与职业" }),
    pair("建筑设计师", "architect", { group: "都市与职业" }),
    pair("摄影记者", "photojournalist", { group: "都市与职业" }),
    pair("主厨", "chef", { group: "都市与职业" }),
    pair("律师", "lawyer", { group: "都市与职业" }),
    pair("学者", "scholar", { group: "都市与职业" }),
    pair("时尚编辑", "fashion editorial", { group: "礼服与舞台" }),
    pair("复古名伶", "vintage screen siren", { group: "礼服与舞台" }),
    pair("晚宴女性", "evening gala woman", { group: "礼服与舞台" }),
    pair("黑领结男性", "black tie man", { group: "礼服与舞台" }),
    pair("爵士歌手", "jazz singer", { group: "礼服与舞台" }),
    pair("音乐人", "musician", { group: "礼服与舞台" }),
    pair("艺术家", "artist", { group: "礼服与舞台" }),
    pair("运动员", "athlete", { group: "都市与职业" }),
    pair("清晨居家女性", "morning at home woman", { group: "居家与私房" }),
    pair("清晨居家男性", "morning at home man", { group: "居家与私房" }),
    pair("私房写真女性", "boudoir portrait woman", { group: "居家与私房", adultOnly: true }),
    pair("私房写真男性", "boudoir portrait man", { group: "居家与私房", adultOnly: true }),
    pair("男女约会", "date night couple", { group: "双人关系" }),
    pair("男男约会", "male couple date", { group: "双人关系" }),
    pair("女女约会", "female couple date", { group: "双人关系" }),
    pair("成年伴侣", "adult couple portrait", { group: "双人关系" }),
    pair("创意搭档", "creative duo", { group: "双人关系" }),
    pair("三人朋友合影", "three friends portrait", { group: "多人关系" }),
    pair("赛博探员", "cyberpunk investigator", { group: "幻想与概念" }),
    pair("奇幻旅者", "fantasy traveler", { group: "幻想与概念" }),
    pair("古典侠客", "classical martial hero", { group: "幻想与概念" }),
    pair("科幻机师", "sci-fi pilot", { group: "幻想与概念" }),
    pair("贵族角色", "aristocratic character", { group: "幻想与概念" })
  ],
  outfitMode: [
    pair("完整穿搭", "normal outfit", { group: "基础" }),
    pair("透视叠穿", "sheer layered outfit", { adultOnly: true, group: "成人向" }),
    pair("局部裸露 / 半裸", "half-nude styling", { adultOnly: true, group: "成人向" }),
    pair("裸体", "fully nude", { adultOnly: true, group: "成人向" })
  ],
  halfNudeStyle: [
    pair("上身裸露，下装遮蔽", "bare upper body with the lower body covered", { adultOnly: true, zone: "lower" }),
    pair("上身裸露，披一件外套", "bare upper body with an open outer layer draped over the shoulders", { adultOnly: true, zone: "lower" }),
    pair("下身裸露，上装遮蔽", "bare lower body with the upper body covered by a long top", { adultOnly: true, zone: "upper" }),
    pair("背部裸露，正面遮蔽", "open-back styling with the front covered", { adultOnly: true, zone: "back" }),
    pair("肩颈裸露，主体遮蔽", "bare shoulders and neckline with the main body covered", { adultOnly: true, zone: "shoulder" }),
    pair("单侧肩背裸露", "one shoulder and side exposed with the rest covered", { adultOnly: true, zone: "one_side" }),
    pair("腰部局部裸露", "waist cutout styling with the chest and lower body covered", { adultOnly: true, zone: "waist" }),
    pair("单腿裸露，开衩遮蔽", "one leg exposed through a high slit with the rest covered", { adultOnly: true, zone: "leg" }),
    pair("上装敞开，内搭遮蔽", "open outer top with an inner layer covering the torso", { adultOnly: true, zone: "torso" }),
    pair("局部镂空，其他区域遮蔽", "selective cutout styling with the surrounding areas covered", { adultOnly: true, zone: "cutout" })
  ],
  coveredOpacity: [
    pair("不透视", "opaque fabric", { adultOnly: true }),
    pair("半透明", "semi-sheer fabric", { adultOnly: true }),
    pair("强透视", "highly translucent fabric", { adultOnly: true })
  ],
  coveredGarment: [
    pair("高腰长裤", "high-waisted trousers", { adultOnly: true, zones: ["lower"], opacities: ["opaque fabric"] }),
    pair("直筒牛仔裤", "straight-leg denim trousers", { adultOnly: true, zones: ["lower"], opacities: ["opaque fabric"] }),
    pair("阔腿西装裤", "wide-leg tailored trousers", { adultOnly: true, zones: ["lower"], opacities: ["opaque fabric"] }),
    pair("中长半身裙", "midi skirt", { adultOnly: true, zones: ["lower"], opacities: ["opaque fabric"] }),
    pair("长裙", "floor-length skirt", { adultOnly: true, zones: ["lower"], opacities: ["opaque fabric"] }),
    pair("高腰短裤", "high-waisted tailored shorts", { adultOnly: true, zones: ["lower"], opacities: ["opaque fabric"] }),
    pair("轻薄衬衫", "lightweight shirt", { adultOnly: true, zones: ["upper"], opacities: ["opaque fabric"] }),
    pair("针织长袖", "knit long-sleeve top", { adultOnly: true, zones: ["upper"], opacities: ["opaque fabric"] }),
    pair("敞开的短外套", "open cropped jacket", { adultOnly: true, zones: ["upper"], opacities: ["opaque fabric"] }),
    pair("长款上衣", "longline top", { adultOnly: true, zones: ["upper"], opacities: ["opaque fabric"] }),
    pair("露背长裙", "open-back long dress", { adultOnly: true, zones: ["back"], opacities: ["opaque fabric"] }),
    pair("系带露背衬衫", "tie-back shirt", { adultOnly: true, zones: ["back"], opacities: ["opaque fabric"] }),
    pair("垂坠露背连衣裙", "draped backless dress", { adultOnly: true, zones: ["back"], opacities: ["opaque fabric"] }),
    pair("一字肩上衣", "off-shoulder top", { adultOnly: true, zones: ["shoulder"], opacities: ["opaque fabric"] }),
    pair("抹胸连衣裙", "strapless dress", { adultOnly: true, zones: ["shoulder"], opacities: ["opaque fabric"] }),
    pair("挂脖上衣", "halter top", { adultOnly: true, zones: ["shoulder"], opacities: ["opaque fabric"] }),
    pair("单肩不对称上衣", "asymmetric one-shoulder top", { adultOnly: true, zones: ["one_side"], opacities: ["opaque fabric"] }),
    pair("单肩连衣裙", "one-shoulder dress", { adultOnly: true, zones: ["one_side"], opacities: ["opaque fabric"] }),
    pair("侧腰镂空上衣", "side-waist cutout top", { adultOnly: true, zones: ["waist"], opacities: ["opaque fabric"] }),
    pair("收腰镂空连衣裙", "waist-cutout fitted dress", { adultOnly: true, zones: ["waist"], opacities: ["opaque fabric"] }),
    pair("高开衩长裙", "high-slit long skirt", { adultOnly: true, zones: ["leg"], opacities: ["opaque fabric"] }),
    pair("侧开衩长裙", "side-slit maxi skirt", { adultOnly: true, zones: ["leg"], opacities: ["opaque fabric"] }),
    pair("敞开西装与同色内搭", "open blazer with a matching fitted top", { adultOnly: true, zones: ["torso"], opacities: ["opaque fabric"] }),
    pair("敞开衬衫与背心", "open shirt over a camisole", { adultOnly: true, zones: ["torso"], opacities: ["opaque fabric"] }),
    pair("镂空针织连衣裙", "open-knit dress with cutout panels", { adultOnly: true, zones: ["cutout"], opacities: ["opaque fabric"] }),
    pair("侧面镂空连体衣", "side-cutout bodysuit", { adultOnly: true, zones: ["cutout"], opacities: ["opaque fabric"] }),
    pair("雪纺半身裙叠搭打底", "sheer chiffon skirt layered over an opaque lining", { adultOnly: true, zones: ["lower"], opacities: ["semi-sheer fabric"] }),
    pair("薄纱罩裙", "semi-sheer overlay skirt", { adultOnly: true, zones: ["lower"], opacities: ["semi-sheer fabric"] }),
    pair("薄纱长袖衬衫", "semi-sheer long-sleeve blouse", { adultOnly: true, zones: ["upper"], opacities: ["semi-sheer fabric"] }),
    pair("镂空蕾丝上衣", "semi-sheer lace top", { adultOnly: true, zones: ["upper"], opacities: ["semi-sheer fabric"] }),
    pair("薄纱露背裙", "semi-sheer open-back dress", { adultOnly: true, zones: ["back"], opacities: ["semi-sheer fabric"] }),
    pair("薄纱一字肩上衣", "semi-sheer off-shoulder top", { adultOnly: true, zones: ["shoulder"], opacities: ["semi-sheer fabric"] }),
    pair("薄纱单肩裙", "semi-sheer one-shoulder dress", { adultOnly: true, zones: ["one_side"], opacities: ["semi-sheer fabric"] }),
    pair("腰部薄纱拼接裙", "dress with semi-sheer waist panels", { adultOnly: true, zones: ["waist"], opacities: ["semi-sheer fabric"] }),
    pair("薄纱开衩裙", "semi-sheer slit skirt", { adultOnly: true, zones: ["leg"], opacities: ["semi-sheer fabric"] }),
    pair("薄纱开衫与贴身内搭", "semi-sheer cardigan over a fitted inner layer", { adultOnly: true, zones: ["torso"], opacities: ["semi-sheer fabric"] }),
    pair("网纱拼接连衣裙", "mesh-panel dress", { adultOnly: true, zones: ["cutout"], opacities: ["semi-sheer fabric"] }),
    pair("透明薄纱裙", "highly translucent tulle skirt", { adultOnly: true, zones: ["lower"], opacities: ["highly translucent fabric"] }),
    pair("透明尼龙长裙", "highly translucent nylon skirt", { adultOnly: true, zones: ["lower"], opacities: ["highly translucent fabric"] }),
    pair("透明罩衫", "highly translucent sheer top", { adultOnly: true, zones: ["upper"], opacities: ["highly translucent fabric"] }),
    pair("网眼长袖", "fine-mesh long-sleeve top", { adultOnly: true, zones: ["upper"], opacities: ["highly translucent fabric"] }),
    pair("透明PVC外套", "clear vinyl jacket", { adultOnly: true, zones: ["upper"], opacities: ["highly translucent fabric"] }),
    pair("透明纱质露背裙", "highly translucent open-back dress", { adultOnly: true, zones: ["back"], opacities: ["highly translucent fabric"] }),
    pair("透明肩颈罩纱", "highly translucent shoulder wrap", { adultOnly: true, zones: ["shoulder"], opacities: ["highly translucent fabric"] }),
    pair("透明单肩裙", "highly translucent one-shoulder dress", { adultOnly: true, zones: ["one_side"], opacities: ["highly translucent fabric"] }),
    pair("腰部透明网纱", "highly translucent waist mesh", { adultOnly: true, zones: ["waist"], opacities: ["highly translucent fabric"] }),
    pair("透明渔网开衩裙", "highly translucent fishnet slit skirt", { adultOnly: true, zones: ["leg"], opacities: ["highly translucent fabric"] }),
    pair("透明网纱外套与内搭", "highly translucent mesh jacket over an inner layer", { adultOnly: true, zones: ["torso"], opacities: ["highly translucent fabric"] }),
    pair("透明网纱拼接裙", "highly translucent mesh dress", { adultOnly: true, zones: ["cutout"], opacities: ["highly translucent fabric"] })
  ],
  coveredMaterial: [
    pair("棉", "cotton", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("亚麻", "linen", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("羊毛", "wool", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("丹宁", "denim", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("皮革", "leather", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("针织", "knit", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("天鹅绒", "velvet", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("缎面", "satin", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("雪纺", "chiffon", { adultOnly: true, opacities: ["semi-sheer fabric"] }),
    pair("欧根纱", "organza", { adultOnly: true, opacities: ["semi-sheer fabric"] }),
    pair("蕾丝", "lace", { adultOnly: true, opacities: ["semi-sheer fabric"] }),
    pair("薄纱", "tulle", { adultOnly: true, opacities: ["semi-sheer fabric"] }),
    pair("镂空针织", "open knit", { adultOnly: true, opacities: ["semi-sheer fabric"] }),
    pair("细网纱", "fine mesh", { adultOnly: true, opacities: ["highly translucent fabric"] }),
    pair("透明尼龙", "sheer nylon", { adultOnly: true, opacities: ["highly translucent fabric"] }),
    pair("渔网", "fishnet", { adultOnly: true, opacities: ["highly translucent fabric"] }),
    pair("透明PVC", "clear vinyl", { adultOnly: true, opacities: ["highly translucent fabric"] }),
    pair("湿感薄棉", "damp translucent cotton", { adultOnly: true, opacities: ["highly translucent fabric"] }),
    pair("透明丝绸", "sheer silk", { adultOnly: true, opacities: ["highly translucent fabric"] })
  ],
  coveredInner: [
    pair("同色内衬", "matching opaque lining", { adultOnly: true }),
    pair("对比色内搭", "contrasting inner layer", { adultOnly: true }),
    pair("无缝连体打底", "seamless bodysuit lining", { adultOnly: true }),
    pair("贴身背心内搭", "fitted camisole lining", { adultOnly: true }),
    pair("无额外内层", "no additional inner layer", { adultOnly: true })
  ],
  coveredColor: [
    pair("黑色", "black", { adultOnly: true }),
    pair("白色", "white", { adultOnly: true }),
    pair("奶油色", "cream", { adultOnly: true }),
    pair("灰色", "gray", { adultOnly: true }),
    pair("深蓝", "navy blue", { adultOnly: true }),
    pair("酒红", "burgundy", { adultOnly: true }),
    pair("银色", "silver", { adultOnly: true }),
    pair("金色", "gold", { adultOnly: true })
  ],
  coveredFit: [
    pair("合身", "tailored fit", { adultOnly: true }),
    pair("垂坠宽松", "relaxed draped fit", { adultOnly: true }),
    pair("贴身剪裁", "close-fitting cut", { adultOnly: true }),
    pair("高开衩轮廓", "high-slit silhouette", { adultOnly: true }),
    pair("不对称轮廓", "asymmetric silhouette", { adultOnly: true })
  ],
  garmentGraphicZone: [
    pair("不添加图案", ""),
    pair("领口中央图案位", "neckline area", { group: "头颈", zones: ["upper"] }),
    pair("锁骨横向图案位", "collarbone band", { group: "头颈", zones: ["upper"] }),
    pair("后颈图案位", "nape panel", { group: "头颈", zones: ["upper"] }),
    pair("肩部图案位", "shoulder panel", { group: "肩臂", zones: ["upper"] }),
    pair("上臂图案位", "upper sleeve panel", { group: "肩臂", zones: ["upper"] }),
    pair("前臂图案位", "forearm panel", { group: "肩臂", zones: ["upper"] }),
    pair("袖口图案位", "cuff panel", { group: "肩臂", zones: ["upper"] }),
    pair("前胸图案位", "front chest panel", { group: "躯干正面", zones: ["upper"] }),
    pair("胸前侧片图案位", "side chest panel", { group: "躯干正面", zones: ["upper"] }),
    pair("上腹图案位", "upper abdomen panel", { group: "躯干正面", zones: ["upper"] }),
    pair("下腹图案位", "lower abdomen panel", { group: "躯干正面", zones: ["upper"] }),
    pair("上衣下摆图案位", "top hem", { group: "躯干正面", zones: ["upper"] }),
    pair("腰带图案位", "waistband", { group: "腰胯", zones: ["upper", "lower"] }),
    pair("侧腰图案位", "side waist panel", { group: "腰胯", zones: ["upper", "lower"] }),
    pair("前胯口袋图案位", "front hip pocket panel", { group: "腰胯", zones: ["lower"] }),
    pair("侧胯图案位", "side hip panel", { group: "腰胯", zones: ["lower"], adultOnly: true }),
    pair("裤装前裆拼片", "front trouser panel", { group: "腰胯", zones: ["lower"], adultOnly: true }),
    pair("后臀布片", "rear hip panel", { group: "腰胯", zones: ["lower"], adultOnly: true }),
    pair("后背上段图案位", "upper back panel", { group: "背面", zones: ["upper"] }),
    pair("后腰图案位", "lower back panel", { group: "背面", zones: ["upper", "lower"] }),
    pair("后臀左右双片图案", "paired rear hip panels", { group: "背面", zones: ["lower"], adultOnly: true }),
    pair("大腿正面图案位", "front thigh panel", { group: "腿部", zones: ["lower"] }),
    pair("大腿外侧图案位", "outer thigh panel", { group: "腿部", zones: ["lower"] }),
    pair("大腿内侧图案位", "inner thigh panel", { group: "腿部", zones: ["lower"], adultOnly: true }),
    pair("膝部图案位", "knee panel", { group: "腿部", zones: ["lower"] }),
    pair("小腿外侧图案位", "outer calf panel", { group: "腿部", zones: ["lower"] }),
    pair("裤脚图案位", "trouser hem", { group: "腿部", zones: ["lower"] }),
    pair("裙摆图案位", "skirt hem", { group: "腿部", zones: ["lower"] })
  ],
  garmentGraphicMotif: [
    pair("不指定", ""),
    pair("几何线条", "geometric line motif"),
    pair("花卉纹样", "botanical floral motif"),
    pair("藤蔓刺绣", "vine embroidery motif"),
    pair("星月图案", "celestial star-and-moon motif"),
    pair("抽象波纹", "abstract flowing line motif"),
    pair("动物剪影", "stylized animal silhouette"),
    pair("徽章纹章", "heraldic emblem"),
    pair("建筑线条", "architectural line motif"),
    pair("哥特纹样", "gothic ornamental motif"),
    pair("传统云纹", "traditional cloud motif"),
    pair("机械结构", "mechanical motif"),
    pair("朋克铆钉图案", "punk studded motif"),
    pair("极简单字母", "minimal single-letter motif"),
    pair("装饰边框", "decorative border motif"),
    pair("抽象色块", "abstract color-block motif")
  ],
  garmentGraphicTechnique: [
    pair("印花", "printed"),
    pair("刺绣", "embroidered"),
    pair("提花", "woven jacquard"),
    pair("压纹", "embossed"),
    pair("贴布绣", "appliqué"),
    pair("蕾丝拼花", "lace appliqué"),
    pair("金属铆钉", "metal studs"),
    pair("亮片镶饰", "rhinestone appliqué"),
    pair("反光印花", "reflective print")
  ],
  garmentGraphicScale: [
    pair("小型点缀", "small accent"),
    pair("中等居中", "medium centered motif"),
    pair("大面积主体图案", "large main panel motif"),
    pair("沿边缘连续", "continuous border motif"),
    pair("满版重复图案", "all-over repeat pattern")
  ],
  garmentGraphicColor: [
    pair("同色系", "tonal"),
    pair("黑白高对比", "high-contrast black and white"),
    pair("金色", "gold"),
    pair("银色", "silver"),
    pair("红色", "red"),
    pair("蓝色", "blue"),
    pair("珠光白", "pearlescent white"),
    pair("霓虹色", "neon color"),
    pair("多色撞色", "multicolor")
  ],
  sheerMaterial: [
    pair("不指定", ""),
    pair("半透雪纺", "semi-sheer chiffon", { adultOnly: true }),
    pair("欧根纱", "sheer organza", { adultOnly: true }),
    pair("细网纱", "fine mesh", { adultOnly: true }),
    pair("薄纱叠层", "layered tulle", { adultOnly: true }),
    pair("镂空蕾丝", "openwork lace", { adultOnly: true }),
    pair("透明薄丝绸", "sheer silk voile", { adultOnly: true }),
    pair("透明尼龙", "sheer nylon", { adultOnly: true }),
    pair("湿感薄棉", "damp translucent cotton", { adultOnly: true }),
    pair("渔网材质", "fishnet fabric", { adultOnly: true }),
    pair("透明PVC", "clear vinyl", { adultOnly: true }),
    pair("玻璃纱", "glass gauze", { adultOnly: true }),
    pair("镂空针织", "open-knit fabric", { adultOnly: true })
  ],
  sheerLevel: [
    pair("轻微透光", "subtle light diffusion through the fabric", { adultOnly: true }),
    pair("半透明", "semi-transparent fabric", { adultOnly: true }),
    pair("明显透视", "clearly translucent fabric", { adultOnly: true }),
    pair("湿透贴身", "wet translucent fabric clinging naturally", { adultOnly: true })
  ],
  outfit: [
    pair("不指定", ""),
    pair("白色宽松衬衫", "oversized white shirt", { group: "日常职业" }),
    pair("黑色修身西装", "tailored black suit", { group: "日常职业" }),
    pair("灰色针织衫", "soft gray knit sweater", { group: "日常职业" }),
    pair("牛仔夹克", "denim jacket", { group: "日常职业" }),
    pair("长风衣", "long trench coat", { group: "日常职业" }),
    pair("皮质机车夹克", "black leather biker jacket", { group: "日常职业" }),
    pair("极简连衣裙", "minimalist slip dress", { group: "礼服" }),
    pair("丝质晚礼服", "floor-length silk evening gown", { group: "礼服" }),
    pair("休闲T恤与长裤", "relaxed t-shirt and trousers", { group: "日常职业" }),
    pair("运动夹克", "technical sports jacket", { group: "日常职业" }),
    pair("瑜伽运动装", "athletic yoga wear", { group: "日常职业" }),
    pair("连帽卫衣", "oversized hoodie", { group: "日常职业" }),
    pair("复古格纹套装", "vintage plaid suit", { group: "日常职业" }),
    pair("汉服长袍", "layered traditional Hanfu robe", { group: "古装奇幻" }),
    pair("改良旗袍", "modern fitted qipao", { group: "古装奇幻" }),
    pair("和风浴衣", "lightweight yukata", { group: "内衣居家" }),
    pair("中世纪长裙", "medieval layered gown", { group: "礼服" }),
    pair("奇幻皮甲", "fantasy leather armor", { group: "古装奇幻" }),
    pair("科幻功能服", "futuristic utility suit", { group: "机能制服" }),
    pair("机甲驾驶服", "sci-fi pilot flight suit", { group: "机能制服" }),
    pair("实验室白大褂", "structured laboratory coat", { group: "日常职业" }),
    pair("舞台演出服", "stage performance outfit", { group: "机能制服" }),
    pair("海滩度假装", "linen beachwear", { group: "其他" }),
    pair("高级家居服", "premium loungewear", { group: "内衣居家" }),
    pair("白色浴袍", "white hotel bathrobe", { group: "内衣居家" }),
    pair("真丝睡裙", "silk slip dress", { adultOnly: true, group: "内衣居家" }),
    pair("蕾丝家居服", "black lace loungewear", { adultOnly: true, group: "内衣居家" }),
    pair("宽松衬衫半敞领口", "oversized shirt with a relaxed open collar", { adultOnly: true, group: "日常职业" }),
    pair("薄纱外搭与丝质内搭", "sheer robe over a silk slip", { adultOnly: true, group: "其他" }),
    pair("丝质吊带睡裙", "bias-cut satin camisole dress", { adultOnly: true, group: "内衣居家" }),
    pair("象牙色蕾丝连体衣", "ivory lace bodysuit", { adultOnly: true, group: "内衣居家" }),
    pair("缎面睡衣套装", "satin pajama set", { adultOnly: true, group: "内衣居家" }),
    pair("束腰外搭衬衫", "fitted corset layered beneath a loose shirt", { adultOnly: true, group: "日常职业" }),
    pair("长袜与宽衬衫", "sheer stockings paired with an oversized shirt", { adultOnly: true, group: "日常职业" }),
    pair("露肩晚礼服", "strapless evening dress", { adultOnly: true, group: "礼服" }),
    pair("薄纱罩衫", "sheer chiffon overlay", { adultOnly: true, group: "泳装" }),
    pair("温泉浴巾", "spa towel wrap", { adultOnly: true, group: "其他" }),
    pair("亚麻敞领衬衫", "linen shirt with a relaxed open collar", { adultOnly: true, group: "日常职业" }),
    pair("缎面吊带与长裤", "satin camisole with tailored trousers", { adultOnly: true, group: "内衣居家" }),
    pair("丝质系带睡袍", "a silk robe loosely tied", { adultOnly: true, group: "内衣居家" }),
    pair("露肩针织上衣", "an off-shoulder knit top", { adultOnly: true, group: "其他" }),
    pair("薄纱衬衫配吊带", "a sheer shirt over a camisole", { adultOnly: true, group: "日常职业" }),
    pair("蕾丝边吊带裙", "a lace-trimmed slip dress", { adultOnly: true, group: "内衣居家" }),
    pair("长款开襟衬衫", "a long open-front shirt", { adultOnly: true, group: "日常职业" }),
    pair("缎面束腰连衣裙", "a satin corseted dress", { adultOnly: true, group: "礼服" }),
    pair("高腰丝质长裙", "a high-waisted silk skirt", { adultOnly: true, group: "礼服" }),
    pair("绒面浴袍", "a soft velvet bathrobe", { adultOnly: true, group: "内衣居家" }),
    pair("丝绸吊带背心", "a silk camisole top", { adultOnly: true, group: "内衣居家" }),
    pair("高开衩长裙", "a high-slit evening skirt", { adultOnly: true, group: "礼服" }),
    pair("露背针织裙", "a backless knit dress", { adultOnly: true, group: "其他" }),
    pair("薄纱披肩", "a sheer shawl", { adultOnly: true, group: "其他" }),
    pair("男士衬衫配丝质吊带", "a men's shirt over a silk slip", { adultOnly: true, group: "日常职业" }),
    pair("睡袍与长袜", "a nightrobe with stockings", { adultOnly: true, group: "内衣居家" }),
    pair("连体泳衣", "a one-piece swimsuit", { group: "泳装" }),
    pair("三角比基尼", "a triangle bikini", { group: "泳装" }),
    pair("高腰比基尼", "a high-waisted bikini", { group: "泳装" }),
    pair("运动泳衣", "an athletic swimsuit", { group: "泳装" }),
    pair("复古连体泳衣", "a retro one-piece swimsuit", { group: "泳装" }),
    pair("系带比基尼", "a string-tie bikini", { group: "泳装" }),
    pair("沙滩罩衫", "a beach cover-up", { group: "泳装" }),
    pair("竞速泳衣", "a racing swimsuit", { group: "泳装" }),
    pair("缎面内衣套装", "a satin lingerie set", { group: "内衣居家", adultOnly: true }),
    pair("针织家居套装", "a knit loungewear set", { group: "内衣居家" }),
    pair("宽松家居连衣裙", "a relaxed loungewear dress", { group: "内衣居家" }),
    pair("蕾丝内衣套装", "a lace lingerie set", { group: "内衣居家", adultOnly: true }),
    pair("无钢圈内衣", "a soft-cup bralette set", { group: "内衣居家", adultOnly: true }),
    pair("连体蕾丝衣", "a lace bodysuit", { group: "内衣居家", adultOnly: true }),
    pair("缎面连体衣", "a satin bodysuit", { group: "内衣居家", adultOnly: true }),
    pair("吊带睡裙", "a slip nightgown", { group: "内衣居家", adultOnly: true }),
    pair("蕾丝睡裙", "a lace nightdress", { group: "内衣居家", adultOnly: true }),
    pair("短款睡袍", "a short sleep robe", { group: "内衣居家", adultOnly: true }),
    pair("丝质睡装衬衫", "a silk sleep shirt", { group: "内衣居家", adultOnly: true }),
    pair("束腰吊带", "a corset-style camisole", { group: "内衣居家", adultOnly: true }),
    pair("紧身胸衣", "a fitted bustier", { group: "内衣居家", adultOnly: true }),
    pair("胸衣配半身裙", "a corset top with a midi skirt", { group: "内衣居家", adultOnly: true }),
    pair("蕾丝边吊带背心", "a lace-trim camisole", { group: "内衣居家", adultOnly: true }),
    pair("针织吊带长裙", "a knit slip dress", { group: "内衣居家", adultOnly: true }),
    pair("薄纱罩裙", "a sheer overlay skirt", { group: "内衣居家", adultOnly: true }),
    pair("薄纱睡袍", "a sheer sleep robe", { group: "内衣居家", adultOnly: true }),
    pair("短款家居套装", "a cropped loungewear set", { group: "内衣居家", adultOnly: true }),
    pair("吊带连体短裤", "a camisole romper", { group: "内衣居家", adultOnly: true }),
    pair("光滑缎面睡衣", "a smooth satin pajama set", { group: "内衣居家", adultOnly: true }),
    pair("镂空针织上衣", "an open-knit top", { group: "内衣居家", adultOnly: true }),
    pair("露肩针织裙", "an off-shoulder knit dress", { group: "内衣居家", adultOnly: true }),
    pair("高叉连体泳衣", "a high-cut one-piece", { group: "泳装" }),
    pair("环颈比基尼", "a halter bikini", { group: "泳装" }),
    pair("高腰分体泳衣", "a high-waisted two-piece", { group: "泳装" }),
    pair("一体式运动泳衣", "a performance one-piece", { group: "泳装" }),
    pair("三角泳装套装", "a triangle bikini set", { group: "泳装" }),
    pair("抹胸比基尼", "a bandeau bikini", { group: "泳装" }),
    pair("沙滩长罩衫", "a long beach cover-up", { group: "泳装" }),
    pair("泳装外搭衬衫", "a shirt worn over swimwear", { group: "泳装" }),
    pair("深V领晚礼服", "a deep-V evening gown", { group: "礼服" }),
    pair("露背长礼服", "a backless floor-length gown", { group: "礼服" }),
    pair("开衩缎面长裙", "a slit satin gown", { group: "礼服" }),
    pair("抹胸礼服", "a strapless gown", { group: "礼服" }),
    pair("单肩长礼服", "a one-shoulder gown", { group: "礼服" }),
    pair("亮片修身礼服", "a sequined fitted gown", { group: "礼服" }),
    pair("薄纱层叠礼服", "a layered tulle gown", { group: "礼服" }),
    pair("高领丝绒礼服", "a high-neck velvet gown", { group: "礼服" }),
    pair("侧开衩长裙", "a side-slit long dress", { group: "礼服" }),
    pair("吊带袜与高跟鞋", "stockings with heels", { group: "袜装组合", adultOnly: true }),
    pair("过膝袜与短裙", "over-the-knee socks with a short skirt", { group: "袜装组合", adultOnly: true }),
    pair("连裤袜与西装外套", "pantyhose under a blazer", { group: "袜装组合", adultOnly: true }),
    pair("网袜与机车夹克", "fishnets with a biker jacket", { group: "袜装组合", adultOnly: true }),
    pair("长筒袜与针织衫", "knee socks with a knit sweater", { group: "袜装组合", adultOnly: true }),
    pair("蕾丝长袜与睡裙", "lace stockings with a slip dress", { group: "袜装组合", adultOnly: true }),
    pair("丝袜与袜带", "stockings with a garter belt", { group: "袜装组合", adultOnly: true }),
    pair("半透丝袜与吊带裙", "sheer stockings with a slip dress", { group: "袜装组合", adultOnly: true }),
    pair("紧身针织连衣裙", "a fitted knit dress", { group: "日常性感", adultOnly: true }),
    pair("修身吊带裙", "a fitted slip dress", { group: "日常性感", adultOnly: true }),
    pair("短款皮夹克", "a cropped leather jacket", { group: "日常性感", adultOnly: true }),
    pair("高腰短裙套装", "a high-waisted mini skirt set", { group: "日常性感", adultOnly: true }),
    pair("露脐上衣", "a cropped top", { group: "日常性感", adultOnly: true }),
    pair("开衫与吊带", "a cardigan over a camisole", { group: "日常性感", adultOnly: true }),
    pair("一字肩紧身上衣", "a fitted off-shoulder top", { group: "日常性感", adultOnly: true }),
    pair("修身西装裙", "a tailored suit dress", { group: "日常性感", adultOnly: true }),
    pair("吊带长裙配针织", "a slip dress with a knit cardigan", { group: "日常性感", adultOnly: true }),
    pair("丝质绑带上衣", "a silk tie-front top", { group: "日常性感", adultOnly: true }),
    pair("镂空蕾丝上衣", "an openwork lace top", { group: "日常性感", adultOnly: true }),
    pair("缎面半裙套装", "a satin skirt set", { group: "日常性感", adultOnly: true }),
    pair("高领针织裙", "a turtleneck knit dress", { group: "日常性感", adultOnly: true }),
    pair("短风衣内搭吊带", "a short trench over a slip", { group: "日常性感", adultOnly: true }),
    pair("皮裙与丝袜", "a leather skirt with stockings", { group: "日常性感", adultOnly: true }),
    pair("紧身连体短裤", "a fitted romper", { group: "日常性感", adultOnly: true }),
    pair("泳衣外搭薄纱", "swimwear under a sheer layer", { group: "日常性感", adultOnly: true }),
    pair("系带腰部连衣裙", "a tie-waist dress", { group: "日常性感", adultOnly: true }),
    pair("光面皮衣与长裙", "a glossy leather jacket with a long skirt", { group: "日常性感", adultOnly: true }),
    pair("镜面缎面套装", "a mirror-satin set", { group: "日常性感", adultOnly: true }),
    pair("蕾丝长袖上衣", "a lace long-sleeve top", { group: "日常性感", adultOnly: true }),
    pair("薄纱衬衫配吊带裙", "a sheer shirt over a slip dress", { group: "日常性感", adultOnly: true }),
    pair("针织紧身裙", "a body-hugging knit skirt", { group: "日常性感", adultOnly: true }),
    pair("缎面吊带长裙", "a satin slip gown", { group: "日常性感", adultOnly: true }),
    pair("露肩长袖礼服", "an off-shoulder long-sleeve gown", { group: "日常性感", adultOnly: true }),
    pair("大V领针织衫", "a deep-V knit top", { group: "日常性感", adultOnly: true }),
    pair("高腰阔腿裤配紧身上衣", "high-waisted trousers with a fitted top", { group: "日常职业" }),
    pair("运动背心与短裤", "a sports top with shorts", { group: "日常职业" }),
    pair("束腰长裙", "a corseted long dress", { group: "礼服" }),
    pair("宫廷束腰礼服", "a court corset gown", { group: "古装奇幻" }),
    pair("机能紧身衣", "a fitted tech-wear suit", { group: "机能制服" }),
    pair("女性西装裙套装", "tailored blazer dress with a structured shoulder", { group: "女性职业" }),
    pair("真丝衬衫与铅笔裙", "silk blouse with a high-waisted pencil skirt", { group: "女性职业" }),
    pair("针织通勤套装", "fine-knit matching office set", { group: "女性职业" }),
    pair("风衣裙", "belted trench-style dress", { group: "女性职业" }),
    pair("宽肩西装与阔腿裤", "oversized blazer with wide-leg trousers", { group: "女性职业" }),
    pair("极简连体职场装", "minimal tailored jumpsuit", { group: "女性职业" }),
    pair("男士炭灰三件套", "charcoal three-piece suit with a waistcoat", { group: "男性正装" }),
    pair("男士双排扣海军蓝西装", "double-breasted navy suit", { group: "男性正装" }),
    pair("男士西装与高领针织", "tailored blazer over a fine roll-neck knit", { group: "男性正装" }),
    pair("男士衬衫与马甲", "crisp dress shirt with a fitted waistcoat", { group: "男性正装" }),
    pair("男士燕尾礼服", "formal black tailcoat and evening trousers", { group: "男性正装" }),
    pair("男士丝质衬衫与西裤", "fluid silk shirt with tailored trousers", { group: "男性正装" }),
    pair("男士衬衫与针织背心", "relaxed shirt with a fine knit vest", { group: "男性休闲" }),
    pair("男士露营领衬衫与长裤", "camp-collar shirt with pleated trousers", { group: "男性休闲" }),
    pair("男士飞行员夹克与T恤", "bomber jacket over a plain t-shirt", { group: "男性休闲" }),
    pair("男士短夹克与直筒裤", "harrington jacket with straight-leg trousers", { group: "男性休闲" }),
    pair("男士长款大衣与高领衫", "long wool overcoat over a turtleneck", { group: "男性休闲" }),
    pair("男士针织Polo与长裤", "fine merino polo with tailored trousers", { group: "男性休闲" }),
    pair("男士工装连体服", "utilitarian boiler suit", { group: "中性工装" }),
    pair("中性无性别剪裁西装", "gender-neutral oversized suit", { group: "中性工装" }),
    pair("中性机能马甲与长裤", "technical utility vest with relaxed trousers", { group: "中性工装" }),
    pair("中性宽松衬衫与工装裤", "oversized utility shirt with cargo trousers", { group: "中性工装" }),
    pair("医疗工作服", "clean medical scrubs with a professional fit", { group: "职业制服" }),
    pair("主厨制服", "classic chef whites with a dark apron", { group: "职业制服" }),
    pair("摄影记者多袋外套", "photographer jacket with practical pockets", { group: "职业制服" }),
    pair("艺术工作室围裙", "work apron layered over a relaxed shirt", { group: "职业制服" }),
    pair("男士丝质睡衣套装", "men's silk pajama set", { group: "男性居家" }),
    pair("男士华夫格浴袍", "men's waffle-weave bathrobe", { group: "男性居家" }),
    pair("男士亚麻家居套装", "men's relaxed linen lounge set", { group: "男性居家" }),
    pair("中性针织家居套装", "gender-neutral fine-knit loungewear set", { group: "居家套装" }),
    pair("情侣中性家居服", "coordinated gender-neutral loungewear", { group: "双人造型" }),
    pair("情侣同色系正装", "coordinated formal outfits in matching tones", { group: "双人造型" }),
    pair("情侣旅行外套", "coordinated travel jackets with complementary colors", { group: "双人造型" }),
  
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
    pair("天鹅绒", "rich velvet"),
    pair("半透薄纱", "semi-sheer chiffon", { adultOnly: true }),
    pair("蕾丝纹理", "delicate lace texture", { adultOnly: true }),
    pair("丝缎垂坠", "fluid silk satin", { adultOnly: true }),
    pair("天鹅绒光泽", "velvet with a soft sheen", { adultOnly: true }),
    pair("湿感薄纱", "damp sheer fabric", { adultOnly: true }),
    pair("珠光缎面", "pearlescent satin", { adultOnly: true }),
    pair("细网纱", "fine mesh", { adultOnly: true }),
    pair("羊绒贴肤", "cashmere against the skin", { adultOnly: true }),
    pair("蜡光皮革", "glossy patent leather", { adultOnly: true }),
    pair("薄蕾丝", "fine lace", { adultOnly: true }),
    pair("湿透棉布", "damp cotton fabric"),
    pair("薄纱叠层", "layered sheer fabric"),
    pair("丝绸与蕾丝", "silk and lace"),
    pair("高光缎面", "high-gloss satin"),
    pair("粗针织物", "chunky knit fabric"),
    pair("绒面麂皮", "textured suede"),
    pair("轻薄针织", "lightweight knit"),
    pair("半透丝绸", "translucent silk"),
  
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
    pair("轻微使用痕迹", "subtle signs of wear"),
    pair("贴身剪裁", "a body-skimming cut", { adultOnly: true }),
    pair("松垮滑落肩线", "a relaxed slipped shoulder line", { adultOnly: true }),
    pair("束腰轮廓", "a softly cinched waist", { adultOnly: true }),
    pair("高开衩裙摆", "a high slit hem", { adultOnly: true }),
    pair("收腰长裙轮廓", "a fitted long-dress silhouette", { adultOnly: true }),
    pair("宽大衬衫罩身", "an oversized shirt worn loosely", { adultOnly: true }),
    pair("露背剪裁", "an open-back cut", { adultOnly: true }),
  
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
    pair("阅读眼镜", "reading glasses"),
    pair("珍珠耳饰", "pearl drop earrings", { adultOnly: true }),
    pair("蕾丝手套", "lace gloves", { adultOnly: true }),
    pair("脚踝细链", "a delicate anklet", { adultOnly: true }),
    pair("丝巾", "a silk scarf", { adultOnly: true }),
    pair("长款耳坠", "long drop earrings", { adultOnly: true }),
    pair("细腰带", "a thin waist belt", { adultOnly: true }),
    pair("蕾丝长袜", "lace stockings", { adultOnly: true }),
    pair("层叠手链", "layered bracelets", { adultOnly: true }),
    pair("珍珠项链", "a pearl necklace", { adultOnly: true }),
  
  ],
  hosiery: [
    pair("不指定", ""),
    pair("连裤袜", "sheer pantyhose", { structure: "tights", coverage: "foot", group: "连裤袜" }),
    pair("无足连裤袜", "footless tights", { structure: "tights", coverage: "footless", group: "连裤袜" }),
    pair("开裆连裤袜", "crotchless tights", { structure: "crotchlessTights", coverage: "crotchless", group: "连裤袜", adultOnly: true }),
    pair("露趾连裤袜", "open-toe tights", { structure: "tights", coverage: "openToe", group: "连裤袜" }),
    pair("大腿袜", "thigh-high stockings", { structure: "thighHigh", coverage: "foot", group: "大腿与长袜" }),
    pair("自持式大腿袜", "silicone hold-up stockings", { structure: "holdUp", coverage: "foot", group: "大腿与长袜" }),
    pair("吊带袜", "garter stockings", { structure: "garterStocking", coverage: "foot", group: "大腿与长袜", adultOnly: true }),
    pair("过膝袜", "over-the-knee socks", { structure: "overKnee", coverage: "foot", group: "短袜与中筒袜" }),
    pair("及膝袜", "knee-high socks", { structure: "socks", coverage: "foot", group: "短袜与中筒袜" }),
    pair("中筒袜", "crew socks", { structure: "socks", coverage: "foot", group: "短袜与中筒袜" }),
    pair("短袜 / 船袜", "ankle socks", { structure: "socks", coverage: "foot", group: "短袜与中筒袜" }),
    pair("堆堆袜", "slouch socks", { structure: "socks", coverage: "foot", group: "短袜与中筒袜" }),
    pair("连体袜", "bodystocking", { structure: "bodystocking", coverage: "full", group: "特殊结构", adultOnly: true }),
    pair("踩脚袜", "stirrup tights", { structure: "stirrup", coverage: "stirrup", group: "特殊结构" }),
  
  ],
  hosieryMaterial: [
    pair("不指定", ""),
    pair("超细尼龙", "ultra-fine nylon", { group: "纤维与混纺" }),
    pair("氨纶混纺", "elastane blend", { group: "纤维与混纺" }),
    pair("莱卡风格弹力纤维", "Lycra-style stretch fiber", { group: "纤维与混纺" }),
    pair("真丝", "silk", { group: "纤维与混纺" }),
    pair("棉质", "cotton", { group: "纤维与混纺" }),
    pair("羊毛", "wool", { group: "纤维与混纺" }),
    pair("羊绒混纺", "cashmere blend", { group: "纤维与混纺" }),
    pair("竹纤维", "bamboo fiber", { group: "纤维与混纺" }),
    pair("莫代尔", "modal", { group: "纤维与混纺" }),
    pair("天丝莱赛尔", "Tencel lyocell", { group: "纤维与混纺" }),
    pair("超细纤维", "microfiber", { group: "纤维与混纺" }),
    pair("弹力针织", "stretch knit", { group: "纤维与混纺" }),
  
  ],

  footwear: [
    pair("不指定", ""),
    pair("白色运动鞋", "white sneakers", { group: "鞋" }),
    pair("黑色皮鞋", "black leather shoes", { group: "鞋" }),
    pair("短靴", "ankle boots", { group: "靴" }),
    pair("高跟鞋", "high heels", { group: "高跟鞋" }),
    pair("平底鞋", "minimal flats", { group: "鞋" }),
    pair("凉鞋", "sandals", { group: "鞋" }),
    pair("长靴", "knee-high boots", { group: "靴" }),
    pair("赤足", "barefoot", { group: "鞋" }),
    pair("战术靴", "tactical boots", { group: "靴" }),
    pair("工作靴", "work boots", { group: "靴" }),
    pair("细高跟鞋", "fine stiletto heels", { group: "高跟鞋" }),
    pair("粗跟鞋", "chunky block heels", { group: "高跟鞋" }),
    pair("猫跟鞋", "kitten heels", { group: "高跟鞋" }),
    pair("尖头高跟鞋", "pointed-toe pumps", { group: "高跟鞋" }),
    pair("绑带高跟鞋", "strappy heels", { group: "高跟鞋" }),
    pair("露趾高跟鞋", "open-toe heels", { group: "高跟鞋" }),
    pair("厚底高跟鞋", "platform heels", { group: "高跟鞋" }),
    pair("过膝长靴", "over-the-knee boots", { group: "靴", adultOnly: true }),
    pair("及膝骑士靴", "knee-high riding boots", { group: "靴" }),
    pair("踝靴", "ankle booties", { group: "靴" }),
    pair("雨靴", "rain boots", { group: "靴" }),
    pair("牛仔靴", "cowboy boots", { group: "靴" }),
    pair("雪地靴", "snow boots", { group: "靴" }),
    pair("马丁靴", "combat boots", { group: "靴" }),
    pair("玛丽珍高跟鞋", "Mary Jane heels", { group: "高跟鞋" }),
    pair("尖头细跟靴", "pointed stiletto boots", { group: "靴" }),
    pair("过膝细跟靴", "over-the-knee stiletto boots", { group: "靴" }),
    pair("绑带高跟凉鞋", "strappy heeled sandals", { group: "高跟鞋" }),
    pair("方头高跟鞋", "square-toe heels", { group: "高跟鞋" }),
    pair("后空高跟鞋", "slingback heels", { group: "高跟鞋" }),
    pair("防水台厚底靴", "platform boots", { group: "靴" }),
    pair("及踝细跟靴", "ankle stiletto boots", { group: "靴" }),
    pair("亮面高跟靴", "glossy heeled boots", { group: "靴" }),
    pair("尖头平底鞋", "pointed flats", { group: "鞋" }),
  
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
    pair("胡茬", "neat stubble"),
    pair("微醺腮红", "soft flushed blush", { adultOnly: true }),
    pair("湿润唇光", "glossy lips", { adultOnly: true }),
    pair("松散微乱发丝", "softly tousled hair", { adultOnly: true }),
    pair("裸色唇釉", "a nude lip gloss", { adultOnly: true }),
    pair("自然光泽肌", "naturally luminous skin"),
    pair("淡妆红润", "a soft rosy makeup look"),
    pair("微乱发丝", "slightly tousled strands"),
    pair("哑光底妆", "a matte finish base"),
  
  ],
  pose: [
    pair("自然站立", "standing naturally", { group: "站立" }),
    pair("靠窗站立", "standing beside a window", { group: "站立" }),
    pair("坐在床边", "sitting on the edge of a bed", { group: "坐姿" }),
    pair("坐在椅子上", "seated on a chair", { group: "坐姿" }),
    pair("倚靠墙面", "leaning against a wall", { group: "倚靠" }),
    pair("倚靠栏杆", "leaning on a railing", { group: "倚靠" }),
    pair("侧身回眸", "caught mid-turn in an adult presentation", { group: "其他" }),
    pair("半身侧坐", "side-seated three-quarter pose", { group: "坐姿" }),
    pair("仰卧", "lying on their back", { group: "卧姿" }),
    pair("侧卧", "lying on one side", { group: "卧姿" }),
    pair("俯卧", "lying face down", { group: "卧姿" }),
    pair("向后倾靠", "leaning back comfortably", { group: "倚靠" }),
    pair("双手抱臂", "arms lightly crossed", { group: "其他" }),
    pair("双手插袋", "hands in pockets", { group: "其他" }),
    pair("整理衣领", "adjusting a collar", { group: "其他" }),
    pair("拨动头发", "brushing hair aside", { group: "其他" }),
    pair("向前行走", "walking toward the camera", { group: "动态" }),
    pair("转身动作", "mid-turn movement", { group: "动态" }),
    pair("舞蹈动作", "expressive dance pose", { group: "动态" }),
    pair("动态跳跃", "mid-air jump", { group: "动态" }),
    pair("蹲姿", "crouching pose", { group: "其他" }),
    pair("跪坐", "kneeling comfortably", { group: "坐姿" }),
    pair("侧躺手肘支撑", "reclining on one side, propped on one elbow", { adultOnly: true, group: "卧姿" }),
    pair("斜卧在床上", "lying diagonally across the bed", { adultOnly: true, group: "卧姿" }),
    pair("跪坐于床沿", "kneeling upright near the edge of the bed", { adultOnly: true, group: "坐姿" }),
    pair("靠坐床头", "leaning back against the headboard", { adultOnly: true, group: "坐姿" }),
    pair("对镜整理头发", "adjusting hair while facing a mirror", { adultOnly: true, group: "其他" }),
    pair("坐在地面靠墙", "sitting on the floor and leaning against the wall", { adultOnly: true, group: "坐姿" }),
    pair("伸懒腰", "stretching in a relaxed pose", { adultOnly: true, group: "动态" }),
    pair("俯身倚靠桌面", "leaning across a table on their forearms", { adultOnly: true, group: "卧姿" }),
    pair("不指定", ""),
    pair("侧卧手撑头", "lying on one side with the head propped on a hand", { adultOnly: true, group: "卧姿" }),
    pair("单膝跪床", "kneeling at the foot of the bed", { adultOnly: true, group: "跪姿" }),
    pair("趴卧回望", "lying on the stomach and looking back", { adultOnly: true, group: "卧姿" }),
    pair("抱膝靠墙", "sitting against the wall with knees drawn up", { adultOnly: true, group: "倚靠" }),
    pair("倚门回眸", "leaning in a doorway and glancing back", { adultOnly: true, group: "倚靠" }),
    pair("双手枕在脑后", "hands resting behind the head", { adultOnly: true, group: "其他" }),
    pair("半躺半坐", "half-lying, half-sitting", { adultOnly: true, group: "坐姿" }),
    pair("趴卧手垫下巴", "lying on the stomach with the chin on a hand", { adultOnly: true, group: "卧姿" }),
    pair("侧坐沙发扶手", "sitting sideways on a sofa in an adult presentation", { adultOnly: true, group: "坐姿" }),
    pair("背对镜头回望", "back to the camera, looking over the shoulder", { adultOnly: true, group: "其他" }),
    pair("跪坐窗前", "kneeling by the window", { adultOnly: true, group: "坐姿" }),
    pair("仰头闭眼", "head tilted back with eyes closed", { adultOnly: true, group: "卧姿" }),
    pair("俯身靠在床沿", "leaning over the edge of the bed", { adultOnly: true, group: "卧姿" }),
    pair("一腿屈起侧卧", "lying on one side with one knee bent", { adultOnly: true, group: "卧姿" }),
    pair("手撑床面后仰", "leaning back with hands braced on the bed", { adultOnly: true, group: "卧姿" }),
    pair("仰躺抬臂", "lying back with an arm raised", { adultOnly: true, group: "卧姿" }),
    pair("侧身拱背", "side profile with a gentle arch", { adultOnly: true, group: "其他" }),
    pair("跪坐回望", "kneeling and looking back", { adultOnly: true, group: "坐姿" }),
    pair("倚墙侧身", "leaning against a wall side-on", { adultOnly: true, group: "倚靠" }),
    pair("单手扶墙", "one hand against the wall", { adultOnly: true, group: "其他" }),
    pair("坐在窗台", "sitting on a windowsill", { adultOnly: true, group: "坐姿" }),
    pair("半跪向前", "half-kneeling and leaning forward", { adultOnly: true, group: "跪姿" }),
    pair("仰卧曲膝", "lying on the back with knees bent", { adultOnly: true, group: "卧姿" }),
    pair("侧坐高凳", "sitting on a chair and leaning forward with an adult presentation", { adultOnly: true, group: "坐姿" }),
    pair("手撑地板侧坐", "sitting with a hand braced on the floor", { adultOnly: true, group: "坐姿" }),
    pair("倚靠门框", "leaning in a door frame", { adultOnly: true, group: "倚靠" }),
    pair("背靠床头", "back against the headboard", { adultOnly: true, group: "倚靠" }),
    pair("前倾肘撑", "leaning forward on the elbows", { adultOnly: true, group: "其他" }),
    pair("转身半步", "caught mid-turn", { adultOnly: true, group: "动态" }),
    pair("低头侧脸", "head lowered in side profile", { adultOnly: true, group: "其他" }),
    pair("单腿重心站立", "standing with the weight on one leg", { group: "站立", adultOnly: true }),
    pair("交叠双腿站立", "standing with the legs crossed", { group: "站立", adultOnly: true }),
    pair("侧身站立双手垂落", "standing in profile with the arms hanging", { group: "站立", adultOnly: true }),
    pair("双手置于腰后", "standing with the hands behind the waist", { group: "站立", adultOnly: true }),
    pair("一手扶颈侧", "one hand resting at the side of the neck", { group: "站立", adultOnly: true }),
    pair("双手轻抚锁骨", "fingertips resting on the collarbone", { group: "站立", adultOnly: true }),
    pair("抬手整理发丝", "lifting a hand to adjust the hair", { group: "站立", adultOnly: true }),
    pair("双臂向上伸展", "stretching both arms overhead", { group: "站立", adultOnly: true }),
    pair("身体微微后仰", "leaning the torso slightly back", { group: "站立", adultOnly: true }),
    pair("侧头低语姿态", "head turned as if mid-whisper", { group: "站立", adultOnly: true }),
    pair("高凳交叠双腿", "sitting on a chair and leaning forward with an adult presentation", { group: "坐姿", adultOnly: true }),
    pair("沙发边缘侧坐", "perched on the edge of a sofa", { group: "坐姿", adultOnly: true }),
    pair("盘腿而坐", "sitting cross-legged", { group: "坐姿", adultOnly: true }),
    pair("抱膝坐地", "sitting on the floor hugging the knees", { group: "坐姿", adultOnly: true }),
    pair("双手后撑坐姿", "sitting with the hands braced behind", { group: "坐姿", adultOnly: true }),
    pair("侧坐腿微抬", "sitting sideways with one leg slightly lifted", { group: "坐姿", adultOnly: true }),
    pair("靠椅背轻仰", "leaning back into a chair", { group: "坐姿", adultOnly: true }),
    pair("坐姿前倾托腮", "leaning forward with the chin on a hand", { group: "坐姿", adultOnly: true }),
    pair("坐在地毯上", "sitting on a rug", { group: "坐姿", adultOnly: true }),
    pair("床边垂脚而坐", "sitting on the edge of the bed with the feet down", { group: "坐姿", adultOnly: true }),
    pair("侧卧手抚发", "lying on one side with a hand in the hair", { group: "卧姿", adultOnly: true }),
    pair("仰卧双臂舒展", "lying on the back with the arms loosely spread", { group: "卧姿", adultOnly: true }),
    pair("俯卧侧脸贴枕", "lying face down with the cheek on a pillow", { group: "卧姿", adultOnly: true }),
    pair("侧卧屈膝", "lying on one side with the knees bent", { group: "卧姿", adultOnly: true }),
    pair("半卧撑肘", "reclining on one elbow", { group: "卧姿", adultOnly: true }),
    pair("仰卧屈膝脚踏床面", "a fully open reclining adult pose with the body extended toward the camera", { group: "卧姿", adultOnly: true }),
    pair("侧卧回望", "lying on one side and looking back", { group: "卧姿", adultOnly: true }),
    pair("俯卧抬肩", "lying face down with the shoulders lifted", { group: "卧姿", adultOnly: true }),
    pair("半躺靠在沙发", "half-reclining on a sofa", { group: "卧姿", adultOnly: true }),
    pair("仰卧指穿发间", "lying back with the fingers through the hair", { group: "卧姿", adultOnly: true }),
    pair("双膝跪坐挺直", "kneeling upright with a straight back", { group: "跪姿", adultOnly: true }),
    pair("单膝跪地", "down on one knee", { group: "跪姿", adultOnly: true }),
    pair("跪坐重心后压", "seated on the heels with the weight shifted back", { group: "跪姿", adultOnly: true }),
    pair("跪姿前倾", "kneeling and leaning forward", { group: "跪姿", adultOnly: true }),
    pair("跪坐双手置腿", "kneeling with the hands resting on the thighs", { group: "跪姿", adultOnly: true }),
    pair("半跪一手触地", "half-kneeling with one hand on the floor", { group: "跪姿", adultOnly: true }),
    pair("跪坐回身", "kneeling while turning the upper body", { group: "跪姿", adultOnly: true }),
    pair("缓缓转身", "turning slowly", { group: "动态", adultOnly: true }),
    pair("从镜头前走过", "walking past the camera", { group: "动态", adultOnly: true }),
    pair("转身半步回眸", "half-turned and looking back", { group: "动态", adultOnly: true }),
    pair("舞蹈式舒展", "a dancer's stretch", { group: "动态", adultOnly: true }),
    pair("旋转中的裙摆", "mid-spin with the hem in motion", { group: "动态", adultOnly: true }),
    pair("甩动长发", "tossing the hair", { group: "动态", adultOnly: true }),
    pair("抬手挡住光线", "raising a hand to block the light", { group: "动态", adultOnly: true }),
    pair("低身拾物的瞬间", "bending down to pick something up", { group: "动态", adultOnly: true }),
    pair("起身的半途", "caught just as she rises", { group: "动态", adultOnly: true }),
    pair("倚靠落地窗", "leaning against a floor-to-ceiling window", { group: "倚靠", adultOnly: true }),
    pair("靠墙单腿屈起", "leaning on a wall with one knee bent", { group: "倚靠", adultOnly: true }),
    pair("倚在沙发扶手", "leaning on a sofa armrest", { group: "倚靠", adultOnly: true }),
    pair("门口停步", "pausing in a doorway", { group: "倚靠", adultOnly: true }),
    pair("靠栏远望", "leaning on a railing and looking out", { group: "倚靠", adultOnly: true }),
    pair("椅后拥靠", "leaning over the back of a chair", { group: "倚靠", adultOnly: true }),
    pair("靠在床边", "leaning on the edge of the bed", { group: "倚靠", adultOnly: true }),
    pair("肩靠纱帘", "leaning a shoulder against a sheer curtain", { group: "倚靠", adultOnly: true }),
    pair("抬眼看镜头", "lifting the gaze to the camera", { group: "镜头感", adultOnly: true }),
    pair("低头自刘海下看", "looking up from under the bangs", { group: "镜头感", adultOnly: true }),
    pair("侧脸逆光", "side profile against backlight", { group: "镜头感", adultOnly: true }),
    pair("肩线放松下垂", "a relaxed sloping shoulder line", { group: "镜头感", adultOnly: true }),
    pair("颈部线条伸展", "an extended neck line", { group: "镜头感", adultOnly: true }),
    pair("锁骨与肩线姿态", "a posture highlighting the collarbone and shoulder line", { group: "镜头感", adultOnly: true }),
    pair("倾身靠近镜头", "leaning toward the camera", { group: "镜头感", adultOnly: true }),
    pair("指尖轻触嘴唇", "fingertips brushing the lips", { group: "镜头感", adultOnly: true }),
    pair("双手托腮", "both hands under the chin", { group: "镜头感", adultOnly: true }),
    pair("指尖抵住下巴", "a fingertip resting on the chin", { group: "镜头感", adultOnly: true }),
    pair("把玩发梢", "toying with the ends of the hair", { group: "镜头感", adultOnly: true }),
    pair("手搭颈后", "a hand resting behind the neck", { group: "镜头感", adultOnly: true }),
    pair("双臂抱肩", "arms crossed over the shoulders", { group: "镜头感", adultOnly: true }),
    pair("一手抚过手臂", "a hand sliding along the other arm", { group: "镜头感", adultOnly: true }),
    pair("肩膀微侧", "shoulders turned slightly", { group: "镜头感", adultOnly: true }),
    pair("背对镜头站立", "standing with the back to the camera", { group: "背身", adultOnly: true }),
    pair("背对镜头侧头", "back to the camera with the head turned", { group: "背身", adultOnly: true }),
    pair("双手撑桌", "both hands resting on a desk", { group: "背身", adultOnly: true }),
    pair("坐桌面侧身", "sitting sideways on a desk", { group: "背身", adultOnly: true }),
    pair("靠办公桌边", "leaning on the edge of a desk", { group: "背身", adultOnly: true }),
    pair("抱臂回望", "arms folded while looking back", { group: "背身", adultOnly: true }),
    pair("站在镜前", "caught mid-turn in an adult presentation", { group: "背身", adultOnly: true }),
    pair("镜前整理长发", "adjusting long hair in front of a mirror", { group: "背身", adultOnly: true }),
    pair("撩起一侧长发", "lifting one side of the long hair", { group: "背身", adultOnly: true }),
    pair("侧身收腰姿态", "a side-on silhouette with a tucked waist", { group: "背身", adultOnly: true }),
    pair("倚靠床头半坐", "half-sitting against the headboard"),
    pair("侧卧抱枕", "lying on one side holding a pillow"),
    pair("跪坐床尾", "kneeling at the foot of the bed"),
    pair("坐在梳妆台前", "sitting at a dressing table"),
    pair("抬手扶发回望", "lifting a hand to the hair and looking back"),
    pair("前倾撑床", "leaning forward with hands on the bed"),
    pair("侧坐窗台", "sitting sideways on a windowsill"),
    pair("屈膝而坐", "sitting with the knees drawn up"),
    pair("靠墙单腿站立", "standing against a wall with one leg bent"),
    pair("背身回望坐姿", "seated with the back turned, looking back"),
    pair("半躺沙发扶手", "half-reclining over a sofa armrest"),
    pair("地毯侧坐", "sitting sideways on a rug"),
    pair("暗示 · 靠墙一腿微屈", "leaning against a wall with one leg softly bent", { group: "暗示姿势", adultOnly: true, intensity: "suggestive" }),
    pair("暗示 · 坐椅边身体前倾", "sitting near the edge of a chair and leaning slightly forward", { group: "暗示姿势", adultOnly: true, intensity: "suggestive" }),
    pair("暗示 · 侧坐双腿同向", "sitting sideways with both legs turned in the same direction", { group: "暗示姿势", adultOnly: true, intensity: "suggestive" }),
    pair("暗示 · 翘腿脚尖下垂", "sitting with one leg crossed over the other and the toe relaxed", { group: "暗示姿势", adultOnly: true, intensity: "suggestive" }),
    pair("暗示 · 半跪一膝抬起", "half-kneeling with one knee raised", { group: "暗示姿势", adultOnly: true, intensity: "suggestive" }),
    pair("暗示 · 窗边重心偏移", "standing by a window with the weight shifted onto one hip", { group: "暗示姿势", adultOnly: true, intensity: "suggestive" }),
    pair("暗示 · 盘腿肩部放松", "sitting cross-legged with relaxed shoulders", { group: "暗示姿势", adultOnly: true, intensity: "suggestive" }),
    pair("暗示 · 侧卧一膝上收一腿伸展", "lying on one side with one knee drawn upward and the other leg extended", { group: "暗示姿势", adultOnly: true, intensity: "suggestive" }),
    pair("私房 · 床沿双膝自然分开", "sitting on the edge of the bed with the knees naturally apart", { group: "私房姿势", adultOnly: true, intensity: "boudoir" }),
    pair("私房 · 后仰双手支撑", "leaning back on both hands with the knees comfortably apart", { group: "私房姿势", adultOnly: true, intensity: "boudoir" }),
    pair("私房 · 靠墙坐地一腿弯曲", "seated against the wall with one leg extended and the other bent", { group: "私房姿势", adultOnly: true, intensity: "boudoir" }),
    pair("私房 · 低蹲双手放膝", "crouching low with the knees apart and hands resting on the knees", { group: "私房姿势", adultOnly: true, intensity: "boudoir" }),
    pair("私房 · 地面侧坐上身扭转", "sitting on the floor with the upper body gently twisted", { group: "私房姿势", adultOnly: true, intensity: "boudoir" }),
    pair("私房 · 床头半躺抬膝", "half-reclining against the headboard with one knee raised", { group: "私房姿势", adultOnly: true, intensity: "boudoir" }),
    pair("私房 · 沙发扶手前后错腿", "sitting on a sofa armrest with the legs staggered forward and back", { group: "私房姿势", adultOnly: true, intensity: "boudoir" }),
    pair("私房 · 地面膝开手扶脚踝", "seated on the floor with the knees open and hands resting near the ankles", { group: "私房姿势", adultOnly: true, intensity: "boudoir" }),
    pair("明确暗示 · 仰卧双膝弯曲分开", "a fully open reclining adult pose with the body extended toward the camera", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 侧卧一膝高高抬起", "lying on one side with one knee raised high", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 后仰撑地宽膝坐姿", "leaning back on both hands in a low seated pose with the knees apart", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 地面宽V坐姿侧机位", "seated low on the floor with the legs in a wide V shape, side camera angle", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 反向跨坐椅背", "straddling a chair backward with the arms resting on the chair back", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 单膝跪地另一腿前伸", "down on one knee with the other leg extended forward", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 手撑床面后仰屈膝", "supporting the body on the bed with both hands while leaning back with one knee bent", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 侧坐床沿双膝朝向镜头", "sitting on the edge of the bed with the knees angled toward the camera", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 靠墙背身回眸髋部偏移", "standing back to the wall with one hip shifted and looking over the shoulder", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 单脚踩墙斜靠", "leaning diagonally against a wall with one foot raised against it", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 坐在桌边一膝抬起", "sitting on the edge of a table with one knee raised", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 侧坐沙发一腿伸展", "sitting sideways on a sofa in an adult presentation", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 后仰双肘撑床", "leaning back comfortably", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 半躺床头双膝弯曲", "half-reclining against the headboard with both knees bent", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 跪姿一膝前移", "kneeling with one knee shifted forward and the torso upright", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 跪坐躯干扭转", "kneeling while twisting the torso toward the camera", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 伏卧小腿交叠上抬", "lying face down with the lower legs crossed and lifted behind", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 侧卧拉长腰线", "lying on one side with the torso extended and the waistline emphasized", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 地面侧撑抬髋", "resting on one forearm on the floor with the hips lifted", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 椅背后倾髋部后移", "leaning back over a chair with the hips shifted away from the chair", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 窗台一腿垂下", "sitting on a windowsill with one leg hanging down and the other drawn up", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 镜前回身单肩朝镜头", "caught mid-turn in an adult presentation", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 单膝跪地双手放腿", "down on one knee with both hands resting on the upper legs", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 沙发边缘后仰悬腿", "sitting on the edge of a sofa and leaning back with the legs relaxed", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 地面一膝立起一膝外展", "sitting low with one knee raised and the other angled outward", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 斜倚沙发一膝抬起", "reclining sideways on a sofa with one knee raised", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 伏身桌面双臂交叠回望", "leaning over a tabletop with the forearms crossed and looking back", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 跪坐身后仰手撑地面", "kneeling upright while leaning back with one hand braced on the floor", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 侧卧肘撑抬起髋部", "lying on one side supported on one elbow with the hips lifted", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 背身扭腰回望", "standing with the back turned, torso twisted, and looking back", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 低蹲双膝外展脚跟离地", "crouching low with the knees turned outward and heels slightly lifted", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 床沿单膝跪立前倾", "kneeling at the edge of the bed on one knee while leaning forward", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 坐床后仰双手撑床", "sitting on the bed and leaning back with both hands braced behind", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 门框一腿交叉斜靠", "leaning in a doorway with the legs gently crossed", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 高脚凳双腿交叠侧倾", "sitting on a chair and leaning forward with an adult presentation", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("明确暗示 · 地面跪坐转身一手撑地", "kneeling on the floor while turning toward the camera with one hand braced on the ground", { group: "明确暗示", adultOnly: true, intensity: "adult" }),
    pair("开放双人 · 床沿并肩错膝", "two adults sitting together on the edge of the bed with their knees offset", { group: "开放双人", adultOnly: true, intensity: "adult", people: 2, focus: ["innerThighKnee", "waist", "fullBody"] }),
    pair("开放双人 · 前后错位侧坐", "two adults sitting in a staggered front-and-back composition", { group: "开放双人", adultOnly: true, intensity: "adult", people: 2, focus: ["sideWaistHip", "outerThigh", "fullBody"] }),
    pair("开放双人 · 面对面席地而坐", "two adults seated face to face on the floor with relaxed posture", { group: "开放双人", adultOnly: true, intensity: "adult", people: 2, focus: ["face", "handsArms", "fullBody"] }),
    pair("开放双人 · 一人后仰一人侧撑", "one adult reclining while the other supports them from the side", { group: "开放双人", adultOnly: true, intensity: "adult", people: 2, focus: ["chestWaist", "sideWaistHip", "fullBody"] }),
    pair("开放双人 · 一站一坐对视", "one adult standing and the other seated, holding eye contact", { group: "开放双人", adultOnly: true, intensity: "adult", people: 2, focus: ["fullBody", "face", "outerThigh"] }),
    pair("开放双人 · 背靠背回望镜头", "two adults standing back to back and looking toward the camera", { group: "开放双人", adultOnly: true, intensity: "adult", people: 2, focus: ["upperBack", "rearWaistHip", "fullBody"] }),
    pair("开放多人 · 床沿高低错落", "three adults arranged along the bed edge at staggered heights", { group: "开放多人", adultOnly: true, intensity: "adult", people: 3, focus: ["fullBody", "outerThigh", "face"] }),
    pair("开放多人 · 沙发前后层次", "three adults posed across a sofa in clear foreground, middle, and background layers", { group: "开放多人", adultOnly: true, intensity: "adult", people: 3, focus: ["face", "chestWaist", "outerThigh"] }),
    pair("开放多人 · 画面三角站位", "three adults arranged in a balanced triangular composition", { group: "开放多人", adultOnly: true, intensity: "adult", people: 3, focus: ["fullBody", "shoulderTorso", "sideWaistHip"] }),
    pair("开放多人 · 地毯环坐", "three adults seated in a loose arc on a rug", { group: "开放多人", adultOnly: true, intensity: "adult", people: 3, focus: ["face", "handsArms", "fullBody"] }),
    pair("开放多人 · 站坐组合", "three adults combining standing and seated poses at different heights", { group: "开放多人", adultOnly: true, intensity: "adult", people: 3, focus: ["fullBody", "outerThigh", "shoulderTorso"] }),
    pair("开放多人 · 镜前前后景", "three adults arranged in a mirror scene with foreground and background depth", { group: "开放多人", adultOnly: true, intensity: "adult", people: 3, focus: ["face", "upperBack", "fullBody"] }),
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
    pair("舞蹈旋转", "spinning in a controlled dance movement"),
    pair("缓慢回眸并抬眼", "slowly looking back and raising their eyes toward the camera", { adultOnly: true, intensity: "suggestive" }),
    pair("低头后抬眼", "lowering their head before glancing up with an inviting look", { adultOnly: true, intensity: "suggestive" }),
    pair("轻咬下唇", "lightly biting their lower lip", { adultOnly: true, intensity: "suggestive" }),
    pair("指尖滑过锁骨", "slowly tracing a fingertip across the collarbone", { adultOnly: true, intensity: "suggestive" }),
    pair("手指整理肩带", "gently adjusting a shoulder strap", { adultOnly: true, intensity: "boudoir" }),
    pair("掌沿轻抚腰线", "sliding one hand slowly along the waistline", { adultOnly: true, intensity: "boudoir" }),
    pair("双手拢起长发", "gathering long hair upward with both hands", { adultOnly: true, intensity: "suggestive" }),
    pair("把头发拢到一侧", "sweeping their hair to one side to reveal the neck", { adultOnly: true, intensity: "suggestive" }),
    pair("身体缓慢后仰", "slowly leaning back with a relaxed arched posture", { adultOnly: true, intensity: "boudoir" }),
    pair("侧卧伸展", "stretching while lying on one side", { adultOnly: true, intensity: "boudoir" }),
    pair("从床面慢慢坐起", "slowly rising from a reclining position on the bed", { adultOnly: true, intensity: "boudoir" }),
    pair("向镜头缓慢倾身", "leaning slowly toward the camera", { adultOnly: true, intensity: "suggestive" }),
    pair("隔着玻璃靠近", "moving close to a sheet of glass with one hand against it", { adultOnly: true, intensity: "boudoir" }),
    pair("让衣摆自然滑落", "letting one side of the garment slip naturally from the shoulder", { adultOnly: true, intensity: "boudoir" }),
    pair("轻拉衣领调整", "tugging lightly at the collar while keeping eye contact", { adultOnly: true, intensity: "suggestive" }),
    pair("缓慢侧身展示曲线", "slowly turning to emphasize a graceful side profile", { adultOnly: true, intensity: "boudoir" }),
    pair("贴近对方停住", "moving close to the other person and pausing just before contact", { adultOnly: true, intensity: "boudoir" }),
    pair("指尖轻触对方脸颊", "lightly tracing a fingertip along the other person's cheek", { adultOnly: true, intensity: "boudoir" }),
    pair("肩头轻靠", "leaning one shoulder against the other person", { adultOnly: true, intensity: "suggestive" }),
    pair("耳边低声说话", "leaning in and speaking softly beside the other person's ear", { adultOnly: true, intensity: "boudoir" }),
    pair("缓慢共舞靠近", "moving closer through a slow shared dance", { adultOnly: true, intensity: "boudoir" }),
  ],
  interaction: [
    pair("不指定", ""),
    pair("并排站立", "standing shoulder to shoulder", { people: 2 }),
    pair("牵手", "holding hands", { people: 2 }),
    pair("温柔拥抱", "sharing a gentle embrace", { people: 2 }),
    pair("面对面交流", "facing each other in conversation", { people: 2 }),
    pair("互相注视", "looking into each other's eyes", { people: 2 }),
    pair("背靠背", "standing back to back", { people: 2 }),
    pair("一人看向另一人", "one person looking toward the other", { people: 2 }),
    pair("共同完成一个动作", "working together on one action", { people: 2 }),
    pair("靠近低语", "leaning close and speaking softly", { adultOnly: true, people: 2 }),
    pair("轻柔拥抱", "sharing a soft close embrace", { adultOnly: true, people: 2 }),
    pair("额头相触", "standing with foreheads gently touching", { adultOnly: true, people: 2 }),
    pair("手抚脸颊", "gently cupping the other person's cheek", { adultOnly: true, people: 2 }),
    pair("身旁依偎", "sitting close and leaning against each other", { adultOnly: true, people: 2 }),
    pair("并卧交谈", "lying side by side in quiet conversation", { adultOnly: true, people: 2 }),
    pair("缓慢共舞", "slow dancing together", { adultOnly: true, people: 2 }),
    pair("相拥凝视", "holding each other while making eye contact", { adultOnly: true, people: 2 }),
    pair("十指相扣", "fingers interlaced", { people: 2, adultOnly: true }),
    pair("轻扶腰侧", "a hand resting lightly at the waist", { people: 2, adultOnly: true }),
    pair("肩靠肩坐在沙发", "sitting shoulder to shoulder on a sofa", { people: 2, adultOnly: true }),
    pair("鼻尖相触", "noses almost touching", { people: 2, adultOnly: true }),
  
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
    pair("复古麦克风", "a vintage microphone"),
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
    pair("细节微距", "macro detail shot"),
    pair("中近景", "medium close shot"),
    pair("中远景", "medium wide shot"),
    pair("双人中景", "two-shot medium framing"),
    pair("手部特写", "hand close-up"),
  
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
    pair("荷兰倾斜", "subtle Dutch angle"),
    pair("地面机位", "ground-level camera position"),
    pair("第一人称视角", "first-person point of view"),
    pair("侧后方 45 度", "forty-five degrees from behind the shoulder"),
  
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
    pair("鱼眼", "fisheye lens"),
    pair("20mm 超广角", "20mm ultra-wide lens"),
    pair("28mm 街拍", "28mm street-photography lens"),
    pair("40mm 纪实", "40mm documentary lens"),
    pair("70mm 人像", "70mm portrait lens"),
    pair("105mm 微距", "105mm macro lens"),
    pair("200mm 长焦压缩", "200mm telephoto compression"),
    pair("移轴镜头", "a tilt-shift lens"),
  
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
    pair("前景遮挡", "layered foreground framing"),
    pair("黄金分割", "golden-ratio composition"),
    pair("低地平线", "a low horizon line"),
    pair("高地平线", "a high horizon line"),
  
  ],
  depthOfField: [
    pair("不指定", ""),
    pair("大景深", "deep depth of field"),
    pair("中景深", "moderate depth of field"),
    pair("浅景深", "shallow depth of field"),
    pair("极浅景深", "very shallow depth of field"),
    pair("超浅景深", "ultra-shallow depth of field"),
    pair("全景深", "deep focus throughout the frame"),
  
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
    pair("跟随后退", "camera moves backward with the subject"),
    pair("变焦推进", "a slow zoom-in"),
    pair("垂直升降", "a vertical crane move"),
    pair("慢速环绕", "a slow orbit move"),
  
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
    pair("镜中背面", "rear reflection in a mirror"),
    pair("正面上身朝向镜头", "upper body squared toward the camera", { group: "正面镜头" }),
    pair("正面腰胯朝向镜头", "waist and hips squared toward the camera", { group: "正面镜头" }),
    pair("正面腿部朝向镜头", "legs angled toward the camera", { group: "正面镜头" }),
    pair("肩颈侧转朝镜头", "shoulder and neck turned toward the camera", { group: "侧向镜头" }),
    pair("胸廓与腰线侧向镜头", "chest contour and waistline angled toward the camera", { group: "侧向镜头" }),
    pair("侧胯与腿部朝镜头", "side hip and leg line angled toward the camera", { group: "侧向镜头" }),
    pair("背部与肩胛朝向镜头", "back and shoulder blades facing the camera", { group: "背面镜头" }),
    pair("后腰与臀部朝向镜头", "lower back and rear contour facing the camera", { group: "背面镜头" }),
    pair("背身回眸且上背朝镜头", "upper back toward the camera while looking back", { group: "背面镜头" }),
    pair("低机位强调腿部比例", "low camera angle emphasizing leg proportions", { group: "机位强调" }),
    pair("高机位强调整体轮廓", "high camera angle emphasizing the full body silhouette", { group: "机位强调" })
  ],
  bodyFocus: [
    pair("不指定", ""),
    pair("面部与下颌面向镜头", "the face and jawline angled toward the camera", { group: "头颈" }),
    pair("颈部与锁骨面向镜头", "the neck and collarbone angled toward the camera", { group: "头颈" }),
    pair("肩线与上胸面向镜头", "the shoulder line and upper torso angled toward the camera", { group: "上身" }),
    pair("胸廓整体轮廓面向镜头", "the full chest contour angled toward the camera", { group: "上身", adultOnly: true, intensity: "boudoir" }),
    pair("胸廓与腰线形成曲线", "the chest contour and waistline forming a clear curve toward the camera", { group: "上身", adultOnly: true, intensity: "boudoir" }),
    pair("上腹与腰线面向镜头", "the upper abdomen and waistline turned toward the camera", { group: "腰腹" }),
    pair("下腹与髋骨面向镜头", "the lower abdomen and hip bones angled toward the camera", { group: "腰腹", adultOnly: true, intensity: "boudoir" }),
    pair("侧腰与胯线面向镜头", "the side waist and hip line turned toward the camera", { group: "腰腹", adultOnly: true, intensity: "suggestive" }),
    pair("前裆上缘面向镜头", "the upper front crotch area angled toward the camera", { group: "开放构图", adultOnly: true, intensity: "adult" }),
    pair("后腰与臀部轮廓面向镜头", "the lower back and rear contour facing the camera", { group: "背面", adultOnly: true, intensity: "boudoir" }),
    pair("肩胛与上背面向镜头", "the shoulder blades and upper back facing the camera", { group: "背面" }),
    pair("大腿外侧线条面向镜头", "the outer thigh line angled toward the camera", { group: "腿部", adultOnly: true, intensity: "suggestive" }),
    pair("大腿内侧与膝部线条", "the inner thigh and knee line presented toward the camera", { group: "腿部", adultOnly: true, intensity: "boudoir" }),
    pair("小腿与脚踝线条面向镜头", "the calf and ankle line angled toward the camera", { group: "腿部" }),
    pair("手部与手臂动作面向镜头", "the hands and arm gesture presented toward the camera", { group: "手臂" }),
    pair("全身比例与重心面向镜头", "the full-body proportions and center of gravity facing the camera", { group: "全身" })
  ],
  adultLayer: [
    pair("不添加开放附加", ""),
    pair("胸廓与腰线重点", "the chest contour and waistline emphasized", { adultOnly: true, intensity: "adult" }),
    pair("后腰与臀部轮廓重点", "the lower back and rear contour emphasized", { adultOnly: true, intensity: "adult" }),
    pair("胯部与大腿线条重点", "the hip and thigh lines emphasized", { adultOnly: true, intensity: "adult" }),
    pair("前裆上缘清晰可见", "the upper front crotch and pussy mound clearly visible", { adultOnly: true, intensity: "adult" })
  ],
  gaze: [
    pair("不指定", ""),
    pair("直视镜头", "direct eye contact with the camera"),
    pair("看向画外", "looking off-camera"),
    pair("回眸看镜头", "a backward glance over the shoulder toward the camera"),
    pair("低垂目光", "lowered gaze"),
    pair("向上抬眸", "glancing upward"),
    pair("侧目", "subtle side glance"),
    pair("闭眼", "eyes gently closed"),
    pair("透过镜子对视", "eye contact through a mirror"),
    pair("闭眼感受光线", "eyes closed, feeling the light"),
    pair("看向另一人", "looking toward another person", { people: 2 }),
    pair("视线越过肩膀", "a backward glance over the shoulder toward the camera"),
    pair("半垂眼睑看向镜头", "an openly desiring adult gaze directed into the camera"),
    pair("透过睫毛上望", "looking up through the lashes", { adultOnly: true }),
    pair("缓慢的直视", "a slow steady look", { adultOnly: true }),
    pair("视线追随镜头", "an openly desiring adult gaze directed into the camera", { adultOnly: true }),
    pair("从肩后回望", "a backward glance over the shoulder toward the camera", { adultOnly: true }),
    pair("半抬眸", "a half-lifted gaze", { adultOnly: true }),
    pair("视线缓慢下移", "a slow downward gaze", { adultOnly: true }),
    pair("不眨眼的直视", "an unblinking direct look", { adultOnly: true }),
  
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
    pair("手搭肩头", "one hand resting on the partner's shoulder", { people: 2 })
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
    pair("优雅酒店客人", "elegant boutique-hotel guest", { adultOnly: true }),
    pair("电影感女主角", "cinematic lead character", { adultOnly: true }),
    pair("奢华广告缪斯", "luxury campaign muse", { adultOnly: true }),
    pair("黑色电影人物", "film-noir protagonist", { adultOnly: true }),
    pair("私人画室模特", "adult private-studio model", { adultOnly: true }),
    pair("成熟魅力角色", "confident mature adult character", { adultOnly: true }),
    pair("浪漫伴侣", "romantic adult partner", { adultOnly: true }),
    pair("时尚名伶", "fashion muse", { adultOnly: true }),
    pair("清晨慵懒角色", "relaxed adult morning character", { adultOnly: true }),
    pair("神秘夜行者", "mysterious nocturnal adult character", { adultOnly: true }),
    pair("舞蹈演员", "adult dancer", { adultOnly: true }),
    pair("游泳与度假角色", "adult resort character", { adultOnly: true }),
    pair("温泉访客", "adult spa guest", { adultOnly: true }),
    pair("私人俱乐部客人", "member of a luxury private club", { adultOnly: true }),
    pair("复古银幕明星", "vintage screen star", { adultOnly: true }),
    pair("中世纪贵族", "adult aristocratic character", { adultOnly: true }),
    pair("赛博都市人物", "cyber-city adult character", { adultOnly: true }),
    pair("幻想宫廷角色", "fantasy court adult character", { adultOnly: true }),
    pair("成熟知性编辑", "a mature editorial writer", { adultOnly: true }),
    pair("夜归的爵士歌手", "a late-night jazz singer", { adultOnly: true }),
    pair("午后书房的作家", "a writer in an afternoon study", { adultOnly: true }),
    pair("刚下班的建筑师", "an architect just off work", { adultOnly: true }),
    pair("海边度假的旅客", "a traveler on a seaside holiday", { adultOnly: true }),
    pair("私房写真模特", "a boudoir-session model", { adultOnly: true }),
  
  ],
  adultStyling: [
    pair("不指定", ""),
    pair("高级私房写真", "tasteful boudoir editorial styling", { adultOnly: true }),
    pair("奢华酒店晨光", "luxury hotel-morning styling", { adultOnly: true }),
    pair("丝质与阴影", "silk-and-shadow styling", { adultOnly: true }),
    pair("晨起微乱发型", "softly tousled morning hair", { adultOnly: true }),
    pair("湿润柔光妆", "dewy soft-focus makeup", { adultOnly: true }),
    pair("淡香水与珠宝", "perfume and delicate jewelry", { adultOnly: true }),
    pair("赤足优雅", "barefoot elegance", { adultOnly: true }),
    pair("黑色电影造型", "film-noir glamour", { adultOnly: true }),
    pair("极简性感", "minimal sophisticated allure", { adultOnly: true }),
    pair("浪漫花边", "romantic lace details", { adultOnly: true }),
    pair("高定晚装", "haute-couture evening styling", { adultOnly: true }),
    pair("度假奢华", "resort-luxe styling", { adultOnly: true }),
    pair("复古好莱坞", "vintage Hollywood styling", { adultOnly: true }),
    pair("舞蹈演员热身服", "dancer warm-up styling", { adultOnly: true }),
    pair("居家高级感", "polished at-home styling", { adultOnly: true }),
    pair("自然真实感", "natural realistic adult styling", { adultOnly: true }),
    pair("松垮家居针织", "relaxed at-home knitwear styling", { adultOnly: true }),
    pair("丝袍与发带", "a silk robe with a hair ribbon", { adultOnly: true }),
    pair("极简私房造型", "minimal boudoir styling", { adultOnly: true }),
    pair("复古丝绒礼服", "vintage velvet styling", { adultOnly: true }),
    pair("白衬衫与男士腕表", "a white shirt with a men's wristwatch", { adultOnly: true }),
    pair("冷调通勤造型", "cool-toned office styling", { adultOnly: true }),
    pair("丝质与蕾丝叠穿", "silk layered with lace", { adultOnly: true }),
    pair("家居丝袍与裸妆", "an at-home silk robe with bare makeup", { adultOnly: true }),
    pair("冷调金属配饰", "cool tones with metallic accessories", { adultOnly: true }),
    pair("柔和居家光感", "soft at-home light styling", { adultOnly: true }),
  
  ],
  intimacyLevel: [
    pair("不指定", ""),
    pair("独处安静", "quiet private solitude", { adultOnly: true }),
    pair("浪漫期待", "romantic anticipation", { adultOnly: true }),
    pair("亲密距离", "close personal distance", { adultOnly: true }),
    pair("温柔相拥", "tender embrace", { people: 2, adultOnly: true }),
    pair("额头相触", "foreheads touching", { people: 2, adultOnly: true }),
    pair("手抚面部", "gentle hand-to-face contact", { adultOnly: true }),
    pair("靠近耳边低语", "whispering close to the ear", { adultOnly: true }),
    pair("并肩依偎", "leaning together side by side", { people: 2, adultOnly: true }),
    pair("轻柔亲吻", "a gentle closed-mouth kiss", { people: 2, adultOnly: true }),
    pair("亲密信任", "intimate trust and emotional closeness", { adultOnly: true }),
    pair("克制暧昧", "restrained romantic tension", { adultOnly: true }),
    pair("高级时装式亲密", "fashion-editorial intimacy", { adultOnly: true }),
    pair("肩颈的轻吻", "a light kiss on the shoulder", { adultOnly: true }),
    pair("指尖相触", "fingertips meeting", { adultOnly: true }),
    pair("靠肩而坐", "leaning on a shoulder", { adultOnly: true }),
    pair("拥抱后的停留", "lingering after an embrace", { adultOnly: true }),
    pair("掌心相贴", "palms pressed together", { adultOnly: true }),
    pair("肩头的轻靠", "a head resting on the shoulder", { adultOnly: true }),
    pair("手腕轻握", "a gentle hold on the wrist", { adultOnly: true }),
    pair("发梢轻触", "hair brushing together", { adultOnly: true }),
    pair("呼吸靠近", "closeness with shared breathing", { adultOnly: true }),
  
  ],
  adultScene: [
    pair("不指定", ""),
    pair("精品酒店套房", "a boutique hotel suite", { adultOnly: true }),
    pair("丝质床品卧室", "a bedroom with silk bedding", { adultOnly: true }),
    pair("大理石浴室蒸汽", "a marble bathroom filled with soft steam", { adultOnly: true }),
    pair("私人温泉房", "a private spa room", { adultOnly: true }),
    pair("壁炉休息室", "a fireplace lounge", { adultOnly: true }),
    pair("镜前化妆间", "a vanity room with mirrors", { adultOnly: true }),
    pair("纱帘卧室", "a bedroom with layered sheer curtains", { adultOnly: true }),
    pair("清晨私人阳台", "a private balcony at dawn", { adultOnly: true }),
    pair("深色奢华公寓", "a dark luxury apartment", { adultOnly: true }),
    pair("复古更衣室", "a vintage dressing room", { adultOnly: true }),
    pair("湖畔度假屋", "a lakeside vacation home", { adultOnly: true }),
    pair("沙漠别墅", "a private desert villa", { adultOnly: true }),
    pair("摄影棚沙发区", "a studio lounge with a large sofa", { adultOnly: true }),
    pair("船舱私人卧室", "a private cabin bedroom on a yacht", { adultOnly: true }),
    pair("花园玻璃房", "a glass conservatory beside a garden", { adultOnly: true }),
    pair("雨夜卧室", "a bedroom during a quiet rainy night", { adultOnly: true }),
    pair("午后斜光的卧室", "a bedroom in slanted afternoon light", { adultOnly: true }),
    pair("私房摄影棚", "a boudoir photography studio", { adultOnly: true }),
    pair("雨天窗边的沙发", "a sofa by the window on a rainy day", { adultOnly: true }),
    pair("海景公寓阳台", "a balcony of a sea-view apartment", { adultOnly: true }),
    pair("深夜的爵士酒吧", "a late-night jazz bar", { adultOnly: true }),
    pair("更衣室镜前", "in front of a dressing-room mirror", { adultOnly: true }),
    pair("纱帘后的卧室", "a bedroom behind sheer curtains", { adultOnly: true }),
    pair("带大镜子的卧室", "a bedroom with a large mirror", { adultOnly: true }),
    pair("酒店走廊尽头", "the end of a hotel corridor", { adultOnly: true }),
    pair("深夜的公寓沙发", "a late-night apartment sofa", { adultOnly: true }),
    pair("落地窗前的浴缸", "a bathtub by a floor-to-ceiling window", { adultOnly: true }),
    pair("顶层露台夜景", "a rooftop terrace at night", { adultOnly: true }),
  
  ],
  adultLighting: [
    pair("不指定", ""),
    pair("薄纱晨光", "soft morning light filtered through sheer curtains", { adultOnly: true }),
    pair("百叶窗条光", "striped window light through blinds", { adultOnly: true }),
    pair("暖色床头灯", "warm bedside lamp light", { adultOnly: true }),
    pair("壁炉火光", "warm firelight", { adultOnly: true }),
    pair("柔和顶光", "soft low overhead light", { adultOnly: true }),
    pair("明暗对比", "quiet chiaroscuro lighting", { adultOnly: true }),
    pair("霓虹窗外光", "neon glow entering from outside", { adultOnly: true }),
    pair("烛光群", "clustered candlelight", { adultOnly: true }),
    pair("蒸汽柔光", "diffused steam-filled light", { adultOnly: true }),
    pair("清晨余晖", "soft dawn glow", { adultOnly: true }),
    pair("侧窗轮廓光", "side-window rim light", { adultOnly: true }),
    pair("金色实用光", "warm practical golden light", { adultOnly: true }),
    pair("低饱和夜灯", "muted low-light bedside glow", { adultOnly: true }),
    pair("镜面反射光", "soft reflected mirror light", { adultOnly: true }),
    pair("床头暖光渐变", "a gentle bedside light gradient", { adultOnly: true }),
    pair("纱帘过滤的逆光", "backlight filtered through sheer curtains", { adultOnly: true }),
    pair("单侧台灯半明", "half-lit by a single side lamp", { adultOnly: true }),
    pair("低角度实用光", "low-angle practical light", { adultOnly: true }),
    pair("一缕窗缝光", "a single slit of window light", { adultOnly: true }),
    pair("台灯与深阴影", "lamp light with deep shadows", { adultOnly: true }),
    pair("屏幕冷光", "a cool screen glow", { adultOnly: true }),
    pair("暖色灯泡串", "warm string lights", { adultOnly: true }),
    pair("纱帘逆光剪影", "a silhouette against sheer curtains", { adultOnly: true }),
    pair("落地灯暖光", "a pool of warm floor-lamp light", { adultOnly: true }),
    pair("床头双灯", "warm paired bedside lamps", { adultOnly: true }),
    pair("纱帘漫射晨光", "diffused morning light through sheer curtains", { adultOnly: true }),
    pair("浴室蒸汽柔光", "soft light through bathroom steam", { adultOnly: true }),
    pair("镜前化妆灯", "vanity mirror lighting", { adultOnly: true }),
    pair("洗墙壁灯光", "wall-washer sconce light", { adultOnly: true }),
    pair("低位台灯光", "low-angle table lamp light", { adultOnly: true }),
    pair("霓虹映在皮肤上", "neon reflections across the skin", { adultOnly: true }),
    pair("单点聚光", "a single hard spotlight", { adultOnly: true }),
    pair("烛光与暗部衰减", "candlelight with deep falloff", { adultOnly: true }),
    pair("屏幕冷光映脸", "cool screen glow on the face", { adultOnly: true }),
  
  ],
  adultCameraStyle: [
    pair("不指定", ""),
    pair("高级私房摄影", "tasteful boudoir photography", { adultOnly: true }),
    pair("亲密编辑人像", "intimate editorial portrait", { adultOnly: true }),
    pair("奢华魅力人像", "premium glamour portrait", { adultOnly: true }),
    pair("黑色电影人像", "film-noir portrait", { adultOnly: true }),
    pair("浪漫电影剧照", "romantic cinematic still", { adultOnly: true }),
    pair("纪实式亲密感", "documentary-style intimacy", { adultOnly: true }),
    pair("镜面人像", "mirror portrait", { adultOnly: true }),
    pair("酒店广告摄影", "luxury hotel campaign photography", { adultOnly: true }),
    pair("复古胶片人像", "vintage film portrait", { adultOnly: true }),
    pair("低调情绪摄影", "low-key mood photography", { adultOnly: true }),
    pair("生活化私密感", "natural intimate lifestyle photography", { adultOnly: true }),
    pair("时尚双人肖像", "fashion editorial couples portrait", { people: 2, adultOnly: true }),
    pair("晨光环境人像", "morning-light environmental portrait", { adultOnly: true }),
    pair("电影近景肖像", "cinematic close-up portrait", { adultOnly: true }),
    pair("私房人像摄影", "boudoir portrait photography", { adultOnly: true }),
    pair("室内胶片人像", "indoor film portrait", { adultOnly: true }),
    pair("低饱和时尚大片", "low-saturation fashion editorial", { adultOnly: true }),
    pair("亲密纪实人像", "intimate documentary portrait", { adultOnly: true }),
    pair("套房写真", "hotel-suite portrait photography", { adultOnly: true }),
    pair("杂志私房大片", "magazine boudoir editorial", { adultOnly: true }),
    pair("低光胶片人像", "low-light film portrait", { adultOnly: true }),
    pair("自然光私房", "natural-light boudoir photography", { adultOnly: true }),
    pair("肌理特写人像", "close texture-focused portrait", { adultOnly: true }),
    pair("私房杂志风", "boudoir magazine style", { adultOnly: true }),
    pair("低饱和胶片人像", "low-saturation film portrait style", { adultOnly: true }),
    pair("暗调质感人像", "low-key textured portrait style", { adultOnly: true }),
    pair("温和商业人像", "soft commercial portrait style", { adultOnly: true }),
  
  ],
  adultFraming: [
    pair("不指定", ""),
    pair("眼神特写", "intimate eye-level close-up", { adultOnly: true }),
    pair("面部与锁骨", "face-and-collarbone framing", { adultOnly: true }),
    pair("半身私密构图", "intimate medium framing", { adultOnly: true }),
    pair("七分身姿态", "cowboy-shot framing", { adultOnly: true }),
    pair("全身环境关系", "full-body environmental framing", { adultOnly: true }),
    pair("越过织物", "framed through soft fabric", { adultOnly: true }),
    pair("镜面双重构图", "dual reflection composition", { adultOnly: true }),
    pair("前景遮挡", "layered foreground framing", { adultOnly: true }),
    pair("略微俯拍", "slightly elevated framing", { adultOnly: true }),
    pair("略低机位", "slightly low camera framing", { adultOnly: true }),
    pair("宽银幕留白", "widescreen negative-space framing", { adultOnly: true }),
    pair("局部细节构图", "selective detail framing", { adultOnly: true }),
    pair("膝上构图", "above-the-knee framing", { adultOnly: true }),
    pair("手与锁骨的细节", "detail framing on the hands and collarbone", { adultOnly: true }),
    pair("侧向留白", "sideways negative space", { adultOnly: true }),
    pair("过肩近景", "over-the-shoulder close framing", { adultOnly: true }),
    pair("侧身半身构图", "a side-profile half-body framing", { adultOnly: true }),
    pair("背身回望构图", "a back-turned over-the-shoulder framing", { adultOnly: true }),
    pair("大面积留白", "a large negative-space framing", { adultOnly: true }),
    pair("前景纱幔遮挡", "framing through a sheer curtain", { adultOnly: true }),
    pair("肩颈局部特写", "a close crop on the shoulders and neck", { adultOnly: true }),
    pair("对角线构图", "a diagonal framing", { adultOnly: true }),
    pair("偏左留白构图", "left-weighted negative-space framing", { adultOnly: true }),
  
  ],
  adultAtmosphere: [
    pair("不指定", ""),
    pair("柔和浪漫", "soft romantic atmosphere", { adultOnly: true }),
    pair("安静暧昧", "quiet suggestive atmosphere", { adultOnly: true }),
    pair("奢华私密", "luxurious private atmosphere", { adultOnly: true }),
    pair("清晨慵懒", "lazy morning atmosphere", { adultOnly: true }),
    pair("夜色神秘", "mysterious night atmosphere", { adultOnly: true }),
    pair("温暖信任", "warm trusting atmosphere", { adultOnly: true }),
    pair("克制渴望", "restrained longing atmosphere", { adultOnly: true }),
    pair("电影张力", "cinematic tension", { adultOnly: true }),
    pair("雨声包围", "rain-wrapped intimacy", { adultOnly: true }),
    pair("蒸汽朦胧", "steamy diffused atmosphere", { adultOnly: true }),
    pair("复古精致", "polished vintage atmosphere", { adultOnly: true }),
    pair("海滩度假", "private resort atmosphere", { adultOnly: true }),
    pair("高定秀场后台", "couture backstage atmosphere", { adultOnly: true }),
    pair("梦幻朦胧", "dreamlike soft atmosphere", { adultOnly: true }),
    pair("克制的暧昧", "restrained ambiguity", { adultOnly: true }),
    pair("安静而亲密", "quiet intimacy", { adultOnly: true }),
    pair("慵懒午后", "a languid afternoon", { adultOnly: true }),
    pair("深夜独处", "late-night solitude", { adultOnly: true }),
    pair("若即若离", "lingering closeness", { adultOnly: true }),
    pair("温存余韵", "lingering warmth", { adultOnly: true }),
    pair("清晨微醺", "a gentle morning haze", { adultOnly: true }),
    pair("雨夜独处", "solitude on a rainy night", { adultOnly: true }),
    pair("缓慢的暧昧", "a slow-burning ambiguity", { adultOnly: true }),
    pair("私密温柔", "private tenderness", { adultOnly: true }),
    pair("慵懒缱绻", "languid closeness", { adultOnly: true }),
    pair("隐隐张力", "a quiet underlying tension", { adultOnly: true }),
    pair("暧昧潮湿", "humid ambiguity", { adultOnly: true }),
    pair("安静亲密", "hushed intimacy", { adultOnly: true }),
  
  ],
  adultRelationship: [
    pair("不指定", ""),
    pair("独自一人", "alone and self-assured", { adultOnly: true }),
    pair("双方自愿的伴侣", "consenting adult partners", { people: 2, adultOnly: true }),
    pair("浪漫情侣", "romantic adult couple", { people: 2, adultOnly: true }),
    pair("新婚伴侣", "newly partnered adults", { people: 2, adultOnly: true }),
    pair("长期伴侣", "long-term adult partners", { people: 2, adultOnly: true }),
    pair("互相尊重", "mutual respect and trust", { people: 2, adultOnly: true }),
    pair("亲密朋友", "close adult companions", { adultOnly: true }),
    pair("初次约会", "adult first-date atmosphere", { adultOnly: true }),
    pair("久别重逢", "adult reunion after time apart", { adultOnly: true }),
    pair("安静陪伴", "quiet companionship", { adultOnly: true }),
    pair("双向吸引", "mutual adult attraction", { adultOnly: true }),
    pair("平等关系", "equal and mutually consenting relationship", { adultOnly: true }),
    pair("刚认识的成年人", "newly met adults", { people: 2, adultOnly: true }),
    pair("彼此信任的伴侣", "trusting adult partners", { people: 2, adultOnly: true }),
    pair("缓慢靠近", "slowly growing closer", { people: 2, adultOnly: true }),
    pair("熟悉后的默契", "an easy familiarity", { people: 2, adultOnly: true }),
    pair("互相信任的成年人", "mutually trusting adults", { people: 2, adultOnly: true }),
    pair("克制的靠近", "a restrained approach", { people: 2, adultOnly: true }),
    pair("长久陪伴", "long companionship", { people: 2, adultOnly: true }),
  
  ],
  audioMode: [
    pair("仅环境音", "ambient sound only, no dialogue"),
    pair("单人画外音", "one character provides voice-over"),
    pair("单人现场对白", "one character speaks on camera"),
    pair("双人现场对白", "two characters exchange dialogue", { people: 2 }),
    pair("对白加画外音", "on-camera dialogue with additional voice-over"),
    pair("自然声音优先", "natural ambience with restrained vocal performance"),
    pair("低声私语", "quiet whispered voices", { people: 2, adultOnly: true }),
    pair("房间里的低语", "low voices in the room", { people: 2, adultOnly: true }),
  
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
    pose: "caught mid-turn in an adult presentation",
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
    accessories: "subtle mechanical device",
    pose: "walking toward the camera",
    scene: "an enchanted fantasy forest",
    lighting: "soft side backlight",
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
    accessories: "metal wristwatch",
    props: "over-ear headphones",
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
    action: "gently stretching",
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
  },
  "urban men everyday": {
    gender: "adult man",
    hairStyle: "short textured crop",
    hairColor: "dark brown",
    outfit: "camp-collar shirt with pleated trousers",
    fabric: "soft cotton and linen",
    accessories: "metal wristwatch",
    pose: "standing naturally",
    scene: "a city street",
    lighting: "soft overcast diffusion",
    visualStyle: "documentary photography"
  },
  "creative studio woman": {
    gender: "adult woman",
    hairStyle: "layered medium-length hair",
    hairColor: "black-tea brown",
    outfit: "oversized utility shirt with cargo trousers",
    fabric: "soft cotton and linen",
    accessories: "minimal silver earrings",
    pose: "adjusting a collar",
    scene: "a contemporary art gallery",
    lighting: "large soft window light",
    visualStyle: "high-fashion editorial"
  },
  "creative studio man": {
    gender: "adult man",
    hairStyle: "medium-length swept-back hair",
    hairColor: "natural black",
    outfit: "work apron layered over a relaxed shirt",
    fabric: "soft cotton and linen",
    accessories: "metal wristwatch",
    pose: "standing naturally",
    scene: "a contemporary art gallery",
    lighting: "soft side backlight",
    visualStyle: "documentary photography"
  },
  "business woman": {
    gender: "adult woman",
    hairStyle: "low chignon",
    hairColor: "dark brown",
    outfit: "tailored blazer dress with a structured shoulder",
    fabric: "brushed wool",
    accessories: "metal wristwatch",
    pose: "standing naturally",
    scene: "an apartment with floor-to-ceiling windows",
    lighting: "soft side backlight",
    visualStyle: "premium commercial photography"
  },
  "medical professional": {
    gender: "adult woman",
    hairStyle: "low ponytail",
    hairColor: "natural black",
    outfit: "clean medical scrubs with a professional fit",
    fabric: "soft cotton and linen",
    accessories: "reading glasses",
    pose: "standing naturally",
    scene: "a futuristic laboratory",
    lighting: "cool screen glow",
    visualStyle: "cinematic photorealism"
  },
  architect: {
    gender: "adult man",
    hairStyle: "classic side-part haircut",
    hairColor: "dark brown",
    outfit: "tailored blazer over a fine roll-neck knit",
    fabric: "brushed wool",
    accessories: "metal wristwatch",
    pose: "standing naturally",
    scene: "an apartment with floor-to-ceiling windows",
    lighting: "soft side backlight",
    props: "a slim laptop",
    visualStyle: "premium commercial photography"
  },
  photojournalist: {
    gender: "adult man",
    hairStyle: "messy natural short hair",
    hairColor: "natural black",
    outfit: "photographer jacket with practical pockets",
    fabric: "textured denim",
    accessories: "metal wristwatch",
    pose: "crouching pose",
    scene: "a rain-soaked city street at night",
    lighting: "colorful practical neon lighting",
    props: "a vintage camera",
    visualStyle: "documentary photography"
  },
  chef: {
    gender: "adult man",
    hairStyle: "short textured crop",
    hairColor: "natural black",
    outfit: "classic chef whites with a dark apron",
    fabric: "soft cotton and linen",
    pose: "standing naturally",
    scene: "a theater backstage area",
    lighting: "warm practical lamp light",
    visualStyle: "documentary photography"
  },
  lawyer: {
    gender: "adult woman",
    hairStyle: "low chignon",
    hairColor: "dark brown",
    outfit: "tailored black suit",
    fabric: "brushed wool",
    accessories: "metal wristwatch",
    pose: "seated on a chair",
    scene: "a quiet library with tall bookshelves",
    lighting: "soft side backlight",
    visualStyle: "cinematic film still"
  },
  "evening gala woman": {
    gender: "adult woman",
    hairStyle: "loose updo",
    hairColor: "auburn",
    expression: "subtle closed-mouth smile",
    outfit: "floor-length silk evening gown",
    fabric: "fluid silk",
    accessories: "delicate necklace",
    grooming: "vintage red lip",
    pose: "leaning on a railing",
    scene: "a luxurious hotel corridor",
    lighting: "warm practical lamp light",
    palette: "warm golden palette",
    visualStyle: "cinematic film still"
  },
  "black tie man": {
    gender: "adult man",
    hairStyle: "slicked-back hair",
    hairColor: "natural black",
    outfit: "formal black tailcoat and evening trousers",
    fabric: "rich velvet",
    accessories: "brooch",
    pose: "standing naturally",
    scene: "a luxurious hotel corridor",
    lighting: "low-key cinematic lighting",
    palette: "monochrome black-and-white palette",
    visualStyle: "cinematic film still"
  },
  "jazz singer": {
    gender: "adult woman",
    hairStyle: "voluminous curls",
    hairColor: "burgundy",
    outfit: "stage performance outfit",
    fabric: "rich velvet",
    accessories: "delicate necklace",
    grooming: "soft smoky eye",
    pose: "seated on a chair",
    scene: "a theater backstage area",
    lighting: "warm practical lamp light",
    props: "a vintage microphone",
    visualStyle: "cinematic film still"
  },
  "morning at home woman": {
    gender: "adult woman",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "dark brown",
    outfit: "lightweight yukata",
    fabric: "soft cotton and linen",
    pose: "standing beside a window",
    scene: "a quiet hotel room in the morning",
    lighting: "large soft window light",
    visualStyle: "cinematic photorealism"
  },
  "morning at home man": {
    gender: "adult man",
    hairStyle: "short curly crop",
    hairColor: "dark brown",
    outfit: "men's relaxed linen lounge set",
    fabric: "soft cotton and linen",
    pose: "standing beside a window",
    scene: "a warm bedroom with soft practical lamps",
    lighting: "large soft window light",
    visualStyle: "cinematic photorealism"
  },
  "boudoir portrait woman": {
    gender: "adult woman",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "dark brown",
    expression: "relaxed intimate expression",
    outfit: "a silk robe loosely tied",
    fabric: "satin",
    pose: "standing naturally",
    scene: "a boutique hotel suite",
    lighting: "large soft window light",
    palette: "soft rose and skin-tone palette",
    visualStyle: "cinematic photorealism"
  },
  "boudoir portrait man": {
    gender: "adult man",
    hairStyle: "short curly crop",
    hairColor: "dark brown",
    expression: "relaxed intimate expression",
    outfit: "men's silk pajama set",
    fabric: "satin",
    pose: "leaning on a railing",
    scene: "a boutique hotel suite",
    lighting: "large soft window light",
    palette: "soft rose and skin-tone palette",
    visualStyle: "cinematic photorealism"
  },
  "date night couple": {
    subjectType: "couple",
    relationshipType: "adult woman and adult man",
    audienceOrientation: "a balanced neutral-gaze composition",
    gender: "an adult woman and an adult man",
    relationshipDynamic: "with quiet romantic closeness",
    hairStyle: "low chignon",
    hairColor: "dark brown",
    outfit: "a one-shoulder gown",
    secondHairStyle: "slicked-back hair",
    secondOutfit: "double-breasted navy suit",
    pose: "leaning on a railing",
    scene: "a rooftop overlooking the city at night",
    lighting: "low-key cinematic lighting",
    visualStyle: "cinematic film still"
  },
  "male couple date": {
    subjectType: "couple",
    relationshipType: "two adult men",
    audienceOrientation: "a balanced neutral-gaze composition",
    gender: "two adult men",
    relationshipDynamic: "with quiet romantic closeness",
    hairStyle: "short textured crop",
    hairColor: "natural black",
    outfit: "tailored blazer over a fine roll-neck knit",
    secondHairStyle: "medium-length swept-back hair",
    secondOutfit: "camp-collar shirt with pleated trousers",
    action: "one adult man gently cupping the other's face",
    scene: "a rooftop overlooking the city at night",
    lighting: "low-key cinematic lighting",
    visualStyle: "cinematic film still"
  },
  "female couple date": {
    subjectType: "couple",
    relationshipType: "two adult women",
    audienceOrientation: "a balanced neutral-gaze composition",
    gender: "two adult women",
    relationshipDynamic: "with quiet romantic closeness",
    hairStyle: "French bob",
    hairColor: "dark brown",
    outfit: "silk blouse with a high-waisted pencil skirt",
    secondHairStyle: "long layered straight hair",
    secondOutfit: "minimalist slip dress",
    action: "two adult women with fingers interlaced",
    scene: "a rooftop overlooking the city at night",
    lighting: "low-key cinematic lighting",
    visualStyle: "cinematic film still"
  },
  "adult couple portrait": {
    subjectType: "couple",
    relationshipType: "two adult partners",
    audienceOrientation: "a balanced neutral-gaze composition",
    gender: "two adult characters with varied gender presentation",
    relationshipDynamic: "with quiet romantic closeness",
    hairStyle: "layered medium-length hair",
    hairColor: "dark brown",
    outfit: "coordinated formal outfits in matching tones",
    secondHairStyle: "classic side-part haircut",
    secondOutfit: "charcoal three-piece suit with a waistcoat",
    pose: "standing naturally",
    scene: "an apartment with floor-to-ceiling windows",
    lighting: "soft side backlight",
    visualStyle: "cinematic film still"
  },
  "creative duo": {
    subjectType: "couple",
    relationshipType: "two adult partners",
    audienceOrientation: "a balanced neutral-gaze composition",
    gender: "two adult characters with varied gender presentation",
    relationshipDynamic: "between equal adult partners",
    hairStyle: "messy natural short hair",
    hairColor: "natural black",
    outfit: "work apron layered over a relaxed shirt",
    secondHairStyle: "low ponytail",
    secondOutfit: "oversized utility shirt with cargo trousers",
    pose: "standing naturally",
    scene: "a contemporary art gallery",
    lighting: "soft side backlight",
    props: "brushes and a canvas",
    visualStyle: "documentary photography"
  },
  "three friends portrait": {
    subjectType: "group",
    relationshipType: "three adult friends",
    audienceOrientation: "a balanced neutral-gaze composition",
    gender: "three adult characters with varied gender presentation",
    hairStyle: "shoulder-length bob",
    hairColor: "dark brown",
    outfit: "relaxed t-shirt and trousers",
    secondHairStyle: "short textured crop",
    secondOutfit: "camp-collar shirt with pleated trousers",
    secondCharacterCustom: "the third adult friend wears a relaxed overshirt and has a distinct hairstyle",
    pose: "standing naturally",
    scene: "a modern apartment living room",
    lighting: "large soft window light",
    visualStyle: "documentary photography"
  },
  "sweet petite styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "petite adult build",
    face: "round face",
    expression: "playful smile",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "dark brown",
    outfit: "cream knit cardigan with a pleated skirt",
    scene: "a quiet cafe beside a large window",
    lighting: "large soft window light",
    visualStyle: "Japanese portrait photography"
  },
  "Japanese cute styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "petite adult build",
    face: "soft facial contours",
    expression: "shy sweet smile",
    hairStyle: "high ponytail",
    hairColor: "natural black",
    outfit: "relaxed Japanese-style sweater with a short skirt",
    scene: "a quiet cafe beside a large window",
    lighting: "large soft window light",
    visualStyle: "Japanese portrait photography"
  },
  "girl-next-door sweet styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "natural balanced build",
    face: "a softly rounded face",
    expression: "subtle closed-mouth smile",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "dark brown",
    outfit: "sweet dress with a rounded collar",
    scene: "a modern apartment living room",
    lighting: "soft overcast diffusion",
    visualStyle: "documentary photography"
  },
  "bright energetic sweet styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "athletic build",
    face: "soft facial contours",
    expression: "playful smile",
    hairStyle: "high ponytail",
    hairColor: "natural black",
    outfit: "relaxed t-shirt and trousers",
    pose: "walking toward the camera",
    scene: "a city street",
    lighting: "warm golden-hour sunlight",
    visualStyle: "documentary photography"
  },
  "soft cozy cute styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "petite adult build",
    face: "round face",
    expression: "gentle expression",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "dark brown",
    outfit: "soft hooded loungewear set",
    scene: "a modern apartment living room",
    lighting: "large soft window light",
    visualStyle: "documentary photography"
  },
  "polished doll-like adult styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "natural balanced build",
    face: "soft facial contours",
    expression: "calm, natural expression",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "dark brown",
    outfit: "sweet knit set with lace trim",
    scene: "a luxurious hotel corridor",
    lighting: "soft side backlight",
    visualStyle: "high-fashion editorial"
  },
  "sweet and edgy mixed styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "athletic build",
    face: "soft facial contours",
    expression: "sweet yet edgy light smile",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "natural black",
    outfit: "sweet edgy cropped jacket with a short skirt",
    scene: "a neon-lit urban alley",
    lighting: "colorful practical neon lighting",
    visualStyle: "cinematic film still"
  },
  "sweet Lolita styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "petite adult build",
    face: "round face",
    expression: "shy sweet smile",
    hairStyle: "long wavy hair with natural texture",
    hairColor: "dark brown",
    outfit: "adult sweet Lolita dress with layered ruffles and a petticoat",
    scene: "a classical courtyard",
    lighting: "soft side backlight",
    visualStyle: "high-fashion editorial"
  },
  "light classical sweet styling": {
    subjectType: "person",
    gender: "adult woman",
    age: "in their twenties",
    body: "natural balanced build",
    face: "soft facial contours",
    expression: "gentle expression",
    hairStyle: "soft French braid",
    hairColor: "auburn",
    outfit: "light classical sweet dress",
    scene: "a classical courtyard",
    lighting: "soft side backlight",
    visualStyle: "cinematic film still"
  }
};

const STYLE_PRESETS = {
  "clean-neighbor": {
    zh: "清纯邻家",
    group: "现代日常",
    promptZh: "清新自然的成年美感，当代中国生活人像",
    promptEn: "fresh understated adult beauty, contemporary Chinese lifestyle portrait",
    fields: {
      face: "soft facial contours",
      hairStyle: "layered medium-length hair",
      hairColor: "natural black",
      expression: "subtle closed-mouth smile",
      grooming: "light natural makeup",
      skin: "soft translucent skin",
      palette: "low-saturation cream palette",
      visualStyle: "documentary photography",
      outfit: "cream knit cardigan with a pleated skirt",
      fabric: "fine knit",
      outfitColor: "cream",
      fit: "relaxed oversized fit",
      accessories: "minimal silver earrings",
      footwear: "white sneakers"
    }
  },
  "sweet-energetic": {
    zh: "甜美元气",
    group: "现代日常",
    promptZh: "明快甜美的成年女性造型，轻盈生活感",
    promptEn: "bright sweet adult styling, light everyday editorial aesthetic",
    fields: {
      face: "round face",
      hairStyle: "high ponytail",
      hairColor: "natural black",
      expression: "playful smile",
      grooming: "a soft rosy makeup look",
      skin: "soft translucent skin",
      palette: "soft rose and skin-tone palette",
      visualStyle: "Japanese portrait photography",
      outfit: "relaxed Japanese-style sweater with a short skirt",
      fabric: "fine knit",
      outfitColor: "soft pink",
      fit: "relaxed oversized fit",
      accessories: "hair ribbon",
      footwear: "white sneakers"
    }
  },
  "gentle-intellectual": {
    zh: "温柔知性",
    group: "温婉知性",
    promptZh: "温婉、克制、知性的当代中国女性气质",
    promptEn: "gentle restrained Chinese editorial elegance with a calm intellectual presence",
    fields: {
      face: "oval face",
      hairStyle: "low ponytail",
      hairColor: "dark brown",
      expression: "gentle expression",
      grooming: "a soft rosy makeup look",
      skin: "soft translucent skin",
      palette: "low-saturation cream palette",
      visualStyle: "high-fashion editorial",
      outfit: "silk blouse with a high-waisted pencil skirt",
      fabric: "fluid silk",
      outfitColor: "cream",
      fit: "tailored fit",
      accessories: "delicate necklace",
      footwear: "minimal flats"
    }
  },
  "jiangnan-grace": {
    zh: "江南温婉",
    group: "温婉知性",
    promptZh: "江南气质的温婉成年女性，柔和、含蓄",
    promptEn: "Jiangnan-inspired soft adult femininity, restrained and graceful",
    fields: {
      face: "soft facial contours",
      hairStyle: "low chignon",
      hairColor: "natural black",
      expression: "gentle expression",
      grooming: "new-Chinese natural makeup",
      skin: "soft translucent skin",
      palette: "earth-tone palette",
      visualStyle: "modern East Asian aesthetic",
      outfit: "adult new-Chinese long dress",
      fabric: "fluid silk",
      outfitColor: "cream",
      fit: "flowing silhouette",
      accessories: "classical jade pendant",
      footwear: "low-heeled embroidered shoes"
    }
  },
  "urban-mature": {
    zh: "都市轻熟",
    group: "现代日常",
    promptZh: "成熟、自信、克制的当代中国都市女性",
    promptEn: "confident modern Chinese urban adult woman with refined mature styling",
    fields: {
      face: "oval face",
      hairStyle: "shoulder-length bob",
      hairColor: "natural black",
      expression: "confident expression",
      grooming: "vintage red lip",
      skin: "natural skin texture",
      palette: "high-contrast cinematic color grade",
      visualStyle: "high-fashion editorial",
      outfit: "modern fitted qipao",
      fabric: "fluid silk",
      outfitColor: "black",
      fit: "slim fit",
      accessories: "pearl drop earrings",
      footwear: "minimal flats"
    }
  },
  "bright-presence": {
    zh: "明艳大气",
    group: "明艳复古",
    promptZh: "明艳、自信、大气的东方成年女性美",
    promptEn: "bold luminous adult East Asian beauty with confident editorial presence",
    fields: {
      face: "defined cheekbones",
      hairStyle: "voluminous curls",
      hairColor: "natural black",
      expression: "confident expression",
      grooming: "vintage red lip",
      skin: "natural skin texture",
      palette: "high-contrast cinematic color grade",
      visualStyle: "high-fashion editorial",
      outfit: "floor-length silk evening gown",
      fabric: "fluid silk",
      outfitColor: "burgundy",
      fit: "structured silhouette",
      accessories: "pearl drop earrings",
      footwear: "high heels"
    }
  },
  "hong-kong-retro": {
    zh: "港风复古",
    group: "明艳复古",
    promptZh: "九十年代香港电影感的明艳成年女性",
    promptEn: "1990s Hong Kong cinematic adult beauty with bold retro styling",
    fields: {
      face: "defined cheekbones",
      hairStyle: "voluminous curls",
      hairColor: "natural black",
      expression: "confident expression",
      grooming: "vintage red lip",
      skin: "natural skin texture",
      palette: "muted vintage film colors",
      visualStyle: "vintage film aesthetic",
      outfit: "a high-slit evening skirt",
      fabric: "fluid silk",
      outfitColor: "black",
      fit: "slim fit",
      accessories: "long drop earrings",
      footwear: "pointed-toe pumps"
    }
  },
  "republic-lady": {
    zh: "民国闺秀",
    group: "明艳复古",
    promptZh: "民国审美中的端庄成年女性造型",
    promptEn: "Republican-era inspired refined adult Chinese styling",
    fields: {
      face: "soft facial contours",
      hairStyle: "low chignon",
      hairColor: "natural black",
      expression: "gentle expression",
      grooming: "classical Chinese red lip",
      skin: "soft translucent skin",
      palette: "muted vintage film colors",
      visualStyle: "Chinese cinematic style",
      outfit: "adult new-Chinese long dress",
      fabric: "fluid silk",
      outfitColor: "burgundy",
      fit: "tailored fit",
      accessories: "pearl drop earrings",
      footwear: "low-heeled embroidered shoes"
    }
  },
  "new-chinese-modern": {
    zh: "新中式都市",
    group: "当代东方",
    promptZh: "用现代剪裁表达东方细节的成年女性造型",
    promptEn: "modern Chinese urban styling with restrained Eastern detailing",
    fields: {
      face: "soft facial contours",
      hairStyle: "low ponytail",
      hairColor: "natural black",
      expression: "confident expression",
      grooming: "new-Chinese natural makeup",
      skin: "natural skin texture",
      palette: "low-saturation cream palette",
      visualStyle: "high-fashion editorial",
      outfit: "adult new-Chinese mandarin-collar ensemble",
      fabric: "satin",
      outfitColor: "black",
      fit: "structured silhouette",
      accessories: "classical jade pendant",
      footwear: "minimal flats"
    }
  },
  "tang-classical": {
    zh: "唐风丰润",
    group: "传统古典",
    promptZh: "唐风古典成年女性造型，丰润端正、色彩华贵",
    promptEn: "Tang-dynasty-inspired adult Chinese beauty with full classical contours and warm color",
    fields: {
      face: "round face",
      hairStyle: "classical high bun",
      hairColor: "natural black",
      expression: "gentle expression",
      grooming: "Tang-inspired peach-blossom makeup",
      skin: "soft translucent skin",
      palette: "warm golden palette",
      visualStyle: "Chinese cinematic style",
      outfit: "adult Tang-style chest-high ruqun",
      fabric: "fluid silk",
      outfitColor: "burgundy",
      fit: "flowing silhouette",
      accessories: "ornate Chinese hair crown",
      footwear: "embroidered cloth shoes"
    }
  },
  "song-refined": {
    zh: "宋韵清雅",
    group: "传统古典",
    promptZh: "宋韵审美中的清雅、克制成年女性造型",
    promptEn: "Song-dynasty-inspired refined adult Chinese styling with quiet elegance",
    fields: {
      face: "oval face",
      hairStyle: "classical low updo",
      hairColor: "natural black",
      expression: "gentle expression",
      grooming: "refined Song-inspired makeup",
      skin: "soft translucent skin",
      palette: "earth-tone palette",
      visualStyle: "gongbi brush-painting style",
      outfit: "adult Song-style beizi with a wrapped chest layer",
      fabric: "translucent chiffon",
      outfitColor: "cream",
      fit: "flowing silhouette",
      accessories: "classical jade pendant",
      footwear: "classical cloth shoes"
    }
  },
  "xianxia-ethereal": {
    zh: "仙侠清冷",
    group: "传统古典",
    promptZh: "清冷、飘逸的东方仙侠成年女性造型",
    promptEn: "ethereal adult wuxia-inspired Chinese styling with cool restrained beauty",
    fields: {
      face: "oval face",
      hairStyle: "classical long straight hair",
      hairColor: "natural black",
      expression: "gentle expression",
      grooming: "ethereal wuxia-inspired makeup",
      skin: "soft translucent skin",
      palette: "cool teal-blue palette",
      visualStyle: "Eastern fantasy cinematic style",
      outfit: "adult Wei-Jin-inspired wide-sleeve robe",
      fabric: "translucent chiffon",
      outfitColor: "white",
      fit: "flowing silhouette",
      accessories: "classical dangling hairpin",
      footwear: "classical cloth shoes"
    }
  },
  "sweet-lolita-look": {
    zh: "甜系洛丽塔",
    group: "甜美洋装",
    promptZh: "甜美精致的成年洛丽塔洋装造型",
    promptEn: "polished adult sweet Lolita styling with soft doll-like elegance",
    fields: {
      face: "round face",
      hairStyle: "twin tails",
      hairColor: "dark brown",
      expression: "shy sweet smile",
      grooming: "a soft rosy makeup look",
      skin: "soft translucent skin",
      palette: "soft rose and skin-tone palette",
      visualStyle: "Japanese portrait photography",
      outfit: "adult sweet Lolita dress with layered ruffles and a petticoat",
      fabric: "fine lace",
      outfitColor: "cream",
      fit: "layered styling",
      accessories: "hair ribbon",
      footwear: "Mary Jane heels"
    }
  },
  "french-chic": {
    zh: "法式优雅",
    group: "国际风格",
    promptZh: "轻盈克制的法式成年女性造型",
    promptEn: "effortless adult French chic styling with restrained editorial elegance",
    fields: {
      face: "soft facial contours",
      hairStyle: "shoulder-length bob",
      hairColor: "dark brown",
      expression: "subtle closed-mouth smile",
      grooming: "vintage red lip",
      skin: "natural skin texture",
      palette: "low-saturation cream palette",
      visualStyle: "high-fashion editorial",
      outfit: "silk blouse with a high-waisted pencil skirt",
      fabric: "fluid silk",
      outfitColor: "cream",
      fit: "tailored fit",
      accessories: "pearl drop earrings",
      footwear: "minimal flats"
    }
  },
  "parisian-minimal": {
    zh: "巴黎极简",
    group: "国际风格",
    promptZh: "巴黎街头感的极简成年女性造型",
    promptEn: "minimal Parisian street-style adult fashion portrait",
    fields: {
      face: "oval face",
      hairStyle: "low ponytail",
      hairColor: "natural black",
      expression: "calm, natural expression",
      grooming: "a nude lip gloss",
      skin: "natural skin texture",
      palette: "muted vintage film colors",
      visualStyle: "vintage film aesthetic",
      outfit: "minimalist slip dress",
      fabric: "fluid silk",
      outfitColor: "black",
      fit: "slim fit",
      accessories: "long drop earrings",
      footwear: "pointed-toe pumps"
    }
  },
  "old-money": {
    zh: "复古老钱风",
    group: "国际风格",
    promptZh: "克制、讲究面料与剪裁的复古老钱风成年女性",
    promptEn: "refined old-money inspired adult editorial styling with understated luxury",
    fields: {
      face: "oval face",
      hairStyle: "low chignon",
      hairColor: "dark brown",
      expression: "confident expression",
      grooming: "a matte finish base",
      skin: "natural skin texture",
      palette: "earth-tone palette",
      visualStyle: "high-fashion editorial",
      outfit: "vintage plaid suit",
      fabric: "brushed wool",
      outfitColor: "gray",
      fit: "tailored fit",
      accessories: "a pearl necklace",
      footwear: "minimal flats"
    }
  },
  "hollywood-glamour": {
    zh: "好莱坞华丽",
    group: "国际风格",
    promptZh: "高对比、高光泽的好莱坞成年女性造型",
    promptEn: "Hollywood-inspired adult glamour with high-contrast cinematic beauty",
    fields: {
      face: "defined cheekbones",
      hairStyle: "voluminous curls",
      hairColor: "natural black",
      expression: "confident expression",
      grooming: "vintage red lip",
      skin: "subtle natural highlights",
      palette: "high-contrast cinematic color grade",
      visualStyle: "cinematic film still",
      outfit: "a sequined fitted gown",
      fabric: "high-gloss satin",
      outfitColor: "black",
      fit: "slim fit",
      accessories: "long drop earrings",
      footwear: "high heels"
    }
  },
  "italian-glamour": {
    zh: "意式华丽",
    group: "国际风格",
    promptZh: "明艳、感性的意式成年女性造型",
    promptEn: "Italian glamour adult editorial styling with warm luminous sensuality",
    fields: {
      face: "defined cheekbones",
      hairStyle: "voluminous curls",
      hairColor: "dark brown",
      expression: "confident expression",
      grooming: "glossy lips",
      skin: "subtle natural highlights",
      palette: "warm golden palette",
      visualStyle: "high-fashion editorial",
      outfit: "strapless evening dress",
      fabric: "satin",
      outfitColor: "burgundy",
      fit: "structured silhouette",
      accessories: "long drop earrings",
      footwear: "high heels"
    }
  },
  "scandinavian-minimal": {
    zh: "北欧极简",
    group: "国际风格",
    promptZh: "清简、自然、低饱和的北欧成年女性造型",
    promptEn: "Scandinavian minimal adult portrait styling with calm natural restraint",
    fields: {
      face: "soft facial contours",
      hairStyle: "low ponytail",
      hairColor: "dark brown",
      expression: "calm, natural expression",
      grooming: "natural bare makeup",
      skin: "natural skin texture",
      palette: "low-saturation cream palette",
      visualStyle: "documentary photography",
      outfit: "oversized white shirt",
      fabric: "soft cotton and linen",
      outfitColor: "white",
      fit: "relaxed oversized fit",
      accessories: "minimal silver earrings",
      footwear: "minimal flats"
    }
  },
  "y2k-fashion": {
    zh: "Y2K 千禧风",
    group: "国际风格",
    promptZh: "明亮、俏皮、带金属与粉彩元素的千禧年成年女性造型",
    promptEn: "Y2K-inspired adult fashion styling with playful metallic and pastel details",
    fields: {
      face: "round face",
      hairStyle: "high ponytail",
      hairColor: "natural black",
      expression: "playful smile",
      grooming: "glossy lips",
      skin: "soft translucent skin",
      palette: "neon pink and cyan palette",
      visualStyle: "high-fashion editorial",
      outfit: "a fitted slip dress",
      fabric: "satin",
      outfitColor: "soft pink",
      fit: "slim fit",
      accessories: "hair ribbon",
      footwear: "platform heels"
    }
  },
  "gothic-romantic": {
    zh: "哥特浪漫",
    group: "国际风格",
    promptZh: "暗色、精致、浪漫的哥特成年女性造型",
    promptEn: "romantic gothic adult fashion portrait with dark refined styling",
    fields: {
      face: "oval face",
      hairStyle: "voluminous curls",
      hairColor: "natural black",
      expression: "mysterious expression",
      grooming: "soft smoky eye",
      skin: "matte skin finish",
      palette: "high-contrast cinematic color grade",
      visualStyle: "dark cinematic aesthetic",
      outfit: "adult classic Lolita dress with a structured A-line skirt",
      fabric: "fine lace",
      outfitColor: "black",
      fit: "layered styling",
      accessories: "long drop earrings",
      footwear: "ankle boots"
    }
  },
  "sweet-heart-dress": {
    zh: "甜心洋装",
    group: "甜美洋装",
    promptZh: "甜美但不幼态的成年洋装造型，圆润轮廓与柔和甜度",
    promptEn: "sweet adult dress styling with soft rounded lines, no juvenile-coded look",
    fields: {
      face: "a softly rounded face",
      hairStyle: "voluminous curls",
      hairColor: "honey blonde",
      expression: "playful smile",
      grooming: "a soft rosy makeup look",
      skin: "soft translucent skin",
      palette: "soft rose and skin-tone palette",
      visualStyle: "premium commercial photography",
      outfit: "sweet dress with a rounded collar",
      fabric: "delicate lace texture",
      outfitColor: "soft pink",
      fit: "relaxed oversized fit",
      accessories: "hair ribbon",
      footwear: "Mary Jane heels"
    }
  },
  "playful-spirit": {
    zh: "古灵精怪",
    group: "现代日常",
    promptZh: "轻松俏皮的都市年轻感，发型与配色带点玩心",
    promptEn: "lighthearted quirky urban styling with playful hair and color accents",
    fields: {
      face: "subtle dimples",
      hairStyle: "wolf cut",
      hairColor: "dusty pink",
      expression: "one-eye wink",
      grooming: "glossy lips",
      skin: "natural skin texture",
      palette: "neon pink and cyan palette",
      visualStyle: "Japanese portrait photography",
      outfit: "oversized hoodie",
      fabric: "soft cotton and linen",
      outfitColor: "soft pink",
      fit: "relaxed oversized fit",
      accessories: "minimal silver earrings",
      footwear: "platform heels"
    }
  },
  "fresh-sweet": {
    zh: "清甜少女",
    group: "现代日常",
    promptZh: "清透干净的成年少女感，奶油色系与柔和编织发",
    promptEn: "fresh clean adult youthful look in cream tones with a soft braid",
    fields: {
      face: "oval face",
      hairStyle: "soft French braid",
      hairColor: "milk-tea beige",
      expression: "shy sweet smile",
      grooming: "light natural makeup",
      skin: "fair skin",
      palette: "low-saturation cream palette",
      visualStyle: "Japanese portrait photography",
      outfit: "sweet knit set with lace trim",
      fabric: "fine knit",
      outfitColor: "cream",
      fit: "relaxed oversized fit",
      accessories: "hair ribbon",
      footwear: "minimal flats"
    }
  },
  "cool-urban": {
    zh: "冷感都市",
    group: "现代日常",
    promptZh: "都市冷感气质，利落剪裁与黑白单色影调",
    promptEn: "cool urban presence with sharp tailoring and monochrome tones",
    fields: {
      face: "angular facial structure",
      hairStyle: "side-parted bob",
      hairColor: "blue-black",
      expression: "lowered gaze",
      grooming: "a matte finish base",
      skin: "matte skin finish",
      palette: "monochrome black-and-white palette",
      visualStyle: "high-fashion editorial",
      outfit: "silk blouse with a high-waisted pencil skirt",
      fabric: "fluid silk",
      outfitColor: "black",
      fit: "tailored fit",
      accessories: "metal wristwatch",
      footwear: "pointed-toe pumps"
    }
  },
  "film-retro": {
    zh: "胶片复古",
    group: "明艳复古",
    promptZh: "老胶片质感的复古造型，酒红与格纹",
    promptEn: "vintage film-grain styling with burgundy and plaid",
    fields: {
      face: "defined cheekbones",
      hairStyle: "voluminous curls",
      hairColor: "auburn",
      expression: "restrained smile",
      grooming: "vintage red lip",
      skin: "natural skin texture",
      palette: "muted vintage film colors",
      visualStyle: "vintage film aesthetic",
      outfit: "vintage plaid suit",
      fabric: "brushed wool",
      outfitColor: "burgundy",
      fit: "tailored fit",
      accessories: "pearl drop earrings",
      footwear: "ankle boots"
    }
  },
  "american-retro": {
    zh: "美式复古",
    group: "明艳复古",
    promptZh: "美式复古的暖调与饱满轮廓，红铜发色配缎面",
    promptEn: "American retro warmth with fuller silhouettes, copper hair and satin",
    fields: {
      face: "a softly rounded jawline",
      hairStyle: "voluminous curls",
      hairColor: "copper red",
      expression: "confident expression",
      grooming: "glossy lips",
      skin: "natural sun-kissed skin",
      palette: "warm golden palette",
      visualStyle: "premium commercial photography",
      outfit: "a fitted slip dress",
      fabric: "satin",
      outfitColor: "cream",
      fit: "slim fit",
      accessories: "leather handbag",
      footwear: "chunky block heels"
    }
  },
  "korean-clear": {
    zh: "韩系清透",
    group: "现代日常",
    promptZh: "韩系通透感，柔光肤色与奶油开衫百褶裙",
    promptEn: "Korean-clear styling with translucent skin, cream cardigan and pleated skirt",
    fields: {
      face: "smooth soft-contoured features",
      hairStyle: "long wavy hair with natural texture",
      hairColor: "warm brown",
      expression: "soft knowing smile",
      grooming: "naturally luminous skin",
      skin: "soft translucent skin",
      palette: "soft rose and skin-tone palette",
      visualStyle: "premium commercial photography",
      outfit: "cream knit cardigan with a pleated skirt",
      fabric: "fine knit",
      outfitColor: "cream",
      fit: "relaxed oversized fit",
      accessories: "delicate necklace",
      footwear: "white sneakers"
    }
  },
  "thai-mixed": {
    zh: "泰系轻混血",
    group: "国际风格",
    promptZh: "东南亚轻混血五官，暖金影调与露肩礼服",
    promptEn: "Thai mixed-heritage features in warm golden tones with an off-shoulder gown",
    fields: {
      face: "a high forehead",
      hairStyle: "long layered straight hair",
      hairColor: "chocolate brown",
      expression: "focused expression",
      grooming: "a nude lip gloss",
      skin: "warm tan skin",
      palette: "warm golden palette",
      visualStyle: "high-fashion editorial",
      outfit: "strapless evening dress",
      fabric: "satin",
      outfitColor: "black",
      fit: "structured silhouette",
      accessories: "long drop earrings",
      footwear: "strappy heels"
    }
  },
  "hong-kong-heiress": {
    zh: "港风大小姐",
    group: "明艳复古",
    promptZh: "九十年代港风名门气质，高对比影调与缎面高开衩",
    promptEn: "nineties Hong Kong heiress styling with high-contrast grade and satin slit skirt",
    fields: {
      face: "a clearly defined jawline",
      hairStyle: "side-parted bob",
      hairColor: "dark brown",
      expression: "a knowing smile in the eyes",
      grooming: "vintage red lip",
      skin: "fair skin",
      palette: "high-contrast cinematic color grade",
      visualStyle: "cinematic film still",
      outfit: "a high-slit evening skirt",
      fabric: "high-gloss satin",
      outfitColor: "black",
      fit: "a high slit hem",
      accessories: "a pearl necklace",
      footwear: "kitten heels"
    }
  },
  "athletic-spirit": {
    zh: "运动元气",
    group: "现代日常",
    promptZh: "运动感与元气，高马尾、雀斑和暖阳色调",
    promptEn: "athletic energetic styling with high ponytail, freckles and warm sunlight",
    fields: {
      face: "light natural freckles",
      hairStyle: "high ponytail",
      hairColor: "honey blonde",
      expression: "lighthearted expression",
      grooming: "soft flushed blush",
      skin: "natural sun-kissed skin",
      palette: "warm golden palette",
      visualStyle: "documentary photography",
      outfit: "a sports top with shorts",
      fabric: "technical performance fabric",
      outfitColor: "gray",
      fit: "slim fit",
      accessories: "minimal silver earrings",
      footwear: "white sneakers"
    }
  },
  "retro-sweetheart": {
    zh: "复古甜心",
    group: "甜美洋装",
    promptZh: "甜酷复古的成年造型，短外套配短裙与红唇",
    promptEn: "sweet-edgy retro adult styling with a cropped jacket, short skirt and red lip",
    fields: {
      face: "subtle dimples",
      hairStyle: "shoulder-length bob",
      hairColor: "berry red",
      expression: "playful smile",
      grooming: "vintage red lip",
      skin: "fair skin",
      palette: "soft rose and skin-tone palette",
      visualStyle: "premium commercial photography",
      outfit: "sweet edgy cropped jacket with a short skirt",
      fabric: "matte leather",
      outfitColor: "soft pink",
      fit: "structured silhouette",
      accessories: "hair ribbon",
      footwear: "kitten heels"
    }
  },
  "literary-rain": {
    zh: "雨夜文艺",
    group: "国际风格",
    promptZh: "雨夜文艺气质，长风衣、凌乱短发与青蓝冷调",
    promptEn: "literary rainy-night mood with a long trench, messy short hair and teal-blue grade",
    fields: {
      face: "a long oval face",
      hairStyle: "messy natural short hair",
      hairColor: "cool ash brown",
      expression: "melancholic expression",
      grooming: "natural bare makeup",
      skin: "natural skin texture",
      palette: "cool teal-blue palette",
      visualStyle: "cinematic film still",
      outfit: "long trench coat",
      fabric: "brushed wool",
      outfitColor: "gray",
      fit: "flowing silhouette",
      accessories: "a silk scarf",
      footwear: "ankle boots"
    }
  },
};

const HALF_NUDE_LOOK_LIBRARY = {
  "现代日常": [
    {
      zh: "蕾丝内衣 + 薄纱睡袍",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style open robe with inner set", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "cream", coveredFit: "relaxed draped fit", accessories: "pearl drop earrings", footwear: "barefoot" }
    },
    {
      zh: "黑色束腰 + 吊带袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style corset and brief set", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "black", coveredFit: "tailored fit", accessories: "long drop earrings", footwear: "fine stiletto heels", hosiery: "garter stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "silky sheen", hosieryPattern: "lace weave", hosieryToe: "sheer sandal toe", hosieryTop: "suspender straps", hosieryColor: "black" }
    },
    {
      zh: "缎面短睡裙 + 蕾丝内裤",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style short silk slip", coveredMaterial: "lustrous satin", coveredOpacity: "semi-sheer fabric", coveredColor: "champagne", coveredFit: "relaxed draped fit", accessories: "a thin waist belt", footwear: "barefoot" }
    },
    {
      zh: "网纱连体衣 + 大腿袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style sheer mesh bodysuit", coveredMaterial: "stretch mesh", coveredOpacity: "highly translucent fabric", coveredColor: "black", coveredFit: "close-fitting cut", footwear: "high heels", hosiery: "silicone hold-up stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "soft natural sheen", hosieryPattern: "plain solid knit", hosieryToe: "sheer sandal toe", hosieryTop: "lace top band", hosieryColor: "black" }
    },
    {
      zh: "露背连体衣 + 蕾丝手套",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style open-back bodysuit", coveredMaterial: "embroidered mesh", coveredOpacity: "semi-sheer fabric", coveredColor: "burgundy", coveredFit: "close-fitting cut", accessories: "lace gloves", footwear: "pointed-toe pumps" }
    }
  ],
  "温婉知性": [
    {
      zh: "香槟睡裙 + 薄纱开衫",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style open robe with inner set", coveredMaterial: "lustrous satin", coveredOpacity: "semi-sheer fabric", coveredColor: "champagne", coveredFit: "relaxed draped fit", accessories: "a pearl necklace", footwear: "kitten heels" }
    },
    {
      zh: "三角杯内衣 + 高腰内裤",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style triangle-cup lace set", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "cream", coveredFit: "close-fitting cut", accessories: "pearl drop earrings", footwear: "minimal flats" }
    },
    {
      zh: "细吊带背心 + 蕾丝短裤",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style camisole and brief set", coveredMaterial: "stretch microfiber", coveredOpacity: "opaque fabric", coveredColor: "cream", coveredFit: "relaxed draped fit", accessories: "a delicate anklet", footwear: "barefoot" }
    },
    {
      zh: "真丝短睡裙 + 透明大腿袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style short silk slip", coveredMaterial: "sheer silk", coveredOpacity: "highly translucent fabric", coveredColor: "white", coveredFit: "relaxed draped fit", footwear: "kitten heels", hosiery: "silicone hold-up stockings", hosieryMaterial: "silk", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "silky sheen", hosieryPattern: "plain solid knit", hosieryToe: "sheer sandal toe", hosieryTop: "lace top band", hosieryColor: "natural skin tone" }
    },
    {
      zh: "无肩带束腰 + 珍珠项链",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style strapless corset set", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "white", coveredFit: "tailored fit", accessories: "a pearl necklace", footwear: "pointed-toe pumps" }
    }
  ],
  "明艳复古": [
    {
      zh: "酒红束腰 + 黑色长袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style demi-cup corset set", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "burgundy", coveredFit: "tailored fit", accessories: "long drop earrings", footwear: "fine stiletto heels", hosiery: "garter stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "silky sheen", hosieryPattern: "back seam", hosieryToe: "shadow toe", hosieryTop: "suspender straps", hosieryColor: "black" }
    },
    {
      zh: "胸衣丁字裤 + 蕾丝手套",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style bustier and thong set", coveredMaterial: "embroidered mesh", coveredOpacity: "semi-sheer fabric", coveredColor: "black", coveredFit: "close-fitting cut", accessories: "lace gloves", footwear: "pointed-toe pumps" }
    },
    {
      zh: "高叉连体衣 + 绑带高跟",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style high-cut bodysuit", coveredMaterial: "stretch mesh", coveredOpacity: "semi-sheer fabric", coveredColor: "black", coveredFit: "close-fitting cut", accessories: "long drop earrings", footwear: "strappy heels" }
    },
    {
      zh: "黑红侧扣内衣 + 吊带袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style strappy bustier and side-clasp brief set", coveredMaterial: "stretch mesh", coveredOpacity: "semi-sheer fabric", coveredColor: "black and burgundy color blocking", coveredFit: "tailored fit", accessories: "layered bracelets", footwear: "fine stiletto heels", hosiery: "garter stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "high-gloss finish", hosieryPattern: "back seam", hosieryToe: "shadow toe", hosieryTop: "suspender straps", hosieryColor: "black" }
    },
    {
      zh: "镂空连体衣 + 珍珠长耳坠",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style cutout bodysuit", coveredMaterial: "stretch mesh", coveredOpacity: "highly translucent fabric", coveredColor: "black", coveredFit: "close-fitting cut", accessories: "long drop earrings", footwear: "pointed-toe pumps" }
    }
  ],
  "当代东方": [
    {
      zh: "薄纱新中式外袍 + 抹胸",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "new-Chinese sheer open-front robe with innerwear", coveredMaterial: "tulle", coveredOpacity: "semi-sheer fabric", coveredColor: "cream", coveredFit: "relaxed draped fit", accessories: "long drop earrings", footwear: "low-heeled embroidered shoes" }
    },
    {
      zh: "旗袍式真丝内衣 + 纱袍",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "qipao-inspired silk underwear with a sheer outer robe", coveredMaterial: "sheer silk", coveredOpacity: "highly translucent fabric", coveredColor: "burgundy", coveredFit: "close-fitting cut", accessories: "pearl drop earrings", footwear: "kitten heels" }
    },
    {
      zh: "齐胸薄纱内搭 + 披帛",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "semi-sheer chest-high inner layer with a flowing shawl", coveredMaterial: "tulle", coveredOpacity: "semi-sheer fabric", coveredColor: "cream", coveredFit: "relaxed draped fit", accessories: "a silk scarf", footwear: "barefoot" }
    },
    {
      zh: "明制外衫 + 薄纱抹胸",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "Ming-inspired outer robe over a sheer wrapped chest layer", coveredMaterial: "tulle", coveredOpacity: "semi-sheer fabric", coveredColor: "navy blue", coveredFit: "relaxed draped fit", accessories: "a pearl necklace", footwear: "low-heeled embroidered shoes" }
    },
    {
      zh: "古风纱袍 + 透明长袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "semi-sheer historical Chinese outer robe with a wrapped chest layer", coveredMaterial: "tulle", coveredOpacity: "semi-sheer fabric", coveredColor: "cream", coveredFit: "relaxed draped fit", footwear: "kitten heels", hosiery: "silicone hold-up stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "soft natural sheen", hosieryPattern: "plain solid knit", hosieryToe: "sheer sandal toe", hosieryTop: "lace top band", hosieryColor: "natural skin tone" }
    }
  ],
  "传统古典": [
    {
      zh: "古风薄纱外袍 + 抹胸",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "semi-sheer historical Chinese outer robe with a wrapped chest layer", coveredMaterial: "tulle", coveredOpacity: "semi-sheer fabric", coveredColor: "cream", coveredFit: "relaxed draped fit", accessories: "a silk scarf", footwear: "low-heeled embroidered shoes" }
    },
    {
      zh: "明制外衫 + 薄纱抹胸",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "Ming-inspired outer robe over a sheer wrapped chest layer", coveredMaterial: "tulle", coveredOpacity: "semi-sheer fabric", coveredColor: "navy blue", coveredFit: "relaxed draped fit", accessories: "long drop earrings", footwear: "classical cloth shoes" }
    },
    {
      zh: "齐胸薄纱内搭 + 披帛",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "semi-sheer chest-high inner layer with a flowing shawl", coveredMaterial: "tulle", coveredOpacity: "semi-sheer fabric", coveredColor: "white", coveredFit: "relaxed draped fit", accessories: "a delicate anklet", footwear: "barefoot" }
    },
    {
      zh: "旗袍式内衣 + 古风纱袍",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "qipao-inspired silk underwear with a sheer outer robe", coveredMaterial: "sheer silk", coveredOpacity: "highly translucent fabric", coveredColor: "burgundy", coveredFit: "close-fitting cut", accessories: "pearl drop earrings", footwear: "low-heeled embroidered shoes" }
    },
    {
      zh: "新中式纱袍 + 吊带袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "new-Chinese sheer open-front robe with innerwear", coveredMaterial: "tulle", coveredOpacity: "semi-sheer fabric", coveredColor: "black", coveredFit: "relaxed draped fit", accessories: "long drop earrings", footwear: "ankle stiletto boots", hosiery: "garter stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "silky sheen", hosieryPattern: "lace weave", hosieryToe: "sheer sandal toe", hosieryTop: "suspender straps", hosieryColor: "black" }
    }
  ],
  "甜美洋装": [
    {
      zh: "蕾丝睡袍 + 蕾丝内裤",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style lace robe set", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "white", coveredFit: "relaxed draped fit", accessories: "hair ribbon", footwear: "barefoot" }
    },
    {
      zh: "缎面睡袍 + 三角杯内衣",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style satin robe set", coveredMaterial: "lustrous satin", coveredOpacity: "opaque fabric", coveredColor: "cream", coveredFit: "relaxed draped fit", accessories: "pearl drop earrings", footwear: "Mary Jane heels" }
    },
    {
      zh: "绑带比基尼内衣 + 薄纱外搭",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style strappy bikini-inspired set", coveredMaterial: "stretch mesh", coveredOpacity: "semi-sheer fabric", coveredColor: "white", coveredFit: "close-fitting cut", accessories: "hair ribbon", footwear: "strappy heeled sandals" }
    },
    {
      zh: "薄纱睡裙 + 大腿袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style sheer babydoll", coveredMaterial: "fine mesh", coveredOpacity: "highly translucent fabric", coveredColor: "white", coveredFit: "relaxed draped fit", accessories: "a silk scarf", footwear: "Mary Jane heels", hosiery: "silicone hold-up stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "soft natural sheen", hosieryPattern: "polka-dot pattern", hosieryToe: "sheer sandal toe", hosieryTop: "lace top band", hosieryColor: "white" }
    },
    {
      zh: "高叉连体衣 + 玛丽珍高跟",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style high-cut bodysuit", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "white", coveredFit: "close-fitting cut", accessories: "hair ribbon", footwear: "Mary Jane heels" }
    }
  ],
  "国际风格": [
    {
      zh: "黑色蕾丝连体衣 + 透明长袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style lace bodysuit", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "black", coveredFit: "close-fitting cut", footwear: "pointed-toe pumps", hosiery: "silicone hold-up stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "silky sheen", hosieryPattern: "plain solid knit", hosieryToe: "sheer sandal toe", hosieryTop: "lace top band", hosieryColor: "black" }
    },
    {
      zh: "半罩杯束腰 + 吊带袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style demi-cup corset set", coveredMaterial: "stretch lace", coveredOpacity: "semi-sheer fabric", coveredColor: "black", coveredFit: "tailored fit", accessories: "long drop earrings", footwear: "fine stiletto heels", hosiery: "garter stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "high-gloss finish", hosieryPattern: "back seam", hosieryToe: "shadow toe", hosieryTop: "suspender straps", hosieryColor: "black" }
    },
    {
      zh: "缎面睡袍 + 蕾丝内裤",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style satin robe set", coveredMaterial: "lustrous satin", coveredOpacity: "opaque fabric", coveredColor: "champagne", coveredFit: "relaxed draped fit", accessories: "a pearl necklace", footwear: "kitten heels" }
    },
    {
      zh: "高叉连体衣 + 蕾丝长袜",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style high-cut bodysuit", coveredMaterial: "embroidered mesh", coveredOpacity: "semi-sheer fabric", coveredColor: "silver", coveredFit: "close-fitting cut", accessories: "long drop earrings", footwear: "strappy heels", hosiery: "silicone hold-up stockings", hosieryMaterial: "ultra-fine nylon", hosieryOpacity: "ultra-sheer 5–15 denier hosiery", hosieryFinish: "pearlescent shimmer", hosieryPattern: "lace weave", hosieryToe: "sheer sandal toe", hosieryTop: "lace top band", hosieryColor: "silver gray" }
    },
    {
      zh: "前拉链连体衣 + 长手套",
      fields: { halfNudeStyle: "bare shoulders and neckline with the main body covered", coveredGarment: "lingerie-style front-zip bodysuit", coveredMaterial: "patent-leather finish", coveredOpacity: "opaque fabric", coveredColor: "black", coveredFit: "close-fitting cut", accessories: "lace gloves", footwear: "pointed stiletto boots" }
    }
  ]
};
const STYLE_LOOK_LIBRARY_OVERRIDES = {
  "jiangnan-grace": "传统古典",
  "republic-lady": "当代东方"
};
const STYLE_LOOK_ACCENTS = {
  "clean-neighbor": { color: "cream", material: "stretch lace" },
  "sweet-energetic": { color: "white", material: "stretch mesh" },
  "playful-spirit": { color: "gold", material: "embroidered mesh" },
  "fresh-sweet": { color: "skin tone", material: "stretch mesh" },
  "cool-urban": { color: "gray", material: "stretch mesh" },
  "korean-clear": { color: "champagne", material: "embroidered mesh" },
  "athletic-spirit": { color: "navy blue", material: "stretch mesh" },
  "gentle-intellectual": { color: "champagne", material: "stretch lace" },
  "jiangnan-grace": { color: "cream", material: "embroidered mesh" },
  "urban-mature": { color: "black", material: "stretch mesh" },
  "bright-presence": { color: "burgundy", material: "stretch lace" },
  "hong-kong-retro": { color: "black and burgundy color blocking", material: "stretch mesh" },
  "republic-lady": { color: "navy blue", material: "embroidered mesh" },
  "film-retro": { color: "gray", material: "stretch lace" },
  "american-retro": { color: "burgundy", material: "stretch mesh" },
  "hong-kong-heiress": { color: "gold", material: "embroidered mesh" },
  "new-chinese-modern": { color: "burgundy", material: "embroidered mesh" },
  "tang-classical": { color: "gold", material: "embroidered mesh" },
  "song-refined": { color: "cream", material: "stretch lace" },
  "xianxia-ethereal": { color: "white", material: "stretch mesh" },
  "sweet-lolita-look": { color: "white", material: "stretch lace" },
  "sweet-heart-dress": { color: "white", material: "embroidered mesh" },
  "retro-sweetheart": { color: "champagne", material: "stretch lace" },
  "french-chic": { color: "black", material: "stretch lace" },
  "parisian-minimal": { color: "cream", material: "stretch mesh" },
  "old-money": { color: "navy blue", material: "embroidered mesh" },
  "hollywood-glamour": { color: "gold", material: "stretch lace" },
  "italian-glamour": { color: "burgundy", material: "embroidered mesh" },
  "scandinavian-minimal": { color: "gray", material: "stretch mesh" },
  "y2k-fashion": { color: "silver", material: "stretch mesh" },
  "gothic-romantic": { color: "black", material: "stretch lace" },
  "thai-mixed": { color: "gold", material: "stretch mesh" },
  "literary-rain": { color: "navy blue", material: "stretch lace" }
};
const STYLE_HOSIERY_COLORS = {
  "cream": "ivory",
  "white": "white",
  "gray": "gray",
  "navy blue": "navy blue",
  "burgundy": "burgundy",
  "silver": "silver gray",
  "gold": "champagne gold",
  "skin tone": "natural skin tone",
  "purple": "purple",
  "champagne": "champagne gold",
  "black and burgundy color blocking": "burgundy",
  "black": "black"
};
const STYLE_LOOKS = {};
for (const [styleKey, style] of Object.entries(STYLE_PRESETS)) {
  const normalFields = {
    outfit: style.fields.outfit,
    fabric: style.fields.fabric,
    outfitColor: style.fields.outfitColor,
    fit: style.fields.fit,
    accessories: style.fields.accessories,
    footwear: style.fields.footwear
  };
  STYLE_LOOKS[`${styleKey}-everyday`] = {
    key: `${styleKey}-everyday`,
    styleKey,
    zh: "日常搭配",
    outfitMode: "normal outfit",
    fields: normalFields
  };
  STYLE_LOOKS[`${styleKey}-sheer`] = {
    key: `${styleKey}-sheer`,
    styleKey,
    zh: "透视搭配",
    outfitMode: "sheer layered outfit",
    adultOnly: true,
    intensity: "adult",
    fields: {
      ...normalFields,
      fabric: "semi-sheer chiffon",
      sheerMaterial: "fine mesh",
      sheerLevel: "semi-transparent fabric",
      accessories: style.fields.accessories,
      footwear: style.fields.footwear
    }
  };
  const lookGroup = STYLE_LOOK_LIBRARY_OVERRIDES[styleKey] || style.group;
  const halfLooks = HALF_NUDE_LOOK_LIBRARY[lookGroup] || HALF_NUDE_LOOK_LIBRARY["国际风格"];
  halfLooks.forEach((variant, index) => {
    const key = index === 0
      ? `${styleKey}-private`
      : index === 1
        ? `${styleKey}-half`
        : `${styleKey}-half-${index + 1}`;
    const lookFields = { ...variant.fields };
    const accent = STYLE_LOOK_ACCENTS[styleKey];
    if (accent) {
      lookFields.coveredColor = accent.color;
      lookFields.coveredMaterial = accent.material;
      if (lookFields.hosieryColor) {
        lookFields.hosieryColor = STYLE_HOSIERY_COLORS[accent.color] || lookFields.hosieryColor;
      }
    }
    STYLE_LOOKS[key] = {
      key,
      styleKey,
      zh: variant.zh,
      outfitMode: "half-nude styling",
      adultOnly: true,
      intensity: index === 0 ? "boudoir" : "revealing",
      fields: lookFields
    };
  });
  STYLE_LOOKS[`${styleKey}-nude`] = {
    key: `${styleKey}-nude`,
    styleKey,
    zh: "全裸",
    outfitMode: "fully nude",
    adultOnly: true,
    intensity: "revealing",
    fields: {}
  };
}

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
      pose: "caught mid-turn in an adult presentation",
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
      lighting: "soft side backlight",
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

const LORA_CATALOG = [
  {
    id: "builtin-moss-xvstyle",
    catalogId: "builtin-moss-xvstyle",
    name: "MOSS xvstyle 风格 LoRA",
    file: "MOSS-Image-NSFW-Uncensored-LoRA-ComfyUI.safetensors",
    models: ["moss"],
    trigger: "moss_xvstyle",
    insert: "moss_xvstyle",
    weight: 0.8,
    enabled: false,
    note: "元数据作者推荐强度 0.7 / 0.8 / 0.9。"
  },
  {
    id: "builtin-h3-motion",
    catalogId: "builtin-h3-motion",
    name: "MiniMax H3 运动 LoRA",
    file: "MiniMaxH3-NSFW-AIO-V2.5.safetensors",
    models: ["h3_t2v", "h3_i2v", "h3_fast"],
    trigger: "hmmotion",
    insert: "hmmotion",
    weight: 0.7,
    enabled: false,
    note: "用于强化动作响应；与长段落连续动作提示词配合。"
  },
  {
    id: "builtin-h3-aio-v2",
    catalogId: "builtin-h3-aio-v2",
    name: "MiniMax H3 综合增强 V2",
    file: "MiniMaxH3-NSFW-AIO-V2.safetensors",
    models: ["h3_t2v", "h3_i2v", "h3_fast"],
    trigger: "",
    insert: "natural anatomy, coherent identity, realistic skin texture",
    weight: 0.6,
    enabled: false,
    note: "未发现可靠触发词；启用时只追加一致性描述。"
  },
  {
    id: "builtin-h3-aio-v25",
    catalogId: "builtin-h3-aio-v25",
    name: "MiniMax H3 综合增强 V2.5",
    file: "MiniMaxH3-NSFW-AIO-V2.5.safetensors",
    models: ["h3_t2v", "h3_i2v", "h3_fast"],
    trigger: "",
    insert: "stable facial identity, realistic anatomy, continuous motion",
    weight: 0.6,
    enabled: false,
    note: "未发现可靠触发词；建议以较低权重测试。"
  },
  {
    id: "builtin-h3-realism",
    catalogId: "builtin-h3-realism",
    name: "MiniMax H3 真人质感增强",
    file: "MiniMaxH3-realism-people.safetensors",
    models: ["h3_t2v", "h3_i2v", "h3_fast"],
    trigger: "",
    insert: "photorealistic people, natural facial proportions, realistic skin",
    weight: 0.6,
    enabled: false,
    note: "未发现可靠触发词；用于写实人物画面描述。"
  },
  {
    id: "builtin-h3-turbo",
    catalogId: "builtin-h3-turbo",
    name: "MiniMax H3 turbo 4 步",
    file: "MiniMaxH3-turbo-4step-pruned.safetensors",
    models: ["h3_fast"],
    trigger: "",
    insert: "",
    weight: 1,
    enabled: false,
    note: "工作流加速 LoRA，不写入提示词；使用 H3 turbo 模型选项。"
  },
  {
    id: "builtin-wan-nsfw-high",
    catalogId: "builtin-wan-nsfw-high",
    name: "Wan 2.2 视频增强 High",
    file: "NSFW-22-H-e8.safetensors",
    models: ["wan_i2v_a14b", "wan_i2v_fast"],
    trigger: "",
    insert: "coherent motion, realistic anatomy, consistent lighting",
    weight: 0.5,
    enabled: false,
    note: "无可靠触发词；作为高质量增强，建议 low/high 配对使用。"
  },
  {
    id: "builtin-wan-nsfw-low",
    catalogId: "builtin-wan-nsfw-low",
    name: "Wan 2.2 视频增强 Low",
    file: "NSFW-22-L-e8.safetensors",
    models: ["wan_i2v_a14b", "wan_i2v_fast"],
    trigger: "",
    insert: "stable identity, natural secondary motion, realistic textures",
    weight: 0.5,
    enabled: false,
    note: "无可靠触发词；与 High 增强配对使用。"
  },
  {
    id: "builtin-wan-dr34-high",
    catalogId: "builtin-wan-dr34-high",
    name: "Wan I2V DR34ML4Y High",
    file: "Wan2.2-NSFW/DR34ML4Y_I2V_14B_HIGH_V2.safetensors",
    models: ["wan_i2v_a14b", "wan_i2v_fast"],
    trigger: "",
    insert: "natural human anatomy, coherent motion, realistic skin",
    weight: 0.5,
    enabled: false,
    note: "无可靠触发词；保持首帧人物一致性。"
  },
  {
    id: "builtin-wan-dr34-low",
    catalogId: "builtin-wan-dr34-low",
    name: "Wan I2V DR34ML4Y Low",
    file: "Wan2.2-NSFW/DR34ML4Y_I2V_14B_LOW_V2.safetensors",
    models: ["wan_i2v_a14b", "wan_i2v_fast"],
    trigger: "",
    insert: "stable composition, realistic physics, detailed texture",
    weight: 0.5,
    enabled: false,
    note: "无可靠触发词；与 High LoRA 配对使用。"
  },
  {
    id: "builtin-wan-ti2v-5b",
    catalogId: "builtin-wan-ti2v-5b",
    name: "Wan TI2V-5B 人物增强",
    file: "Wan2.2-NSFW/DR34ML4Y_TI2V_5B_V1.safetensors",
    models: ["wan_ti2v_5b"],
    trigger: "",
    insert: "natural anatomy, coherent motion, realistic fabric folds",
    weight: 0.5,
    enabled: false,
    note: "无可靠触发词；用于 5B 文生或图生视频。"
  },
  {
    id: "builtin-wan-speed-high",
    catalogId: "builtin-wan-speed-high",
    name: "Wan lightx2v High 4 步",
    file: "wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors",
    models: ["wan_i2v_fast"],
    trigger: "",
    insert: "",
    weight: 1,
    enabled: false,
    note: "工作流加速 LoRA，不写入提示词；使用 Wan 4 步加速模型选项。"
  },
  {
    id: "builtin-wan-speed-low",
    catalogId: "builtin-wan-speed-low",
    name: "Wan lightx2v Low 4 步",
    file: "wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors",
    models: ["wan_i2v_fast"],
    trigger: "",
    insert: "",
    weight: 1,
    enabled: false,
    note: "工作流加速 LoRA，不写入提示词；与 High 加速 LoRA 配对。"
  },
  {
    id: "builtin-zimage-master",
    catalogId: "builtin-zimage-master",
    name: "Z-Image 主增强 LoRA",
    file: "ZImage-NSFW/NSFW-Master-ZIT.safetensors",
    models: ["zimage_turbo", "zimage_int8"],
    trigger: "",
    insert: "natural anatomy, detailed skin texture, coherent composition",
    weight: 0.7,
    enabled: false,
    note: "未发现可靠触发词；启用时追加质量与一致性描述。"
  },
  {
    id: "builtin-zimage-lingerie",
    catalogId: "builtin-zimage-lingerie",
    name: "Z-Image 内衣风格",
    file: "ZImage-NSFW/actions/lora-lingerie.safetensors",
    models: ["zimage_turbo", "zimage_int8"],
    trigger: "qqny",
    insert: "qqny",
    weight: 0.7,
    enabled: false,
    note: "训练标签对应内衣风格；仅用于成年人内容。"
  },
  {
    id: "builtin-zimage-tattoo",
    catalogId: "builtin-zimage-tattoo",
    name: "Z-Image 纹身细节",
    file: "ZImage-NSFW/actions/lora-tattoo.safetensors",
    models: ["zimage_turbo", "zimage_int8"],
    trigger: "tattoo",
    insert: "tattoo",
    weight: 0.7,
    enabled: false,
    note: "训练标签为 tattoo。"
  },
  {
    id: "builtin-zimage-oiled",
    catalogId: "builtin-zimage-oiled",
    name: "Z-Image 油润皮肤质感",
    file: "ZImage-NSFW/actions/lora-oiled-skin.safetensors",
    models: ["zimage_turbo", "zimage_int8"],
    trigger: "",
    insert: "subtle glossy skin highlights, realistic skin texture",
    weight: 0.6,
    enabled: false,
    note: "无可靠触发词；启用时只追加皮肤质感描述。"
  },
  {
    id: "builtin-zimage-panty",
    catalogId: "builtin-zimage-panty",
    name: "Z-Image 袜类与内搭",
    file: "ZImage-NSFW/actions/lora-panty.safetensors",
    models: ["zimage_turbo", "zimage_int8"],
    trigger: "",
    insert: "detailed legwear, natural fabric folds",
    weight: 0.6,
    enabled: false,
    note: "无可靠触发词；仅追加袜类材质描述。"
  },
  {
    id: "builtin-zimage-foot",
    catalogId: "builtin-zimage-foot",
    name: "Z-Image 足部细节",
    file: "ZImage-NSFW/actions/lora-foot.safetensors",
    models: ["zimage_turbo", "zimage_int8"],
    trigger: "",
    insert: "detailed hands and feet, natural anatomy",
    weight: 0.5,
    enabled: false,
    note: "无可靠触发词；启用时追加手足解剖描述。"
  },
  {
    id: "builtin-zimage-footing",
    catalogId: "builtin-zimage-footing",
    name: "Z-Image 足部表现",
    file: "ZImage-NSFW/actions/lora-footing.safetensors",
    models: ["zimage_turbo", "zimage_int8"],
    trigger: "",
    insert: "natural foot posture, detailed anatomy",
    weight: 0.5,
    enabled: false,
    note: "无可靠触发词；建议低权重测试。"
  }
];

  O.audienceOrientation = [
    pair("不指定", ""),
    pair("女性向", "a female-gaze composition with emphasis on emotion, styling, and relational tension"),
    pair("男性向", "a male-gaze composition with emphasis on visual presence, body lines, and camera-facing posture"),
    pair("中性视角", "a balanced neutral-gaze composition")
  ];
  O.relationshipType = [
    pair("不指定", ""),
    pair("单人女性", "single adult woman", { subjectType: "person", gender: "adult woman", relationshipKey: "singleFemale" }),
    pair("单人男性", "single adult man", { subjectType: "person", gender: "adult man", relationshipKey: "singleMale" }),
    pair("男女情侣", "adult woman and adult man", { subjectType: "couple", gender: "an adult woman and an adult man", relationshipKey: "mf" }),
    pair("男男情侣", "two adult men", { subjectType: "couple", gender: "two adult men", relationshipKey: "mm" }),
    pair("女女情侣", "two adult women", { subjectType: "couple", gender: "two adult women", relationshipKey: "ff" }),
    pair("两名成年搭档", "two adult partners", { subjectType: "couple", gender: "two adult characters with varied gender presentation", relationshipKey: "pair" }),
    pair("两男一女", "two adult men and one adult woman", { subjectType: "group", gender: "one adult woman and two adult men", relationshipKey: "mmf" }),
    pair("两女一男", "two adult women and one adult man", { subjectType: "group", gender: "two adult women and one adult man", relationshipKey: "ffm" }),
    pair("多男群像", "three adult men", { subjectType: "group", gender: "three adult men", relationshipKey: "multiMale" }),
    pair("多女群像", "three adult women", { subjectType: "group", gender: "three adult women", relationshipKey: "multiFemale" }),
    pair("三位成年朋友", "three adult friends", { subjectType: "group", gender: "three adult characters with varied gender presentation", relationshipKey: "friends" }),
    pair("混合群像", "three consenting adult characters with varied gender presentation", { subjectType: "group", gender: "three adult characters with varied gender presentation", relationshipKey: "mixed" })
  ];
  O.relationshipDynamic = [
    pair("不指定", ""),
    pair("平等关系", "between equal adult partners", { people: 2 }),
    pair("温柔亲密", "with quiet romantic closeness", { people: 2 }),
    pair("互相试探", "with tentative mutual closeness", { people: 2 }),
    pair("主动与回应", "with one adult partner leading and the other responding", { people: 2 }),
    pair("克制张力", "with restrained intimate tension", { people: 2 }),
    pair("保护感", "with a caring, protective closeness", { people: 2 }),
    pair("竞争感", "with a subtle competitive tension", { people: 2 })
  ];
  O.gender.push(
    pair("混合三人角色", "three adult characters with varied gender presentation", { people: 3 })
  );

  O.action.push(
    pair("男同 · 额头相抵对视", "two adult men standing forehead to forehead", { people: 2, relationships: ["mm"] }),
    pair("男同 · 背后环抱", "one adult man embracing the other from behind", { people: 2, relationships: ["mm"] }),
    pair("男同 · 面对面跪坐", "two adult men kneeling face to face", { people: 2, relationships: ["mm"] }),
    pair("男同 · 一人俯身靠近", "one adult man leaning slightly toward the other", { people: 2, relationships: ["mm"] }),
    pair("男同 · 并肩倾靠", "two adult men sitting shoulder to shoulder and leaning together", { people: 2, relationships: ["mm"] }),
    pair("男同 · 双手交扣", "two adult men holding hands with fingers interlaced", { people: 2, relationships: ["mm"] }),
    pair("男同 · 轻扶脸颊", "one adult man gently cupping the other's face", { people: 2, relationships: ["mm"] }),
    pair("男同 · 缓慢共舞", "two adult men in a close slow dance", { people: 2, relationships: ["mm"] }),
    pair("女同 · 双手捧脸", "one adult woman gently holding the other's face", { people: 2, relationships: ["ff"] }),
    pair("女同 · 背后环抱", "one adult woman embracing the other from behind", { people: 2, relationships: ["ff"] }),
    pair("女同 · 额头相抵", "two adult women standing with foreheads gently touching", { people: 2, relationships: ["ff"] }),
    pair("女同 · 面对面侧卧", "two adult women lying on their sides facing each other", { people: 2, relationships: ["ff"] }),
    pair("女同 · 靠肩依偎", "one adult woman resting her head on the other's shoulder", { people: 2, relationships: ["ff"] }),
    pair("女同 · 十指相扣", "two adult women with fingers interlaced", { people: 2, relationships: ["ff"] }),
    pair("女同 · 镜前前后相依", "two adult women standing close in front of a mirror", { people: 2, relationships: ["ff"] }),
    pair("女同 · 缓慢共舞", "two adult women in a close slow dance", { people: 2, relationships: ["ff"] })
  );

  O.halfNudeStyle.unshift(
    pair("情趣内衣覆盖", "lingerie-style coverage", { adultOnly: true, zone: "lingerie" })
  );
  O.coveredGarment.unshift(pair("不指定", "", { adultOnly: true }));
  const lingerieZones = ["lingerie", "upper", "lower", "torso", "back", "shoulder", "waist", "leg", "cutout", "one_side"];
  const lingerieOpacities = ["opaque fabric", "semi-sheer fabric", "highly translucent fabric"];
  O.coveredGarment.push(
    pair("情趣内衣 · 蕾丝吊带套装", "lingerie-style lace strap set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 三角杯蕾丝套装", "lingerie-style triangle-cup lace set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 连体蕾丝内衣", "lingerie-style lace bodysuit", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 网纱连体衣", "lingerie-style sheer mesh bodysuit", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 镂空连体衣", "lingerie-style cutout bodysuit", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 开裆连体衣", "lingerie-style open-gusset bodysuit", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 开裆连裤内衣", "lingerie-style open-gusset tights set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 开裆束腰套装", "lingerie-style open-gusset corset set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 束腰胸衣套装", "lingerie-style corset and brief set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 绑带束腰套装", "lingerie-style lace-up corset set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 吊带袜套装", "lingerie-style garter and stocking set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 吊带睡裙", "lingerie-style slip dress", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 薄纱睡裙", "lingerie-style sheer babydoll", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 丝质短睡裙", "lingerie-style short silk slip", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 蕾丝睡袍套装", "lingerie-style lace robe set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 缎面睡袍套装", "lingerie-style satin robe set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 绑带比基尼式套装", "lingerie-style strappy bikini-inspired set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 高叉连体衣", "lingerie-style high-cut bodysuit", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 半罩杯束腰套装", "lingerie-style demi-cup corset set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 无肩带束腰套装", "lingerie-style strapless corset set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 细吊带背心套装", "lingerie-style camisole and brief set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 露背连体衣", "lingerie-style open-back bodysuit", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 开襟睡袍与内搭套装", "lingerie-style open robe with inner set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 挂脖连体衣", "lingerie-style halter bodysuit", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 胸衣与丁字裤套装", "lingerie-style bustier and thong set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 绑带胸衣与侧扣内裤套装", "lingerie-style strappy bustier and side-clasp brief set", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities }),
    pair("情趣内衣 · 前拉链连体衣", "lingerie-style front-zip bodysuit", { group: "情趣内衣", adultOnly: true, zones: lingerieZones, opacities: lingerieOpacities })
  );
  for (const item of O.coveredGarment) {
    if (item.group !== "情趣内衣" || item.structure) continue;
    const text = `${item.zh} ${item.en}`.toLowerCase();
    item.structure = /开裆|open-gusset/.test(text)
      ? "openGusset"
      : /吊带袜套装|garter and stocking/.test(text)
        ? "garter"
        : /连体|bodysuit/.test(text)
          ? "onePiece"
          : /束腰|胸衣|corset|bustier/.test(text)
            ? "corset"
            : /睡袍|robe/.test(text)
              ? "robe"
              : "twoPiece";
    item.styleGroup = item.structure === "openGusset"
      ? "特殊结构"
      : item.structure === "garter"
        ? "吊带袜套装"
        : item.structure === "onePiece"
          ? "连体衣"
          : item.structure === "corset"
            ? "束腰胸衣"
            : item.structure === "robe"
              ? "睡袍套装"
              : "内衣套装";
  }
  O.coveredOpacity.push(
    pair("轻微透视", "subtle see-through finish", { adultOnly: true }),
    pair("局部镂空透视", "selective cutout transparency", { adultOnly: true }),
    pair("湿感贴肤透视", "wet-look clingy translucency", { adultOnly: true })
  );
  O.coveredMaterial.push(
    pair("弹力蕾丝", "stretch lace", { adultOnly: true, opacities: lingerieOpacities }),
    pair("刺绣网纱", "embroidered mesh", { adultOnly: true, opacities: lingerieOpacities }),
    pair("弹力网纱", "stretch mesh", { adultOnly: true, opacities: lingerieOpacities }),
    pair("丝光缎面", "lustrous satin", { adultOnly: true, opacities: ["opaque fabric", "semi-sheer fabric"] }),
    pair("微纤维弹力布", "stretch microfiber", { adultOnly: true, opacities: ["opaque fabric"] }),
    pair("漆皮质感", "patent-leather finish", { adultOnly: true, opacities: ["opaque fabric"] })
  );
  O.coveredColor.push(
    pair("肤色", "skin tone", { adultOnly: true }),
    pair("紫色", "purple", { adultOnly: true }),
    pair("香槟色", "champagne", { adultOnly: true }),
    pair("黑色与酒红撞色", "black and burgundy color blocking", { adultOnly: true })
  );

  O.hosieryOpacity = [
    pair("不指定", ""),
    pair("超薄透肤 5–15D", "ultra-sheer 5–15 denier hosiery"),
    pair("半透明 20–30D", "semi-sheer 20–30 denier hosiery"),
    pair("半不透 40–50D", "semi-opaque 40–50 denier hosiery"),
    pair("完全不透 60–100D", "fully opaque 60–100 denier tights"),
    pair("极厚不透 100D 以上", "heavy opaque tights above 100 denier")
  ];
  O.hosieryFinish = [
    pair("不指定", ""),
    pair("哑光", "matte finish"),
    pair("自然微光", "soft natural sheen"),
    pair("丝光", "silky sheen"),
    pair("缎面光", "satin sheen"),
    pair("高光", "high-gloss finish"),
    pair("湿感亮面", "wet-look glossy finish"),
    pair("珠光", "pearlescent shimmer")
  ];
  O.hosieryPattern = [
    pair("不指定", ""),
    pair("纯色无纹", "plain solid knit"),
    pair("细竖纹", "fine vertical rib"),
    pair("罗纹", "ribbed texture"),
    pair("麻花针织", "cable-knit texture"),
    pair("菱形格纹", "diamond lattice pattern"),
    pair("波点", "polka-dot pattern"),
    pair("花卉纹样", "floral pattern"),
    pair("蕾丝花卉", "floral lace pattern"),
    pair("几何纹样", "geometric pattern"),
    pair("细渔网", "fine fishnet"),
    pair("菱形渔网", "diamond fishnet"),
    pair("大网眼", "fence-net pattern"),
    pair("蕾丝织纹", "lace weave"),
    pair("蛇纹", "snakeskin pattern"),
    pair("豹纹", "leopard pattern"),
    pair("侧边条纹", "side-stripe pattern"),
    pair("交叉绑带纹", "criss-cross strap pattern"),
    pair("渐变色调", "gradient tone"),
    pair("后缝线", "back seam"),
    pair("闪光星点", "subtle sparkling points")
  ];
  O.hosieryToe = [
    pair("不指定", ""),
    pair("透明脚尖", "sheer sandal toe"),
    pair("加固脚尖", "reinforced toe"),
    pair("阴影脚尖", "shadow toe"),
    pair("露趾设计", "open-toe design")
  ];
  O.hosieryTop = [
    pair("不指定", ""),
    pair("蕾丝袜口", "lace top band"),
    pair("硅胶防滑袜口", "silicone stay-up band"),
    pair("双层宽袜口", "double-layer wide welt"),
    pair("高腰袜腰", "high-waisted top"),
    pair("控制型腰腹", "control-top brief"),
    pair("吊带连接", "suspender straps"),
    pair("低腰腰头", "low-rise waistband"),
    pair("无痕腰头", "seamless waistband"),
    pair("开裆结构", "open gusset construction", { adultOnly: true })
  ];
  O.hosieryColor = [
    pair("不指定", ""),
    pair("自然肤色", "natural skin tone"),
    pair("浅肤色", "light skin tone"),
    pair("深肤色", "deep skin tone"),
    pair("黑色", "black"),
    pair("白色", "white"),
    pair("象牙白", "ivory"),
    pair("灰色", "gray"),
    pair("深蓝", "navy blue"),
    pair("酒红", "burgundy"),
    pair("红色", "red"),
    pair("紫色", "purple"),
    pair("墨绿", "deep green"),
    pair("香槟金", "champagne gold"),
    pair("银灰", "silver gray"),
    pair("双色渐变", "two-tone gradient"),
    pair("撞色拼接", "color-blocked")
  ];

  O.pose.push(
    pair("露点 · 仰卧完全舒展", "a fully open reclining adult pose with the body extended toward the camera", { group: "露点", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "lowerAbdomenHip", "fullBody"] }),
    pair("露点 · 侧卧抬髋展示", "a side-lying adult pose with the hips lifted and the full body line presented to the camera", { group: "露点", adultOnly: true, intensity: "revealing", focus: ["sideWaistHip", "outerThigh", "fullBody"] }),
    pair("露点 · 后仰完全敞开", "a supported reclining adult pose with the torso and hips opened toward the camera", { group: "露点", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "frontCrotch", "fullBody"] }),
    pair("露点 · 跪姿主动展示", "an upright kneeling adult pose with an openly inviting presentation toward the camera", { group: "露点", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "innerThighKnee", "fullBody"] }),
    pair("露点 · 双人贴身交叠", "two consenting adults in a close intertwined intimate pose", { group: "露点", adultOnly: true, intensity: "revealing", people: 2, focus: ["face", "chestWaist", "fullBody"] }),
    pair("露点 · 一人主导一人回应", "two consenting adults with one confidently leading and the other actively responding", { group: "露点", adultOnly: true, intensity: "revealing", people: 2, focus: ["face", "handsArms", "sideWaistHip"] }),
    pair("露点 · 面对面完全贴近", "two consenting adults in full face-to-face intimate closeness", { group: "露点", adultOnly: true, intensity: "revealing", people: 2, focus: ["face", "chestWaist", "waist"] }),
    pair("露点 · 三人环绕亲密构图", "three consenting adults in a deliberately close circular intimate composition", { group: "露点", adultOnly: true, intensity: "revealing", people: 3, focus: ["face", "chestWaist", "fullBody"] }),
    pair("露点 · 三人高低层次构图", "three consenting adults arranged in a layered intimate composition with clear foreground and background roles", { group: "露点", adultOnly: true, intensity: "revealing", people: 3, focus: ["fullBody", "sideWaistHip", "outerThigh"] })
  );

  O.action.push(
    pair("露点 · 主动缓慢展示", "slowly and confidently presenting the body with explicit adult intent", { group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 持续贴近与交缠", "sustained close adult intimacy with intertwined body language", { group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 主动引导与回应", "explicit mutual adult response with one partner guiding and the other actively responding", { group: "露点", adultOnly: true, intensity: "revealing", people: 2 }),
    pair("露点 · 双向主动亲密", "two consenting adults sharing explicit reciprocal intimacy and continuous eye contact", { group: "露点", adultOnly: true, intensity: "revealing", people: 2 }),
    pair("露点 · 多人同步回应", "three consenting adults maintaining coordinated mutual adult responsiveness", { group: "露点", adultOnly: true, intensity: "revealing", people: 3 })
  );

  O.interaction.push(
    pair("露点 · 双向主动亲密", "explicit mutual adult intimacy with active consent and reciprocal response", { adultOnly: true, intensity: "revealing", people: 2 }),
    pair("露点 · 紧密贴合互动", "close full-contact adult interaction with mutual responsiveness", { adultOnly: true, intensity: "revealing", people: 2 }),
    pair("露点 · 主导与回应", "a consenting adult lead-and-response interaction with clear mutual participation", { adultOnly: true, intensity: "revealing", people: 2 }),
    pair("露点 · 三人协调互动", "three consenting adults maintaining a coordinated close interaction", { adultOnly: true, intensity: "revealing", people: 3 })
  );

  O.intimacyLevel.push(
    pair("露点 · 高强成人亲密", "explicit high-intensity consensual adult intimacy", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 完全投入的双向回应", "fully engaged mutual adult response", { adultOnly: true, intensity: "revealing", people: 2 }),
    pair("露点 · 持续亲密张力", "sustained explicit adult intimacy and tension", { adultOnly: true, intensity: "revealing" })
  );

  O.bodyFocus.push(
    pair("露点 · 髋部与前裆明确构图", "an explicit adult composition emphasizing the hips and upper front body line", { group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 胸腰与髋部同时强调", "an explicit adult composition emphasizing the chest, waist, and hips together", { group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 全身线条完全呈现", "a fully presented adult body-line composition with explicit intent", { group: "露点", adultOnly: true, intensity: "revealing" })
  );

  O.adultLayer.push(
    pair("露点 · 明确成人构图", "an explicit consensual adult composition with clear high-intensity intent", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 全身线条与互动强化", "emphasize the adult body lines and active mutual interaction", { adultOnly: true, intensity: "revealing" })
  );

  O.expression.push(
    pair("露点 · 完全放开的成人神情", "an uninhibited adult expression with explicit intent", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 明确而主动的欲望", "an openly desiring and self-assured adult expression", { adultOnly: true, intensity: "revealing" })
  );

  O.gaze.push(
    pair("露点 · 欲望明确的直视", "an openly desiring adult gaze directed into the camera", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 持续锁定镜头", "a sustained intense adult gaze locked on the camera", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 回眸越过肩膀", "a backward glance over the shoulder toward the camera", { adultOnly: true, intensity: "revealing", group: "露点" }),
    pair("露点 · 侧脸回望镜头", "turning the head to look back at the camera over the shoulder", { adultOnly: true, intensity: "revealing", group: "露点" })
  );

  O.outfit.push(
    pair("露点 · 超薄网纱开裆连体衣", "an ultra-sheer open-gusset mesh bodysuit", { group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 高叉绑带情趣内衣", "a high-cut strappy lingerie set", { group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 开裆蕾丝束腰套装", "an open-gusset lace corset set", { group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 透明薄纱与吊带长袜", "a sheer tulle layer paired with garter stockings", { group: "露点", adultOnly: true, intensity: "revealing" })
  );

  O.coveredGarment.push(
    pair("露点 · 超薄开裆束腰套装", "an ultra-sheer open-gusset corset set", { group: "情趣内衣", styleGroup: "特殊结构", structure: "openGusset", adultOnly: true, intensity: "revealing", zones: lingerieZones, opacities: lingerieOpacities }),
    pair("露点 · 高叉绑带连体衣", "a high-cut strappy lingerie bodysuit", { group: "情趣内衣", styleGroup: "连体衣", structure: "onePiece", adultOnly: true, intensity: "revealing", zones: lingerieZones, opacities: lingerieOpacities }),
    pair("露点 · 半罩杯蕾丝束腰", "a demi-cup lace corset with open framing", { group: "情趣内衣", styleGroup: "束腰胸衣", structure: "corset", adultOnly: true, intensity: "revealing", zones: lingerieZones, opacities: lingerieOpacities }),
    pair("露点 · 透明吊带袜套装", "a sheer garter and stocking lingerie set", { group: "情趣内衣", styleGroup: "吊带袜套装", structure: "garter", adultOnly: true, intensity: "revealing", zones: lingerieZones, opacities: lingerieOpacities })
  );

  O.hosiery.push(
    pair("露点 · 超薄开裆连裤袜", "ultra-sheer crotchless pantyhose", { structure: "crotchlessTights", coverage: "crotchless", group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 开裆连体袜", "open-gusset sheer bodystocking", { structure: "bodystocking", coverage: "full", group: "露点", adultOnly: true, intensity: "revealing" }),
    pair("露点 · 蕾丝吊带长袜", "lace garter stockings with a high-contrast open frame", { structure: "garterStocking", coverage: "foot", group: "露点", adultOnly: true, intensity: "revealing" })
  );

  O.hosieryTop.push(
    pair("露点 · 开放腰胯结构", "open waist-and-hip construction", { adultOnly: true, intensity: "revealing" })
  );

  O.adultStyling.push(
    pair("露点 · 完全放开的成人造型", "uninhibited adult styling with explicit high-intensity intent", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 湿感凌乱造型", "wet-look tousled adult styling with explicit intent", { adultOnly: true, intensity: "revealing" })
  );

  O.adultCameraStyle.push(
    pair("露点 · 私密成人影像", "explicit intimate adult editorial photography", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 成人电影剧照", "high-intensity adult cinematic still", { adultOnly: true, intensity: "revealing" })
  );

  O.adultFraming.push(
    pair("露点 · 成人全身构图", "explicit adult full-body framing", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 身体线条近景", "a close adult body-line framing with explicit emphasis", { adultOnly: true, intensity: "revealing" })
  );

  O.adultAtmosphere.push(
    pair("露点 · 高强暧昧张力", "high-intensity adult erotic tension", { adultOnly: true, intensity: "revealing" }),
    pair("露点 · 私密而热烈", "private and intensely passionate adult atmosphere", { adultOnly: true, intensity: "revealing" })
  );

  O.adultRelationship.push(
    pair("露点 · 双向自愿主动", "explicitly consensual adult partners with mutual initiative", { adultOnly: true, intensity: "revealing", people: 2 }),
    pair("露点 · 完全信任的亲密", "fully trusting consensual adult intimacy", { adultOnly: true, intensity: "revealing", people: 2 })
  );

  O.outfit.push(
    pair("甜系洛丽塔洋装", "adult sweet Lolita dress with layered ruffles and a petticoat", { group: "洛丽塔与洋装", family: "lolita" }),
    pair("古典洛丽塔洋装", "adult classic Lolita dress with a structured A-line skirt", { group: "洛丽塔与洋装", family: "lolita" }),
    pair("哥特洛丽塔洋装", "adult gothic Lolita dress with lace, corset detail, and a full skirt", { group: "洛丽塔与洋装", family: "lolita" }),
    pair("田园洛丽塔洋装", "adult country Lolita dress with cotton lace and an apron accent", { group: "洛丽塔与洋装", family: "lolita" }),
    pair("朋克洛丽塔洋装", "adult punk Lolita outfit with tartan, buckles, and a layered skirt", { group: "洛丽塔与洋装", family: "lolita" }),
    pair("王子系中性洛丽塔", "adult gender-neutral ouji-style Lolita outfit", { group: "洛丽塔与洋装", family: "lolita" }),
    pair("洛丽塔背心裙两件套", "adult Lolita jumper skirt with a blouse and petticoat", { group: "洛丽塔与洋装", family: "lolita" }),
    pair("蕾丝洋装与衬裙", "adult lace gown with a layered petticoat", { group: "洛丽塔与洋装", family: "lolita" }),
    pair("成人水手风上衣与百褶裙", "adult sailor-inspired blouse with a pleated skirt", { group: "水手与制服", family: "sailor" }),
    pair("夏季短袖水手制服", "adult summer sailor uniform with short sleeves and a pleated skirt", { group: "水手与制服", family: "sailor" }),
    pair("冬季长袖水手制服", "adult winter sailor uniform with long sleeves and a pleated skirt", { group: "水手与制服", family: "sailor" }),
    pair("水手领连衣裙", "adult sailor-collar dress with a pleated skirt", { group: "水手与制服", family: "sailor" }),
    pair("哥特水手服", "adult gothic sailor-inspired outfit with a dark pleated skirt", { group: "水手与制服", family: "sailor" }),
    pair("中性水手制服", "adult gender-neutral sailor-inspired uniform", { group: "水手与制服", family: "sailor" }),
    pair("女仆风洋装", "adult maid-inspired dress with an apron and ruffled skirt", { group: "水手与制服", family: "maid" }),
    pair("露肩甜系洛丽塔", "adult off-shoulder sweet Lolita dress with layered ruffles", { group: "洛丽塔与洋装", family: "lolita", adultOnly: true, intensity: "revealing" }),
    pair("开襟哥特洛丽塔", "adult open-front gothic Lolita dress with lace corset detail", { group: "洛丽塔与洋装", family: "lolita", adultOnly: true, intensity: "revealing" }),
    pair("高开衩水手裙", "adult sailor-inspired outfit with a high-slit pleated skirt", { group: "水手与制服", family: "sailor", adultOnly: true, intensity: "revealing" }),
    pair("露肩水手服", "adult off-shoulder sailor-inspired outfit with a pleated skirt", { group: "水手与制服", family: "sailor", adultOnly: true, intensity: "revealing" }),
    pair("开背女仆风洋装", "adult open-back maid-inspired dress with an apron and layered skirt", { group: "水手与制服", family: "maid", adultOnly: true, intensity: "revealing" }),
    pair("透明罩裙洛丽塔", "adult Lolita dress with a transparent layered overskirt", { group: "洛丽塔与洋装", family: "lolita", adultOnly: true, intensity: "revealing" })
  );

  O.handPose.push(
    pair("手指捏住裙摆", "fingers holding the edge of the skirt hem", { adultOnly: true, intensity: "revealing" }),
    pair("双手提起裙摆", "both hands lifting the skirt hem", { adultOnly: true, intensity: "revealing" }),
    pair("手指捏住衣襟", "fingers holding the edge of the open garment", { adultOnly: true, intensity: "revealing" }),
    pair("手轻放锁骨", "one hand resting near the collarbone", { adultOnly: true, intensity: "revealing" }),
    pair("单手支撑身体", "one hand supporting the body", { adultOnly: true, intensity: "revealing" })
  );

  O.revealMode = [
    pair("不指定", ""),
    pair("裙摆展示", "skirt presentation", { mode: "skirt", adultOnly: true, intensity: "revealing" }),
    pair("内搭展示", "innerwear presentation", { mode: "skirt", adultOnly: true, intensity: "revealing" }),
    pair("服装敞开", "open-garment presentation", { mode: "opening", adultOnly: true, intensity: "revealing" }),
    pair("身体线条", "body-line presentation", { mode: "body", adultOnly: true, intensity: "revealing" }),
    pair("成人亲密互动", "explicit adult intimacy", { mode: "intimacy", adultOnly: true, intensity: "revealing", people: 2 })
  ];

  O.revealAction = [
    pair("不指定", ""),
    pair("单手提裙摆", "lifting one side of the skirt hem", { modes: ["skirt"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "fingers holding the edge of the skirt hem", bodyOrientation: "three-quarter view from the front left", bodyFocus: "an explicit adult composition emphasizing the hips and upper front body line", shotSize: "full-body shot" }),
    pair("双手提起裙摆", "lifting the front of the skirt with both hands", { modes: ["skirt"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "both hands lifting the skirt hem", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit adult composition emphasizing the hips and upper front body line", shotSize: "full-body shot" }),
    pair("侧身提起裙摆", "lifting the skirt hem while turning the body slightly to the side", { modes: ["skirt"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "fingers holding the edge of the skirt hem", bodyOrientation: "three-quarter view from the front right", bodyFocus: "an explicit adult composition emphasizing the hips and upper front body line", shotSize: "cowboy shot" }),
    pair("连同衬裙一起提起", "lifting both the outer skirt and petticoat to reveal the inner layer", { modes: ["skirt"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "both hands lifting the skirt hem", bodyOrientation: "facing the camera directly", bodyFocus: "the upper front crotch and pussy mound clearly visible", shotSize: "full-body shot" }),
    pair("外层裙摆自然滑落", "letting the outer skirt slip aside to reveal the inner layer", { modes: ["skirt"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "fingers holding the edge of the skirt hem", bodyOrientation: "three-quarter view from the front left", bodyFocus: "the upper front crotch and pussy mound clearly visible", shotSize: "cowboy shot" }),
    pair("拉开外层洋装前襟", "opening the front of the outer dress", { modes: ["opening"], adultOnly: true, intensity: "revealing", handPose: "fingers holding the edge of the open garment", bodyFocus: "the chest contour and waistline forming a clear curve toward the camera", shotSize: "medium shot" }),
    pair("滑下一侧肩带", "letting one shoulder strap slip down slowly", { modes: ["opening"], adultOnly: true, intensity: "revealing", handPose: "one hand resting near the collarbone", bodyFocus: "the neck and collarbone angled toward the camera", shotSize: "medium close shot" }),
    pair("侧身展示腰胯线条", "turning to present the waist and hip line", { modes: ["body"], adultOnly: true, intensity: "revealing", bodyOrientation: "three-quarter view from the front left", bodyFocus: "an explicit adult composition emphasizing the hips and upper front body line", shotSize: "cowboy shot" }),
    pair("后仰展示腰线", "leaning back to emphasize the torso and waistline", { modes: ["body"], adultOnly: true, intensity: "revealing", bodyOrientation: "three-quarter view from the front right", bodyFocus: "an explicit adult composition emphasizing the chest, waist, and hips together", shotSize: "medium shot" }),
    pair("抬腿展示腿部线条", "lifting one leg to emphasize the leg line", { modes: ["body"], adultOnly: true, intensity: "revealing", bodyFocus: "an explicit adult composition emphasizing the hips and upper front body line", shotSize: "cowboy shot" }),
    pair("主动贴近并回应", "moving in close with explicit sexual intent and visible mutual arousal", { modes: ["intimacy"], adultOnly: true, intensity: "revealing", people: 2, bodyFocus: "an explicit adult composition emphasizing the chest, waist, and hips together", shotSize: "two-shot medium framing" }),
    pair("一人主导一人回应", "one consenting adult leading while the other moans and responds", { modes: ["intimacy"], adultOnly: true, intensity: "revealing", people: 2, bodyFocus: "an explicit adult composition emphasizing the hips and upper front body line", shotSize: "two-shot medium framing" }),
    pair("多人协同亲密互动", "three consenting adults in coordinated explicit intimacy", { modes: ["intimacy"], adultOnly: true, intensity: "revealing", people: 3, bodyFocus: "a fully presented adult body-line composition with explicit intent", shotSize: "medium wide shot" })
  ];

  O.underwearStyle = [
    pair("不指定", ""),
    pair("白色棉质内搭", "white cotton underwear", { adultOnly: true, intensity: "revealing" }),
    pair("黑色蕾丝内搭", "black lace underwear", { adultOnly: true, intensity: "revealing" }),
    pair("无痕肤色内搭", "seamless skin-tone underwear", { adultOnly: true, intensity: "revealing" }),
    pair("丁字式内搭", "thong-style underwear", { adultOnly: true, intensity: "revealing" }),
    pair("蕾丝连体内搭", "lace one-piece innerwear", { adultOnly: true, intensity: "revealing" }),
    pair("与服装同色内搭", "underwear matching the outfit color", { adultOnly: true, intensity: "revealing" }),
    pair("蕾丝与吊袜带组合", "lace underwear with a garter detail", { adultOnly: true, intensity: "revealing" })
  ];

  O.revealMode.push(
    pair("乳头清晰可见", "both nipples clearly visible", { mode: "visibility", target: "nipples", adultOnly: true, intensity: "revealing" }),
    pair("大阴唇清晰可见", "pussy clearly visible", { mode: "visibility", target: "vulva", adultOnly: true, intensity: "revealing" }),
    pair("肛门清晰可见", "asshole clearly visible", { mode: "visibility", target: "anus", adultOnly: true, intensity: "revealing" })
  );

  O.revealAction.push(
    pair("拉开前襟展露胸部", "opening the front of the garment to bare the tits and nipples", { modes: ["visibility"], targets: ["nipples"], adultOnly: true, intensity: "revealing", handPose: "fingers holding the edge of the open garment", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit composition clearly presenting the nipples and chest", shotSize: "medium close shot" }),
    pair("滑下一侧肩带并侧身", "letting one shoulder strap slip down while turning slightly to the side", { modes: ["visibility"], targets: ["nipples"], adultOnly: true, intensity: "revealing", handPose: "one hand resting near the collarbone", bodyOrientation: "three-quarter view from the front left", bodyFocus: "an explicit composition clearly presenting the nipples and chest", shotSize: "medium shot" }),
    pair("俯身展露胸部", "leaning forward to push the bare tits toward the camera", { modes: ["visibility"], targets: ["nipples"], adultOnly: true, intensity: "revealing", bodyOrientation: "three-quarter view from the front right", bodyFocus: "an explicit composition clearly presenting the nipples and chest", shotSize: "medium close shot" }),
    pair("提起前摆并分开双腿", "lifting the front hem while parting the legs to bare the pussy", { modes: ["visibility"], targets: ["vulva"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "both hands lifting the skirt hem", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", shotSize: "full-body shot" }),
    pair("侧卧抬腿展示", "lying on one side, lifting the upper leg and spreading the pussy open to the camera", { modes: ["visibility"], targets: ["vulva"], adultOnly: true, intensity: "revealing", bodyOrientation: "lying on one side and facing the camera", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", shotSize: "full-body shot" }),
    pair("正面低机位前摆展示", "presenting the front hem from a low camera angle to bare the pussy", { modes: ["visibility"], targets: ["vulva"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "fingers holding the edge of the skirt hem", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", shotSize: "cowboy shot" }),
    pair("背身弯腰提起后摆", "turning away, bending forward, and lifting the rear hem to bare the ass and asshole", { modes: ["visibility"], targets: ["anus"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "both hands lifting the skirt hem", bodyOrientation: "viewed from behind", bodyFocus: "an explicit rear composition clearly presenting the ass and asshole", shotSize: "full-body shot" }),
    pair("侧卧抬臀回望", "lying on one side with the hips lifted and looking back toward the camera", { modes: ["visibility"], targets: ["anus"], adultOnly: true, intensity: "revealing", handPose: "one hand supporting the body", bodyOrientation: "lying on one side and facing the camera", bodyFocus: "an explicit rear composition clearly presenting the ass and asshole", shotSize: "full-body shot" }),
    pair("跪姿后腰展示", "kneeling with the lower back and rear presented toward the camera", { modes: ["visibility"], targets: ["anus"], adultOnly: true, intensity: "revealing", bodyOrientation: "viewed from behind", bodyFocus: "an explicit rear composition clearly presenting the ass and asshole", shotSize: "full-body shot" })
  );

  O.bodyFocus.push(
    pair("乳头与胸部清晰呈现", "an explicit composition clearly presenting the nipples and chest", { group: "露点目标", adultOnly: true, intensity: "revealing" }),
    pair("下体正面清晰呈现", "an explicit front composition clearly presenting the pussy and inner thighs", { group: "露点目标", adultOnly: true, intensity: "revealing" }),
    pair("后庭清晰呈现", "an explicit rear composition clearly presenting the ass and asshole", { group: "露点目标", adultOnly: true, intensity: "revealing" })
  );

  O.heightPresence = [
    pair("不指定", ""),
    pair("娇小成年人", "petite adult stature"),
    pair("中等身高", "average adult height"),
    pair("高挑成年人", "tall adult stature"),
    pair("修长身形", "elongated adult figure")
  ];
  O.headBodyRatio = [
    pair("不指定", ""),
    pair("自然头身比", "natural adult head-to-body proportions"),
    pair("七头身", "seven-head adult proportions"),
    pair("八头身", "eight-head adult proportions"),
    pair("九头身", "nine-head adult proportions")
  ];
  O.legTorsoRatio = [
    pair("不指定", ""),
    pair("自然上下身比例", "balanced adult torso-to-leg proportions"),
    pair("上身修长", "elongated adult torso proportions"),
    pair("腿部偏长", "long-legged adult proportions"),
    pair("紧凑比例", "compact adult proportions")
  ];
  O.shoulderWidth = [
    pair("不指定", ""),
    pair("肩宽较窄", "narrow adult shoulder line"),
    pair("肩宽适中", "balanced adult shoulder width"),
    pair("肩宽较宽", "broad adult shoulder line")
  ];
  O.silhouetteBalance = [
    pair("不指定", ""),
    pair("自然曲线", "natural adult body contour"),
    pair("沙漏型轮廓", "hourglass adult silhouette"),
    pair("梨形轮廓", "pear-shaped adult silhouette"),
    pair("倒三角轮廓", "athletic V-shaped adult silhouette"),
    pair("矩形轮廓", "rectangular adult silhouette"),
    pair("丰满曲线", "full curved adult silhouette")
  ];

  O.breastSize = [
    pair("不指定", ""),
    pair("平坦胸部", "flat adult chest", { adultOnly: true, intensity: "revealing" }),
    pair("小巧胸部", "small adult breasts", { adultOnly: true, intensity: "revealing" }),
    pair("适中胸部", "medium adult breasts", { adultOnly: true, intensity: "revealing" }),
    pair("丰满胸部", "full adult breasts", { adultOnly: true, intensity: "revealing" }),
    pair("丰满偏大胸部", "very full adult breasts", { adultOnly: true, intensity: "revealing" })
  ];
  O.breastShape = [
    pair("不指定", ""),
    pair("圆润胸部", "rounded adult breast contour", { adultOnly: true, intensity: "revealing" }),
    pair("水滴形胸部", "teardrop adult breast contour", { adultOnly: true, intensity: "revealing" }),
    pair("圆锥形胸部", "conical adult breast contour", { adultOnly: true, intensity: "revealing" }),
    pair("宽间距胸部", "wide-set adult breast contour", { adultOnly: true, intensity: "revealing" }),
    pair("自然重力感", "natural adult breast gravity", { adultOnly: true, intensity: "revealing" }),
    pair("饱满挺拔", "full and uplifted adult breast contour", { adultOnly: true, intensity: "revealing" })
  ];
  O.breastSpacing = [
    pair("不指定", ""),
    pair("胸部间距较近", "close-set adult breast spacing", { adultOnly: true, intensity: "revealing" }),
    pair("胸部间距适中", "balanced adult breast spacing", { adultOnly: true, intensity: "revealing" }),
    pair("胸部间距较宽", "wide-set adult breast spacing", { adultOnly: true, intensity: "revealing" })
  ];
  O.nippleSize = [
    pair("不指定", ""),
    pair("乳头较小", "small adult nipples", { adultOnly: true, intensity: "revealing" }),
    pair("乳头适中", "medium adult nipples", { adultOnly: true, intensity: "revealing" }),
    pair("乳头明显", "prominent adult nipples", { adultOnly: true, intensity: "revealing" })
  ];
  O.nippleColor = [
    pair("不指定", ""),
    pair("自然肤色", "natural skin-tone nipples", { adultOnly: true, intensity: "revealing" }),
    pair("淡粉色", "light pink nipples", { adultOnly: true, intensity: "revealing" }),
    pair("玫瑰色", "rose-toned nipples", { adultOnly: true, intensity: "revealing" }),
    pair("浅棕色", "light brown nipples", { adultOnly: true, intensity: "revealing" }),
    pair("棕色", "brown nipples", { adultOnly: true, intensity: "revealing" }),
    pair("深棕色", "dark brown nipples", { adultOnly: true, intensity: "revealing" })
  ];
  O.areolaSize = [
    pair("不指定", ""),
    pair("乳晕较小", "small adult areolae", { adultOnly: true, intensity: "revealing" }),
    pair("乳晕适中", "medium adult areolae", { adultOnly: true, intensity: "revealing" }),
    pair("乳晕较大", "large adult areolae", { adultOnly: true, intensity: "revealing" })
  ];
  O.areolaColor = [
    pair("不指定", ""),
    pair("自然肤色", "natural skin-tone areolae", { adultOnly: true, intensity: "revealing" }),
    pair("淡粉色", "light pink areolae", { adultOnly: true, intensity: "revealing" }),
    pair("浅棕色", "light brown areolae", { adultOnly: true, intensity: "revealing" }),
    pair("棕色", "brown areolae", { adultOnly: true, intensity: "revealing" })
  ];
  O.pubicHairState = [
    pair("不指定", ""),
    pair("无阴毛", "smooth hairless adult pubic area", { aliases: ["白虎", "全剃"], adultOnly: true, intensity: "revealing" }),
    pair("自然阴毛", "naturally groomed adult pubic hair", { aliases: ["自然"], adultOnly: true, intensity: "revealing" }),
    pair("修剪阴毛", "neatly trimmed adult pubic hair", { aliases: ["修剪"], adultOnly: true, intensity: "revealing" }),
    pair("比基尼线", "adult bikini-line grooming", { aliases: [" bikini line", "比基尼线修剪"], adultOnly: true, intensity: "revealing" }),
    pair("全部去除", "fully removed adult pubic hair", { adultOnly: true, intensity: "revealing" })
  ];
  O.pubicHairAmount = [
    pair("不指定", ""),
    pair("阴毛稀少", "sparse adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("阴毛适中", "moderate adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("阴毛浓密", "dense adult pubic hair", { adultOnly: true, intensity: "revealing" })
  ];
  O.pubicHairShape = [
    pair("不指定", ""),
    pair("自然三角", "natural triangular adult pubic-hair contour", { aliases: ["三角", "自然型"], adultOnly: true, intensity: "revealing" }),
    pair("倒三角", "inverted triangular adult pubic-hair contour", { aliases: ["倒三角型"], adultOnly: true, intensity: "revealing" }),
    pair("窄条", "narrow-strip adult pubic-hair contour", { aliases: ["一线", "窄条型"], adultOnly: true, intensity: "revealing" }),
    pair("心形", "heart-shaped adult pubic-hair contour", { aliases: ["心形型"], adultOnly: true, intensity: "revealing" }),
    pair("几何形状", "geometric adult pubic-hair contour", { aliases: ["几何"], adultOnly: true, intensity: "revealing" })
  ];
  O.pubicHairLength = [
    pair("不指定", ""),
    pair("短阴毛", "short adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("中等长度", "medium-length adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("长阴毛", "long adult pubic hair", { adultOnly: true, intensity: "revealing" })
  ];
  O.pubicHairTexture = [
    pair("不指定", ""),
    pair("柔软", "soft adult pubic hair texture", { adultOnly: true, intensity: "revealing" }),
    pair("自然卷曲", "naturally curly adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("细密", "fine dense adult pubic hair", { adultOnly: true, intensity: "revealing" })
  ];
  O.pubicHairColor = [
    pair("不指定", ""),
    pair("黑色", "black adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("深棕色", "dark brown adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("棕色", "brown adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("红棕色", "auburn adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("金棕色", "golden-brown adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("灰黑色", "gray-black adult pubic hair", { adultOnly: true, intensity: "revealing" }),
    pair("染色", "dyed adult pubic hair", { adultOnly: true, intensity: "revealing" })
  ];
  O.monsFullness = [
    pair("不指定", ""),
    pair("平缓", "subtle adult mons contour", { promptZh: "阴阜轮廓平缓", promptEn: "subtle natural adult mons contour", aliases: ["平缓型"], adultOnly: true, intensity: "revealing" }),
    pair("自然", "natural adult mons contour", { promptZh: "阴阜轮廓自然", promptEn: "natural adult mons contour", aliases: ["自然型"], adultOnly: true, intensity: "revealing" }),
    pair("饱满", "full adult mons contour", { promptZh: "阴阜轮廓饱满", promptEn: "full rounded adult mons contour", aliases: ["饱满型"], adultOnly: true, intensity: "revealing" }),
    pair("圆润", "rounded adult mons contour", { promptZh: "阴阜轮廓圆润", promptEn: "round adult mons contour", aliases: ["圆润型"], adultOnly: true, intensity: "revealing" })
  ];
  O.vulvaContour = [
    pair("不指定", ""),
    pair("自然闭合型", "natural closed adult vulvar contour", { promptZh: "自然、柔和的外阴轮廓", promptEn: "natural closed adult vulvar contour", aliases: ["自然型"], adultOnly: true, intensity: "revealing" }),
    pair("紧凑型", "compact adult vulvar contour", { promptZh: "紧凑、贴合的外轮廓", promptEn: "compact and closely framed adult vulvar contour", aliases: ["紧凑"], adultOnly: true, intensity: "revealing" }),
    pair("一线型", "narrow central adult vulvar contour", { promptZh: "纵向缝隙清晰的外轮廓", promptEn: "narrow central adult vulvar contour", aliases: ["一线", "窄缝"], adultOnly: true, intensity: "revealing" }),
    pair("馒头型（饱满）", "full rounded adult outer vulvar contour", { promptZh: "外轮廓饱满圆润", promptEn: "full rounded adult outer vulvar contour", aliases: ["馒头", "馒头B", "饱满型"], adultOnly: true, intensity: "revealing" }),
    pair("蝴蝶型（内侧明显）", "prominent adult inner-labial contour", { promptZh: "内侧轮廓较明显、超出外侧轮廓", promptEn: "prominent adult inner labia extending beyond the outer labia", aliases: ["蝴蝶", "蝴蝶B", "蝶翼型"], adultOnly: true, intensity: "revealing" }),
    pair("花瓣型", "layered soft adult vulvar contour", { promptZh: "多层柔和的外轮廓", promptEn: "layered soft adult vulvar contour", aliases: ["花瓣"], adultOnly: true, intensity: "revealing" }),
    pair("双层轮廓型", "layered adult vulvar contour", { promptZh: "内外两层轮廓清晰", promptEn: "layered adult vulvar contour", aliases: ["双层"], adultOnly: true, intensity: "revealing" }),
    pair("外轮廓明显型", "prominent adult outer vulvar contour", { promptZh: "外侧轮廓明显", promptEn: "prominent adult outer vulvar contour", aliases: ["外轮廓明显"], adultOnly: true, intensity: "revealing" })
  ];
  O.labiaMajoraShape = [
    pair("不指定", ""),
    pair("偏薄", "thin adult labia majora contour", { promptZh: "大阴唇轮廓偏薄", promptEn: "thin adult labia majora contour", adultOnly: true, intensity: "revealing" }),
    pair("适中", "moderate adult labia majora contour", { promptZh: "大阴唇轮廓适中", promptEn: "moderate adult labia majora contour", adultOnly: true, intensity: "revealing" }),
    pair("偏厚", "thick adult labia majora contour", { promptZh: "大阴唇轮廓偏厚", promptEn: "thick adult labia majora contour", adultOnly: true, intensity: "revealing" }),
    pair("贴合", "closely set adult labia majora", { promptZh: "大阴唇自然贴合", promptEn: "closely set adult labia majora", adultOnly: true, intensity: "revealing" }),
    pair("饱满", "full adult labia majora", { promptZh: "大阴唇轮廓饱满", promptEn: "full adult labia majora", adultOnly: true, intensity: "revealing" })
  ];
  O.labiaMinoraVisibility = [
    pair("不指定", ""),
    pair("隐藏", "hidden adult labia minora", { promptZh: "小阴唇自然隐藏", promptEn: "hidden adult labia minora", adultOnly: true, intensity: "revealing" }),
    pair("轻微可见", "slightly visible adult labia minora", { promptZh: "小阴唇轻微可见", promptEn: "slightly visible adult labia minora", adultOnly: true, intensity: "revealing" }),
    pair("明显外露", "clearly visible adult labia minora", { promptZh: "小阴唇明显外露", promptEn: "clearly visible adult labia minora", adultOnly: true, intensity: "revealing" }),
    pair("两侧轮廓清晰", "symmetrically visible adult labia minora", { promptZh: "两侧小阴唇轮廓清晰", promptEn: "symmetrically visible adult labia minora", adultOnly: true, intensity: "revealing" })
  ];
  O.vulvaColor = [
    pair("不指定", ""),
    pair("自然肤色", "natural skin-tone adult vulva", { promptZh: "外阴颜色自然", promptEn: "natural skin-tone adult vulva", adultOnly: true, intensity: "revealing" }),
    pair("浅粉", "light pink adult vulva", { promptZh: "外阴呈浅粉色", promptEn: "light pink adult vulva", aliases: ["粉嫩"], adultOnly: true, intensity: "revealing" }),
    pair("玫瑰色", "rose-toned adult vulva", { promptZh: "外阴呈柔和玫瑰色", promptEn: "rose-toned adult vulva", aliases: ["粉红"], adultOnly: true, intensity: "revealing" }),
    pair("粉棕色", "pink-brown adult vulva", { promptZh: "外阴呈粉棕色", promptEn: "pink-brown adult vulva", adultOnly: true, intensity: "revealing" }),
    pair("浅棕色", "light brown adult vulva", { promptZh: "外阴呈浅棕色", promptEn: "light brown adult vulva", adultOnly: true, intensity: "revealing" }),
    pair("棕色", "brown adult vulva", { promptZh: "外阴呈棕色", promptEn: "brown adult vulva", adultOnly: true, intensity: "revealing" }),
    pair("深棕色", "dark brown adult vulva", { promptZh: "外阴呈深棕色", promptEn: "dark brown adult vulva", adultOnly: true, intensity: "revealing" })
  ];
  O.vulvaColorIntensity = [
    pair("不指定", ""),
    pair("轻微", "subtle adult vulvar color variation", { promptZh: "外阴颜色变化轻微", promptEn: "subtle adult vulvar color variation", adultOnly: true, intensity: "revealing" }),
    pair("适中", "moderate adult vulvar color variation", { promptZh: "外阴颜色变化适中", promptEn: "moderate adult vulvar color variation", adultOnly: true, intensity: "revealing" }),
    pair("明显", "pronounced adult vulvar color variation", { promptZh: "外阴颜色变化明显", promptEn: "pronounced adult vulvar color variation", adultOnly: true, intensity: "revealing" })
  ];

  O.pose.push(
    pair("露点 · 站姿正面展示", "standing frontal adult presentation", { group: "露点", family: "standing", adultOnly: true, intensity: "revealing", focus: ["fullBody", "sideWaistHip", "outerThigh"] }),
    pair("露点 · 站姿侧身展示", "standing in a three-quarter adult presentation", { group: "露点", family: "standing", adultOnly: true, intensity: "revealing", focus: ["sideWaistHip", "outerThigh", "fullBody"] }),
    pair("露点 · 靠墙站姿展示", "standing against a wall in an adult presentation", { group: "露点", family: "standing", adultOnly: true, intensity: "revealing", focus: ["fullBody", "sideWaistHip", "chestWaist"] }),
    pair("露点 · 双手置于腰后站姿", "standing with both hands placed behind the waist", { group: "露点", family: "standing", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "sideWaistHip", "fullBody"] }),
    pair("露点 · 床沿坐姿展示", "sitting on the edge of the bed in an adult presentation", { group: "露点", family: "sitting", adultOnly: true, intensity: "revealing", focus: ["sideWaistHip", "outerThigh", "fullBody"] }),
    pair("露点 · 椅坐前倾展示", "sitting on a chair and leaning forward with an adult presentation", { group: "露点", family: "sitting", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "waist", "fullBody"] }),
    pair("露点 · 地面盘腿展示", "sitting cross-legged on the floor in an adult presentation", { group: "露点", family: "sitting", adultOnly: true, intensity: "revealing", focus: ["fullBody", "outerThigh", "face"] }),
    pair("露点 · 沙发侧坐展示", "sitting sideways on a sofa in an adult presentation", { group: "露点", family: "sitting", adultOnly: true, intensity: "revealing", focus: ["sideWaistHip", "outerThigh", "fullBody"] }),
    pair("露点 · 单膝跪地展示", "down on one knee in an adult presentation", { group: "露点", family: "kneeling", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "innerThighKnee", "fullBody"] }),
    pair("露点 · 跪坐挺直展示", "kneeling upright in an adult presentation", { group: "露点", family: "kneeling", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "sideWaistHip", "fullBody"] }),
    pair("露点 · 半跪前倾展示", "half-kneeling and leaning forward in an adult presentation", { group: "露点", family: "kneeling", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "face", "fullBody"] }),
    pair("露点 · 门框倚靠展示", "leaning in a doorway in an adult presentation", { group: "露点", family: "leaning", adultOnly: true, intensity: "revealing", focus: ["sideWaistHip", "outerThigh", "fullBody"] }),
    pair("露点 · 桌边倚靠展示", "leaning against the edge of a table in an adult presentation", { group: "露点", family: "leaning", adultOnly: true, intensity: "revealing", focus: ["sideWaistHip", "waist", "fullBody"] }),
    pair("露点 · 窗边倚靠展示", "leaning by a window in an adult presentation", { group: "露点", family: "leaning", adultOnly: true, intensity: "revealing", focus: ["chestWaist", "sideWaistHip", "fullBody"] }),
    pair("露点 · 背身回望展示", "standing with the back turned while looking back in an adult presentation", { group: "露点", family: "back", adultOnly: true, intensity: "revealing", focus: ["upperBack", "rearWaistHip", "fullBody"] }),
    pair("露点 · 背身弯腰展示", "bending slightly with the back turned in an adult presentation", { group: "露点", family: "back", adultOnly: true, intensity: "revealing", focus: ["rearWaistHip", "upperBack", "fullBody"] }),
    pair("露点 · 转身动态展示", "caught mid-turn in an adult presentation", { group: "露点", family: "dynamic", adultOnly: true, intensity: "revealing", focus: ["fullBody", "sideWaistHip", "face"] }),
    pair("露点 · 向前行走展示", "walking toward the camera with an adult presentation", { group: "露点", family: "dynamic", adultOnly: true, intensity: "revealing", focus: ["fullBody", "outerThigh", "face"] }),
    pair("露点 · 双人面对面站立", "two consenting adults standing face to face", { group: "露点", family: "standing", adultOnly: true, intensity: "revealing", people: 2, focus: ["face", "chestWaist", "fullBody"] }),
    pair("露点 · 双人并肩坐姿", "two consenting adults sitting side by side", { group: "露点", family: "sitting", adultOnly: true, intensity: "revealing", people: 2, focus: ["face", "sideWaistHip", "fullBody"] }),
    pair("露点 · 双人背靠背站立", "two consenting adults standing back to back", { group: "露点", family: "back", adultOnly: true, intensity: "revealing", people: 2, focus: ["upperBack", "rearWaistHip", "fullBody"] }),
    pair("露点 · 双人倚墙互动", "two consenting adults leaning close by a wall", { group: "露点", family: "leaning", adultOnly: true, intensity: "revealing", people: 2, focus: ["face", "sideWaistHip", "fullBody"] }),
    pair("露点 · 三人三角站位", "three consenting adults arranged in a triangular standing composition", { group: "露点", family: "standing", adultOnly: true, intensity: "revealing", people: 3, focus: ["face", "chestWaist", "fullBody"] }),
    pair("露点 · 三人沙发层次", "three consenting adults arranged across a sofa in layered seated positions", { group: "露点", family: "sitting", adultOnly: true, intensity: "revealing", people: 3, focus: ["face", "sideWaistHip", "fullBody"] }),
    pair("露点 · 三人跪坐组合", "three consenting adults in a coordinated kneeling composition", { group: "露点", family: "kneeling", adultOnly: true, intensity: "revealing", people: 3, focus: ["chestWaist", "innerThighKnee", "fullBody"] }),
    pair("露点 · 三人背身层次", "three consenting adults arranged with a layered rear-facing composition", { group: "露点", family: "back", adultOnly: true, intensity: "revealing", people: 3, focus: ["upperBack", "rearWaistHip", "fullBody"] })
  );

  O.outfit.push(
    pair("唐制齐胸襦裙", "adult Tang-style chest-high ruqun", { group: "中国古装", family: "chinese" }),
    pair("唐制坦领襦裙", "adult Tang-inspired open-collar ruqun", { group: "中国古装", family: "chinese" }),
    pair("宋制褙子与抹胸", "adult Song-style beizi with a wrapped chest layer", { group: "中国古装", family: "chinese" }),
    pair("宋制百迭裙", "adult Song-style pleated skirt ensemble", { group: "中国古装", family: "chinese" }),
    pair("明制袄裙", "adult Ming-style jacket and skirt ensemble", { group: "中国古装", family: "chinese" }),
    pair("明制马面裙", "adult Ming-style horse-face skirt ensemble", { group: "中国古装", family: "chinese" }),
    pair("明制披风", "adult Ming-style formal cloak", { group: "中国古装", family: "chinese" }),
    pair("曲裾深衣", "adult traditional curved-hem deep robe", { group: "中国古装", family: "chinese" }),
    pair("魏晋风大袖襦裙", "adult Wei-Jin-inspired wide-sleeve robe", { group: "中国古装", family: "chinese" }),
    pair("敦煌飞天舞衣", "adult Dunhuang-inspired flying-ribbon dance costume", { group: "中国古装", family: "chinese" }),
    pair("凤冠霞帔古风婚服", "adult Chinese-inspired ceremonial wedding costume", { group: "中国古装", family: "chinese" }),
    pair("古风侠客劲装", "adult Chinese-inspired martial arts outfit", { group: "中国古装", family: "chinese" }),
    pair("传统旗袍", "adult traditional qipao", { group: "旗袍与新中式", family: "chinese" }),
    pair("高领盘扣旗袍", "adult high-collar mandarin-collar qipao", { group: "旗袍与新中式", family: "chinese" }),
    pair("改良短款旗袍", "adult modern short qipao", { group: "旗袍与新中式", family: "chinese" }),
    pair("新中式立领套装", "adult new-Chinese mandarin-collar ensemble", { group: "旗袍与新中式", family: "chinese" }),
    pair("新中式长裙", "adult new-Chinese long dress", { group: "旗袍与新中式", family: "chinese" }),
    pair("露肩齐胸襦裙", "adult off-shoulder Tang-inspired ruqun", { group: "中国古装", family: "chinese", adultOnly: true, intensity: "revealing" }),
    pair("开襟宋制褙子与抹胸", "adult open-front Song-inspired beizi with a wrapped chest layer", { group: "中国古装", family: "chinese", adultOnly: true, intensity: "revealing" }),
    pair("明制外衫半开", "adult Ming-inspired layered outer robe worn partly open", { group: "中国古装", family: "chinese", adultOnly: true, intensity: "revealing" }),
    pair("高开衩旗袍", "adult high-slit qipao", { group: "旗袍与新中式", family: "chinese", adultOnly: true, intensity: "revealing" }),
    pair("露背改良旗袍", "adult open-back modern qipao", { group: "旗袍与新中式", family: "chinese", adultOnly: true, intensity: "revealing" }),
    pair("薄纱敦煌舞衣", "adult semi-sheer Dunhuang-inspired dance costume", { group: "中国古装", family: "chinese", adultOnly: true, intensity: "revealing" }),
    pair("古风薄纱外袍与内搭", "adult layered Chinese-inspired sheer outer robe and innerwear", { group: "中国古装", family: "chinese", adultOnly: true, intensity: "revealing" }),
    pair("新中式开襟外袍", "adult new-Chinese open-front outer robe", { group: "旗袍与新中式", family: "chinese", adultOnly: true, intensity: "revealing" })
  );

  O.grooming.push(
    pair("素雅宋妆", "refined Song-inspired makeup", { group: "中式妆容", neutral: true }),
    pair("唐风桃花妆", "Tang-inspired peach-blossom makeup", { group: "中式妆容", neutral: true }),
    pair("花钿妆", "classical Chinese floral forehead makeup", { group: "中式妆容", neutral: true }),
    pair("柳叶眉", "willow-leaf eyebrows", { group: "中式妆容", neutral: true }),
    pair("远山眉", "distant-mountain eyebrows", { group: "中式妆容", neutral: true }),
    pair("丹凤眼线", "dramatic phoenix-eye eyeliner", { group: "中式妆容", neutral: true }),
    pair("斜红妆", "classical Chinese blush makeup", { group: "中式妆容", neutral: true }),
    pair("面靥妆", "classical Chinese cheek-mark makeup", { group: "中式妆容", neutral: true }),
    pair("朱砂点唇", "classical cinnabar lip accent", { group: "中式妆容", neutral: true }),
    pair("古典红唇", "classical Chinese red lip", { group: "中式妆容", neutral: true }),
    pair("清冷仙侠妆", "ethereal wuxia-inspired makeup", { group: "中式妆容", neutral: true }),
    pair("新中式裸妆", "new-Chinese natural makeup", { group: "中式妆容", neutral: true })
  );

  O.hairStyle.push(
    pair("高髻", "classical high bun", { group: "中国古装" }),
    pair("双环望仙髻", "classical double-loop fairy bun", { group: "中国古装" }),
    pair("堕马髻", "classical asymmetrical falling bun", { group: "中国古装" }),
    pair("灵蛇髻", "classical coiled serpent bun", { group: "中国古装" }),
    pair("飞仙髻", "classical flying-fairy hairstyle", { group: "中国古装" }),
    pair("低盘发", "classical low updo", { group: "中国古装" }),
    pair("古典长直发", "classical long straight hair", { group: "中国古装" })
  );

  O.accessories.push(
    pair("发冠", "ornate Chinese hair crown", { group: "中国古装", neutral: true }),
    pair("步摇", "classical dangling hairpin", { group: "中国古装", neutral: true }),
    pair("簪花", "classical floral hairpin", { group: "中国古装", neutral: true }),
    pair("珠钗", "classical pearl hairpin", { group: "中国古装", neutral: true }),
    pair("流苏发饰", "classical tasseled hair ornament", { group: "中国古装", neutral: true }),
    pair("面纱", "semi-sheer classical veil", { group: "中国古装", neutral: true }),
    pair("披帛", "flowing classical shawl", { group: "中国古装", neutral: true }),
    pair("玉佩", "classical jade pendant", { group: "中国古装", neutral: true }),
    pair("团扇", "classical round fan", { group: "中国古装", neutral: true })
  );

  O.footwear.push(
    pair("绣花鞋", "embroidered cloth shoes", { group: "中国古装", neutral: true }),
    pair("古风布鞋", "classical cloth shoes", { group: "中国古装", neutral: true }),
    pair("低跟绣花鞋", "low-heeled embroidered shoes", { group: "中国古装", neutral: true })
  );

  O.visualStyle.push(
    pair("国风电影感", "Chinese cinematic style", { group: "中国风" }),
    pair("工笔画", "gongbi brush-painting style", { group: "中国风" }),
    pair("工笔重彩", "rich gongbi color-painting style", { group: "中国风" }),
    pair("水墨风", "ink-wash painting style", { group: "中国风" }),
    pair("敦煌壁画色", "Dunhuang mural palette", { group: "中国风" }),
    pair("古偶剧质感", "historical Chinese drama look", { group: "中国风" }),
    pair("东方奇幻电影感", "Eastern fantasy cinematic style", { group: "中国风" })
  );

  O.scene.push(
    pair("中式宫殿", "a Chinese palace hall", { group: "中国古风" }),
    pair("月下庭院", "a moonlit Chinese courtyard", { group: "中国古风" }),
    pair("古典园林", "a classical Chinese garden", { group: "中国古风" }),
    pair("江南水乡", "a Jiangnan water town", { group: "中国古风" }),
    pair("红灯笼长街", "a street lined with red lanterns", { group: "中国古风" }),
    pair("古风茶室", "a classical Chinese tea room", { group: "中国古风" }),
    pair("敦煌洞窟", "a Dunhuang-inspired cave", { group: "中国古风" }),
    pair("仙山云海", "a misty immortal mountain landscape", { group: "中国古风" }),
    pair("竹林", "a bamboo forest", { group: "中国古风" })
  );

  // 半裸不再承担“情趣内衣/披外套”等服装类型，只描述主要裸露部位。
  O.halfNudeStyle = [
    pair("不指定", ""),
    pair("上身裸露，下装遮蔽", "bare upper body with the lower body covered", { zone: "lower" }),
    pair("下身裸露，上装遮蔽", "bare lower body with the upper body covered", { zone: "upper" }),
    pair("背部裸露，正面遮蔽", "open-back styling with the front covered", { zone: "back" }),
    pair("肩颈裸露", "bare shoulders and neckline with the main body covered", { zone: "shoulder" }),
    pair("单侧肩背裸露", "one shoulder and side exposed with the rest covered", { zone: "one_side" }),
    pair("腰腹局部裸露", "waist and abdomen partially exposed with the rest covered", { zone: "waist" }),
    pair("单腿裸露，开衩遮蔽", "one leg exposed through a high slit with the rest covered", { zone: "leg" }),
    pair("局部镂空", "selective cutouts with the surrounding areas covered", { zone: "cutout" })
  ];

  O.outfit.push(
    pair("男士运动背心与跑步短裤", "men's athletic tank top with running shorts", { group: "男性运动" }),
    pair("男士速干运动套装", "men's technical quick-dry training set", { group: "男性运动" }),
    pair("男士篮球背心与短裤", "men's basketball jersey and shorts", { group: "男性运动" }),
    pair("男士泳裤", "men's swim trunks", { group: "男性泳装与内裤" }),
    pair("男士紧身泳裤", "men's fitted swim briefs", { group: "男性泳装与内裤", adultOnly: true, intensity: "revealing" }),
    pair("男士平角内裤", "men's boxer briefs", { group: "男性泳装与内裤", adultOnly: true, intensity: "revealing" }),
    pair("男士宽松家居短裤", "men's relaxed lounge shorts", { group: "男性居家" }),
    pair("男士敞开亚麻衬衫", "men's open linen shirt", { group: "男性居家" }),
    pair("男士交领长袍", "men's cross-collar Chinese long robe", { group: "中国风男装", family: "chinese" }),
    pair("男士圆领袍与革带", "men's round-collar robe with a belt", { group: "中国风男装", family: "chinese" }),
    pair("男士武侠劲装", "men's wuxia-inspired martial outfit", { group: "中国风男装", family: "chinese" }),
    pair("男士开襟古风外袍", "men's open-front historical Chinese outer robe", { group: "中国风男装", family: "chinese", adultOnly: true, intensity: "revealing" }),
    pair("男士浴巾围腰", "adult man wrapped in a bath towel at the waist", { group: "男性露点", adultOnly: true, intensity: "revealing" }),
    pair("男士敞开短睡袍", "adult man in a partly open short robe", { group: "男性露点", adultOnly: true, intensity: "revealing" }),
    pair("男士低腰运动短裤", "adult man in low-rise athletic shorts", { group: "男性露点", adultOnly: true, intensity: "revealing" })
  );

  const maleCoverageZones = ["upper", "lower", "torso", "back", "shoulder", "waist", "leg", "cutout", "one_side"];
  O.coveredGarment.push(
    pair("男士宽松长裤", "men's relaxed trousers", { group: "男性遮盖", zones: ["lower"] }),
    pair("男士运动短裤", "men's athletic shorts", { group: "男性遮盖", zones: ["lower"] }),
    pair("男士平角内裤", "men's boxer briefs", { group: "男性遮盖", adultOnly: true, intensity: "revealing", zones: ["lower"] }),
    pair("男士泳裤", "men's swim trunks", { group: "男性遮盖", zones: ["lower"] }),
    pair("男士敞开的衬衫", "men's open shirt", { group: "男性遮盖", zones: ["upper", "torso"] }),
    pair("男士长款上衣", "men's longline top", { group: "男性遮盖", zones: ["upper"] }),
    pair("男士浴巾围腰", "a bath towel wrapped around the waist", { group: "男性遮盖", adultOnly: true, intensity: "revealing", zones: ["lower"] }),
    pair("男士敞开睡袍", "men's partly open robe", { group: "男性遮盖", adultOnly: true, intensity: "revealing", zones: maleCoverageZones })
  );
  const chineseLingerieZones = ["upper", "lower", "back", "shoulder", "one_side", "waist", "leg", "torso", "cutout", "lingerie"];
  O.coveredGarment.push(
    pair("古风薄纱外袍与抹胸内搭", "semi-sheer historical Chinese outer robe with a wrapped chest layer", { group: "古风情趣", styleGroup: "古风情趣", adultOnly: true, intensity: "revealing", zones: chineseLingerieZones }),
    pair("薄纱齐胸内搭与披帛", "semi-sheer chest-high inner layer with a flowing shawl", { group: "古风情趣", styleGroup: "古风情趣", adultOnly: true, intensity: "revealing", zones: chineseLingerieZones }),
    pair("明制外衫与薄纱抹胸", "Ming-inspired outer robe over a sheer wrapped chest layer", { group: "古风情趣", styleGroup: "古风情趣", adultOnly: true, intensity: "revealing", zones: chineseLingerieZones }),
    pair("旗袍式真丝内衣与薄纱外袍", "qipao-inspired silk underwear with a sheer outer robe", { group: "古风情趣", styleGroup: "古风情趣", adultOnly: true, intensity: "revealing", zones: chineseLingerieZones }),
    pair("新中式开襟纱袍与内搭", "new-Chinese sheer open-front robe with innerwear", { group: "古风情趣", styleGroup: "古风情趣", adultOnly: true, intensity: "revealing", zones: chineseLingerieZones })
  );

  O.maleVisibility = [
    pair("不指定", ""),
    pair("轮廓可见", "adult male genital contour visible through clothing", { adultOnly: true, intensity: "revealing" }),
    pair("部分可见", "partially visible adult male genital anatomy", { adultOnly: true, intensity: "revealing" }),
    pair("阴茎清晰可见", "clearly visible adult penis", { adultOnly: true, intensity: "revealing" }),
    pair("阴茎与阴囊清晰可见", "clearly visible adult penis and scrotum", { adultOnly: true, intensity: "revealing" })
  ];
  O.maleErection = [
    pair("不指定", ""),
    pair("自然疲软", "naturally flaccid adult penis", { adultOnly: true, intensity: "revealing" }),
    pair("半勃起", "partially erect adult penis", { adultOnly: true, intensity: "revealing" }),
    pair("完全勃起", "fully erect adult penis", { adultOnly: true, intensity: "revealing" })
  ];
  O.penisLength = [
    pair("不指定", ""),
    pair("偏短", "compact adult penile length", { promptZh: "阴茎长度偏短", promptEn: "compact adult penile length", adultOnly: true, intensity: "revealing" }),
    pair("适中", "average adult penile length", { promptZh: "阴茎长度适中", promptEn: "average adult penile length", adultOnly: true, intensity: "revealing" }),
    pair("偏长", "above-average adult penile length", { promptZh: "阴茎长度偏长", promptEn: "above-average adult penile length", adultOnly: true, intensity: "revealing" }),
    pair("大", "large adult penile length", { promptZh: "阴茎尺寸较大", promptEn: "large adult penile length", adultOnly: true, intensity: "revealing" }),
    pair("非常大", "very large adult penile length", { promptZh: "阴茎尺寸非常大", promptEn: "very large adult penile length", adultOnly: true, intensity: "revealing" })
  ];
  O.penisGirth = [
    pair("不指定", ""),
    pair("纤细", "slender adult penile girth", { promptZh: "阴茎较细", promptEn: "slender adult penile girth", adultOnly: true, intensity: "revealing" }),
    pair("适中", "average adult penile girth", { promptZh: "阴茎粗细适中", promptEn: "average adult penile girth", adultOnly: true, intensity: "revealing" }),
    pair("粗", "thick adult penile girth", { promptZh: "阴茎较粗", promptEn: "thick adult penile girth", adultOnly: true, intensity: "revealing" }),
    pair("很粗", "very thick adult penile girth", { promptZh: "阴茎非常粗", promptEn: "very thick adult penile girth", adultOnly: true, intensity: "revealing" })
  ];
  O.glansSize = [
    pair("不指定", ""),
    pair("偏小", "small adult glans", { promptZh: "龟头偏小", promptEn: "small adult glans", adultOnly: true, intensity: "revealing" }),
    pair("比例适中", "proportionate adult glans", { promptZh: "龟头比例适中", promptEn: "proportionate adult glans", adultOnly: true, intensity: "revealing" }),
    pair("较大", "large adult glans", { promptZh: "龟头较大", promptEn: "large adult glans", adultOnly: true, intensity: "revealing" }),
    pair("非常显著", "prominent adult glans", { promptZh: "龟头非常显著", promptEn: "prominent adult glans", adultOnly: true, intensity: "revealing" })
  ];
  O.foreskinState = [
    pair("不指定", ""),
    pair("已环切", "circumcised adult anatomy", { adultOnly: true, intensity: "revealing" }),
    pair("自然，龟头完全露出", "natural retracted foreskin with the glans fully exposed", { adultOnly: true, intensity: "revealing" }),
    pair("自然，部分覆盖", "natural foreskin partially covering the glans", { adultOnly: true, intensity: "revealing" }),
    pair("自然，完全覆盖", "natural foreskin fully covering the glans when soft", { adultOnly: true, intensity: "revealing" })
  ];
  O.scrotumSize = [
    pair("不指定", ""),
    pair("紧凑", "compact adult scrotum", { promptZh: "阴囊视觉上较紧凑", promptEn: "compact adult scrotum", adultOnly: true, intensity: "revealing" }),
    pair("适中", "average adult scrotum", { promptZh: "阴囊视觉大小适中", promptEn: "average adult scrotum", adultOnly: true, intensity: "revealing" }),
    pair("饱满", "full adult scrotum", { promptZh: "阴囊视觉上饱满", promptEn: "full adult scrotum", adultOnly: true, intensity: "revealing" }),
    pair("较大", "large adult scrotum", { promptZh: "阴囊视觉上较大", promptEn: "large adult scrotum", adultOnly: true, intensity: "revealing" })
  ];
  O.scrotumState = [
    pair("不指定", ""),
    pair("紧致", "tight adult scrotum", { promptZh: "阴囊紧致", promptEn: "tight adult scrotum", adultOnly: true, intensity: "revealing" }),
    pair("自然", "naturally relaxed adult scrotum", { promptZh: "阴囊状态自然", promptEn: "naturally relaxed adult scrotum", adultOnly: true, intensity: "revealing" }),
    pair("放松下垂", "loose and low-hanging adult scrotum", { promptZh: "阴囊放松下垂", promptEn: "loose and low-hanging adult scrotum", adultOnly: true, intensity: "revealing" })
  ];
  O.penisCurvature = [
    pair("不指定", ""),
    pair("自然直", "naturally straight adult penis", { promptZh: "阴茎自然挺直", promptEn: "naturally straight adult penis", adultOnly: true, intensity: "revealing" }),
    pair("轻微上弯", "slightly upward-curved adult penis", { promptZh: "阴茎轻微向上弯曲", promptEn: "slightly upward-curved adult penis", adultOnly: true, intensity: "revealing" }),
    pair("轻微下弯", "slightly downward-curved adult penis", { promptZh: "阴茎轻微向下弯曲", promptEn: "slightly downward-curved adult penis", adultOnly: true, intensity: "revealing" })
  ];
  O.penisVeins = [
    pair("不指定", ""),
    pair("不明显", "subtle adult penile veins", { promptZh: "阴茎静脉不明显", promptEn: "subtle adult penile veins", adultOnly: true, intensity: "revealing" }),
    pair("自然可见", "naturally visible adult penile veins", { promptZh: "阴茎静脉自然可见", promptEn: "naturally visible adult penile veins", adultOnly: true, intensity: "revealing" }),
    pair("较明显", "prominent adult penile veins", { promptZh: "阴茎静脉较明显", promptEn: "prominent adult penile veins", adultOnly: true, intensity: "revealing" })
  ];
  O.maleGenitalSkin = [
    pair("不指定", ""),
    pair("与身体一致", "adult male genital skin matching the surrounding skin tone", { adultOnly: true, intensity: "revealing" }),
    pair("略深", "slightly deeper-toned adult male genital skin", { adultOnly: true, intensity: "revealing" }),
    pair("偏粉", "subtle pink-toned adult male genital skin", { adultOnly: true, intensity: "revealing" }),
    pair("深色", "deep-toned adult male genital skin", { adultOnly: true, intensity: "revealing" })
  ];
  O.glansColor = [
    pair("不指定", ""),
    pair("自然肤色", "natural adult glans skin tone", { promptZh: "龟头呈自然肤色", promptEn: "natural adult glans skin tone", adultOnly: true, intensity: "revealing" }),
    pair("浅粉", "subtle pink-toned adult glans", { promptZh: "龟头呈浅粉色", promptEn: "subtle pink-toned adult glans", adultOnly: true, intensity: "revealing" }),
    pair("玫瑰色", "rose-toned adult glans", { promptZh: "龟头呈柔和玫瑰色", promptEn: "rose-toned adult glans", adultOnly: true, intensity: "revealing" }),
    pair("粉棕色", "pink-brown adult glans", { promptZh: "龟头呈粉棕色", promptEn: "pink-brown adult glans", adultOnly: true, intensity: "revealing" }),
    pair("深色", "deep-toned adult glans", { promptZh: "龟头颜色较深", promptEn: "deep-toned adult glans", adultOnly: true, intensity: "revealing" })
  ];
  O.malePubicHairState = [
    pair("不指定", ""),
    pair("无阴毛", "smooth hairless adult male pubic area", { promptZh: "男性阴部无阴毛", promptEn: "smooth hairless adult male pubic area", adultOnly: true, intensity: "revealing" }),
    pair("自然保留", "natural adult male pubic hair", { promptZh: "保留自然男性阴毛", promptEn: "natural adult male pubic hair", adultOnly: true, intensity: "revealing" }),
    pair("修剪", "trimmed adult male pubic hair", { promptZh: "男性阴毛经过修剪", promptEn: "trimmed adult male pubic hair", adultOnly: true, intensity: "revealing" }),
    pair("全部去除", "fully removed adult male pubic hair", { promptZh: "男性阴毛全部去除", promptEn: "fully removed adult male pubic hair", adultOnly: true, intensity: "revealing" })
  ];
  O.malePubicHairAmount = [
    pair("不指定", ""),
    pair("稀疏", "sparse adult male pubic hair", { promptZh: "男性阴毛稀疏", promptEn: "sparse adult male pubic hair", adultOnly: true, intensity: "revealing" }),
    pair("适中", "moderate adult male pubic hair", { promptZh: "男性阴毛数量适中", promptEn: "moderate adult male pubic hair", adultOnly: true, intensity: "revealing" }),
    pair("浓密", "dense adult male pubic hair", { promptZh: "男性阴毛浓密", promptEn: "dense adult male pubic hair", adultOnly: true, intensity: "revealing" })
  ];
  O.malePubicHairShape = [
    pair("不指定", ""),
    pair("自然分布", "natural adult male pubic hair distribution", { promptZh: "男性阴毛自然分布", promptEn: "natural adult male pubic hair distribution", adultOnly: true, intensity: "revealing" }),
    pair("横向轮廓", "horizontal adult male pubic hair line", { promptZh: "男性阴毛呈横向轮廓", promptEn: "horizontal adult male pubic hair line", adultOnly: true, intensity: "revealing" }),
    pair("纵向收窄", "narrowed adult male pubic hair shape", { promptZh: "男性阴毛纵向收窄", promptEn: "narrowed adult male pubic hair shape", adultOnly: true, intensity: "revealing" }),
    pair("几何修剪", "geometrically trimmed adult male pubic hair", { promptZh: "男性阴毛经过几何修剪", promptEn: "geometrically trimmed adult male pubic hair", adultOnly: true, intensity: "revealing" })
  ];
  O.malePubicHairColor = [
    pair("不指定", ""),
    pair("黑色", "black adult male pubic hair", { promptZh: "男性阴毛为黑色", promptEn: "black adult male pubic hair", adultOnly: true, intensity: "revealing" }),
    pair("深棕", "dark brown adult male pubic hair", { promptZh: "男性阴毛为深棕色", promptEn: "dark brown adult male pubic hair", adultOnly: true, intensity: "revealing" }),
    pair("棕色", "brown adult male pubic hair", { promptZh: "男性阴毛为棕色", promptEn: "brown adult male pubic hair", adultOnly: true, intensity: "revealing" }),
    pair("浅棕", "light brown adult male pubic hair", { promptZh: "男性阴毛为浅棕色", promptEn: "light brown adult male pubic hair", adultOnly: true, intensity: "revealing" })
  ];

  O.rolePreset.push(
    pair("甜美娇小系", "sweet petite styling", { group: "甜美可爱" }),
    pair("日系可爱风", "Japanese cute styling", { group: "甜美可爱" }),
    pair("邻家甜妹风", "girl-next-door sweet styling", { group: "甜美可爱" }),
    pair("元气甜美感", "bright energetic sweet styling", { group: "甜美可爱" }),
    pair("软萌休闲风", "soft cozy cute styling", { group: "甜美可爱" }),
    pair("洋娃娃感", "polished doll-like adult styling", { group: "甜美可爱" }),
    pair("甜酷混搭风", "sweet and edgy mixed styling", { group: "甜美可爱" }),
    pair("甜系洛丽塔", "sweet Lolita styling", { group: "甜美可爱" }),
    pair("轻甜古典风", "light classical sweet styling", { group: "甜美可爱" })
  );

  O.outfit.push(
    pair("奶油色针织开衫与百褶裙", "cream knit cardigan with a pleated skirt", { group: "甜美可爱" }),
    pair("日系宽松毛衣与短裙", "relaxed Japanese-style sweater with a short skirt", { group: "甜美可爱" }),
    pair("娃娃领甜美连衣裙", "sweet dress with a rounded collar", { group: "甜美可爱" }),
    pair("软萌连帽家居套装", "soft hooded loungewear set", { group: "甜美可爱" }),
    pair("甜美蕾丝边针织套装", "sweet knit set with lace trim", { group: "甜美可爱" }),
    pair("甜酷皮夹克与短裙", "sweet edgy cropped jacket with a short skirt", { group: "甜美可爱" }),
    pair("轻甜古典洋装", "light classical sweet dress", { group: "甜美可爱" })
  );

  O.expression.push(
    pair("俏皮微笑", "playful smile", { group: "可爱表情" }),
    pair("害羞甜笑", "shy sweet smile", { group: "可爱表情" }),
    pair("眨眼", "one-eye wink", { group: "可爱表情" }),
    pair("微微嘟嘴", "subtle playful pout", { group: "可爱表情" }),
    pair("鼓腮", "soft cheek puff", { group: "可爱表情" }),
    pair("俏皮偏头", "playful head tilt", { group: "可爱表情" }),
    pair("害羞捂脸", "shy face-covering gesture", { group: "可爱表情" }),
    pair("甜酷轻笑", "sweet yet edgy light smile", { group: "可爱表情" }),
    pair("阿黑颜", "adult ahegao expression", { group: "露点表情", adultOnly: true, intensity: "revealing" }),
    pair("失神表情", "dazed adult expression", { group: "露点表情", adultOnly: true, intensity: "revealing" }),
    pair("眼神涣散", "unfocused adult eyes", { group: "露点表情", adultOnly: true, intensity: "revealing" }),
    pair("半闭眼喘息", "half-lidded adult expression while panting", { group: "露点表情", adultOnly: true, intensity: "revealing" }),
    pair("愉悦表情", "clearly pleasured adult expression", { group: "露点表情", adultOnly: true, intensity: "revealing" }),
    pair("失控表情", "overwhelmed adult expression", { group: "露点表情", adultOnly: true, intensity: "revealing" }),
    pair("强烈反应", "strong adult reaction", { group: "露点表情", adultOnly: true, intensity: "revealing" })
  );

  O.mouthDetail = [
    pair("不指定", ""),
    pair("嘴唇湿润", "moist adult lips", { group: "嘴部细节", adultOnly: true, intensity: "revealing" }),
    pair("轻咬下唇", "gently biting the lower lip", { group: "嘴部细节", adultOnly: true, intensity: "revealing" }),
    pair("微张双唇", "softly parted lips", { group: "嘴部细节", adultOnly: true, intensity: "revealing" }),
    pair("舌头微露", "tongue tip slightly visible", { group: "嘴部细节", adultOnly: true, intensity: "revealing" }),
    pair("吐舌头", "tongue extended out", { group: "嘴部细节", adultOnly: true, intensity: "revealing" }),
    pair("张嘴吐舌", "open mouth with tongue extended", { group: "嘴部细节", adultOnly: true, intensity: "revealing" }),
    pair("嘴角唾液", "saliva at the corner of the mouth", { group: "嘴部细节", adultOnly: true, intensity: "revealing" }),
    pair("唾液拉丝", "a visible saliva strand", { group: "嘴部细节", adultOnly: true, intensity: "revealing" }),
    pair("流口水", "visible drooling", { group: "嘴部细节", adultOnly: true, intensity: "revealing" })
  ];
  O.bodyReaction = [
    pair("不指定", ""),
    pair("面部泛红", "flushed adult face", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("脸颊潮红", "deeply flushed adult cheeks", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("身体潮红", "flushed adult skin across the body", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("轻微薄汗", "a light sheen of sweat on adult skin", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("明显汗湿", "visibly damp adult skin", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("呼吸急促", "rapid adult breathing", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("喘息", "visible adult panting", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("腰部拱起", "back gently arched in response", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("大腿紧绷", "adult thighs visibly tense", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("身体轻微颤抖", "subtle full-body trembling", { group: "身体反应", adultOnly: true, intensity: "revealing" }),
    pair("动作后放松", "relaxing after intense adult response", { group: "身体反应", adultOnly: true, intensity: "revealing" })
  ];
  O.femaleWetness = [
    pair("不指定", ""),
    pair("自然干燥", "naturally dry adult vulva", { promptZh: "成年女性外阴自然干燥", promptEn: "naturally dry adult vulva", adultOnly: true, intensity: "revealing" }),
    pair("轻微湿润", "subtly wet adult vulva", { promptZh: "成年女性外阴轻微湿润", promptEn: "subtly wet adult vulva", adultOnly: true, intensity: "revealing" }),
    pair("明显湿润", "clearly wet adult vulva", { promptZh: "成年女性外阴明显湿润", promptEn: "clearly wet adult vulva", adultOnly: true, intensity: "revealing" }),
    pair("光泽湿润", "glistening adult vaginal wetness", { promptZh: "成年女性外阴呈光泽湿润状态", promptEn: "glistening adult vaginal wetness", adultOnly: true, intensity: "revealing" }),
    pair("可见爱液", "visible adult vaginal lubrication", { promptZh: "可见成年女性爱液", promptEn: "visible adult vaginal lubrication", adultOnly: true, intensity: "revealing" }),
    pair("明显爱液", "pronounced adult vaginal lubrication", { promptZh: "成年女性爱液明显", promptEn: "pronounced adult vaginal lubrication", adultOnly: true, intensity: "revealing" }),
    pair("爱液拉丝", "a visible adult vaginal fluid strand", { promptZh: "成年女性爱液形成可见拉丝", promptEn: "a visible adult vaginal fluid strand", adultOnly: true, intensity: "revealing" }),
    pair("液体滴落", "a slow droplet of adult vaginal fluid", { promptZh: "成年女性爱液缓慢滴落", promptEn: "a slow droplet of adult vaginal fluid", adultOnly: true, intensity: "revealing" })
  ];
  O.garmentDisplacement = [
    pair("不指定", ""),
    pair("服装完整", "garment fully intact"),
    pair("衣襟敞开", "garment open at the front"),
    pair("肩带滑落", "one shoulder strap slipped down", { adultOnly: true, intensity: "revealing" }),
    pair("上衣半脱", "top partially removed", { adultOnly: true, intensity: "revealing" }),
    pair("下装拉低", "lower garment pulled down", { adultOnly: true, intensity: "revealing" }),
    pair("裙摆撩起", "skirt hem lifted", { adultOnly: true, intensity: "revealing" }),
    pair("内衣拉到一侧", "innerwear pulled to one side", { adultOnly: true, intensity: "revealing" }),
    pair("局部衣物移开", "selected clothing moved aside", { adultOnly: true, intensity: "revealing" }),
    pair("保留鞋袜，身体裸露", "shoes and legwear kept on while the body is exposed", { adultOnly: true, intensity: "revealing" }),
    pair("完全脱去", "clothing fully removed", { adultOnly: true, intensity: "revealing" })
  ];

  O.shotSize.push(
    pair("嘴部与面部近景", "mouth and face close-up"),
    pair("面部与下体同框全身构图", "full-body composition with both face and lower body visible", { adultOnly: true, intensity: "revealing" }),
    pair("胸部近景", "chest close-up", { adultOnly: true, intensity: "revealing" }),
    pair("腰胯近景", "waist and hip close-up", { adultOnly: true, intensity: "revealing" }),
    pair("阴部特写", "explicit pussy close-up", { adultOnly: true, intensity: "revealing" })
  );
  O.bodyFocus.push(
    pair("面部与嘴部清晰呈现", "face and mouth clearly presented", { group: "反应焦点" }),
    pair("胸部与身体反应清晰呈现", "chest and visible adult body response in focus", { group: "反应焦点", adultOnly: true, intensity: "revealing" }),
    pair("腰胯与湿润细节清晰呈现", "waist and visible adult arousal detail in focus", { group: "反应焦点", adultOnly: true, intensity: "revealing" })
  );
  O.shotSize.push(
    pair("脚部近景", "foot close-up", { group: "细节特写" }),
    pair("足底特写", "sole close-up", { group: "细节特写" }),
    pair("腿部与丝袜近景", "legwear close-up", { group: "细节特写", adultOnly: true, intensity: "revealing" }),
    pair("肛门特写", "explicit asshole close-up", { group: "露点特写", adultOnly: true, intensity: "revealing" })
  );
  O.bodyFocus.push(
    pair("脚尖、足背与脚踝面向镜头", "toes, instep, and ankle presented toward the camera", { group: "脚部焦点" }),
    pair("足底朝向镜头", "the sole of the foot presented toward the camera", { group: "脚部焦点" }),
    pair("大腿与丝袜线条面向镜头", "thigh and legwear lines presented toward the camera", { group: "腿部焦点", adultOnly: true, intensity: "revealing" }),
    pair("后庭与臀部清晰呈现", "the ass and asshole clearly presented toward the camera", { group: "露点焦点", adultOnly: true, intensity: "revealing" }),
    pair("双人互动关系清晰呈现", "the two adults and their interaction clearly framed", { group: "多人焦点" }),
    pair("三人空间关系清晰呈现", "all three adults and their spatial relationship clearly framed", { group: "多人焦点" })
  );
  O.cameraPlan = [
    pair("不指定", ""),
    pair("自定义镜头", "custom camera plan", { group: "基础" }),
    pair("电影全身", "cinematic full-body plan", {
      group: "通用镜头",
      plan: { shotSize: "full-body shot", bodyFocus: "the full-body proportions and center of gravity facing the camera", angle: "eye-level camera", lens: "50mm natural-perspective lens", composition: "rule-of-thirds composition", depthOfField: "shallow depth of field", people: 1, weight: 7 }
    }),
    pair("私房半身", "boudoir medium plan", {
      group: "通用镜头",
      plan: { shotSize: "medium shot", bodyFocus: "the chest contour and waistline forming a clear curve toward the camera", angle: "eye-level camera", lens: "85mm portrait lens", composition: "intimate close framing", depthOfField: "shallow depth of field", people: 1, weight: 6 }
    }),
    pair("面部情绪特写", "facial expression close-up plan", {
      group: "通用镜头",
      plan: { shotSize: "close-up portrait", bodyFocus: "the face and jawline angled toward the camera", angle: "eye-level camera", lens: "85mm portrait lens", composition: "intimate close framing", depthOfField: "shallow depth of field", people: 1, requiresFace: true, weight: 5 }
    }),
    pair("嘴部与唾液近景", "mouth and saliva close-up plan", {
      group: "反应镜头",
      plan: { shotSize: "mouth and face close-up", bodyFocus: "face and mouth clearly presented", angle: "eye-level camera", lens: "100mm macro lens", composition: "centered symmetrical composition", depthOfField: "shallow depth of field", people: 1, requiresFace: true, adultOnly: true, weight: 4 }
    }),
    pair("胸部近景", "chest close-up plan", {
      group: "细节镜头",
      plan: { shotSize: "chest close-up", bodyFocus: "an explicit composition clearly presenting the nipples and chest", angle: "eye-level camera", lens: "85mm portrait lens", composition: "intimate close framing", depthOfField: "shallow depth of field", people: 1, requiresFace: true, requiresReveal: true, weight: 4 }
    }),
    pair("腰胯与内裤", "waist and lingerie plan", {
      group: "细节镜头",
      plan: { shotSize: "waist and hip close-up", bodyFocus: "the side waist and hip line turned toward the camera", angle: "eye-level camera", lens: "70mm portrait lens", composition: "centered symmetrical composition", depthOfField: "shallow depth of field", people: 1, adultOnly: true, weight: 4 }
    }),
    pair("腿部与丝袜", "legwear close-up plan", {
      group: "细节镜头",
      plan: { shotSize: "legwear close-up", bodyFocus: "thigh and legwear lines presented toward the camera", angle: "low-angle camera", lens: "85mm portrait lens", composition: "dynamic diagonal composition", depthOfField: "shallow depth of field", people: 1, adultOnly: true, weight: 4 }
    }),
    pair("脚部展示", "foot close-up plan", {
      group: "脚部镜头",
      plan: { shotSize: "foot close-up", bodyFocus: "toes, instep, and ankle presented toward the camera", angle: "ground-level camera position", lens: "100mm macro lens", composition: "intimate close framing", depthOfField: "shallow depth of field", people: 1, weight: 4 }
    }),
    pair("足底特写", "sole close-up plan", {
      group: "脚部镜头",
      plan: { shotSize: "sole close-up", bodyFocus: "the sole of the foot presented toward the camera", angle: "high-angle camera", lens: "100mm macro lens", composition: "centered symmetrical composition", depthOfField: "shallow depth of field", people: 1, weight: 3 }
    }),
    pair("阴部特写", "vulva close-up plan", {
      group: "露点镜头",
      plan: { shotSize: "explicit pussy close-up", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", angle: "eye-level camera", lens: "100mm macro lens", composition: "centered symmetrical composition", depthOfField: "shallow depth of field", people: 1, requiresFace: false, requiresLowerBody: true, adultOnly: true, weight: 4 }
    }),
    pair("肛门特写", "anal close-up plan", {
      group: "露点镜头",
      plan: { shotSize: "explicit asshole close-up", bodyFocus: "the ass and asshole clearly presented toward the camera", angle: "forty-five degrees from behind the shoulder", lens: "100mm macro lens", composition: "centered symmetrical composition", depthOfField: "shallow depth of field", people: 1, requiresRear: true, requiresLowerBody: true, adultOnly: true, weight: 3 }
    }),
    pair("面部与下体同框", "face and lower-body full-frame plan", {
      group: "露点镜头",
      plan: { shotSize: "full-body composition with both face and lower body visible", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", angle: "eye-level camera", lens: "50mm natural-perspective lens", composition: "centered symmetrical composition", depthOfField: "shallow depth of field", people: 1, requiresLowerBody: true, requiresFace: true, adultOnly: true, weight: 4 }
    }),
    pair("双人动作中景", "two-person action medium plan", {
      group: "多人镜头",
      plan: { shotSize: "two-shot medium framing", bodyFocus: "the two adults and their interaction clearly framed", angle: "eye-level camera", lens: "50mm natural-perspective lens", composition: "centered symmetrical composition", depthOfField: "shallow depth of field", people: 2, weight: 5 }
    }),
    pair("三人动作中远景", "three-person action wide plan", {
      group: "多人镜头",
      plan: { shotSize: "medium wide shot", bodyFocus: "all three adults and their spatial relationship clearly framed", angle: "eye-level camera", lens: "35mm documentary lens", composition: "rule-of-thirds composition", depthOfField: "deep focus throughout the frame", people: 3, weight: 4 }
    })
  ];

  O.revealMode.push(
    pair("阴茎清晰可见", "cock clearly visible", { mode: "visibility", target: "maleGenitals", adultOnly: true, intensity: "revealing" }),
    pair("阴茎与阴囊清晰可见", "cock and balls clearly visible", { mode: "visibility", target: "maleGenitals", adultOnly: true, intensity: "revealing" })
  );
  O.revealAction.push(
    pair("正面站立自然展示", "standing frontally with the cock and balls fully exposed", { modes: ["visibility"], targets: ["maleGenitals"], adultOnly: true, intensity: "revealing", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit composition clearly presenting the cock and balls", shotSize: "full-body shot" }),
    pair("四分之三侧身展示", "presenting the cock and balls in a three-quarter view", { modes: ["visibility"], targets: ["maleGenitals"], adultOnly: true, intensity: "revealing", bodyOrientation: "three-quarter view from the front left", bodyFocus: "an explicit composition clearly presenting the cock and balls", shotSize: "cowboy shot" }),
    pair("坐姿单腿伸展展示", "seated with one leg extended, the cock and balls fully exposed", { modes: ["visibility"], targets: ["maleGenitals"], adultOnly: true, intensity: "revealing", bodyOrientation: "seated facing the camera", bodyFocus: "an explicit composition clearly presenting the cock and balls", shotSize: "full-body shot" }),
    pair("浴巾缓慢松开", "slowly loosening the towel to bare the cock and balls", { modes: ["visibility"], targets: ["maleGenitals"], adultOnly: true, intensity: "revealing", handPose: "one hand holding the edge of a towel", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit composition clearly presenting the cock and balls", shotSize: "cowboy shot" })
  );
  O.revealAction.push(
    pair("正面站立自然展露下体", "standing frontally with the pussy fully exposed", { modes: ["visibility"], targets: ["vulva"], adultOnly: true, intensity: "revealing", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", shotSize: "explicit pussy close-up" }),
    pair("背身弯腰自然展露后庭", "bending forward with the ass and asshole presented toward the camera", { modes: ["visibility"], targets: ["anus"], adultOnly: true, intensity: "revealing", bodyOrientation: "viewed from behind", bodyFocus: "the ass and asshole clearly presented toward the camera", shotSize: "explicit asshole close-up" })
  );

  const cameraPlanBehaviors = {
    "cinematic full-body plan": {
      pose: "standing naturally",
      action: "subtle breathing and natural blinking",
      poseReveal: "standing frontal adult presentation",
      actionReveal: "slowly and confidently presenting the body with explicit adult intent"
    },
    "boudoir medium plan": {
      pose: "sitting on the edge of a bed",
      action: "subtle breathing and natural blinking",
      poseReveal: "sitting on the edge of the bed in an adult presentation",
      actionReveal: "slowly and confidently presenting the body with explicit adult intent"
    },
    "facial expression close-up plan": {
      pose: "standing naturally",
      action: "subtle breathing and natural blinking",
      poseReveal: "standing frontal adult presentation",
      actionReveal: "slowly and confidently presenting the body with explicit adult intent",
      expression: "adult ahegao expression",
      mouthDetail: "a visible saliva strand",
      bodyOrientation: "facing the camera directly"
    },
    "mouth and saliva close-up plan": {
      pose: "standing frontal adult presentation",
      action: "slowly and confidently presenting the body with explicit adult intent",
      expression: "adult ahegao expression",
      mouthDetail: "a visible saliva strand",
      bodyOrientation: "facing the camera directly"
    },
    "chest close-up plan": {
      pose: "a supported reclining adult pose with the torso and hips opened toward the camera",
      action: "slowly and confidently presenting the body with explicit adult intent",
      bodyOrientation: "facing the camera directly",
      revealMode: "both nipples clearly visible",
      revealAction: "leaning forward to push the bare tits toward the camera"
    },
    "waist and lingerie plan": {
      pose: "sitting on the edge of the bed in an adult presentation",
      action: "slowly and confidently presenting the body with explicit adult intent",
      bodyOrientation: "three-quarter view from the front left",
      legPose: "one leg placed forward"
    },
    "legwear close-up plan": {
      pose: "sitting on the edge of the bed in an adult presentation",
      action: "subtle breathing and natural blinking",
      revealAction: "lifting one leg to emphasize the leg line",
      bodyOrientation: "three-quarter view from the front right",
      legPose: "legs extended forward"
    },
    "foot close-up plan": {
      pose: "sitting on the edge of the bed in an adult presentation",
      action: "subtle breathing and natural blinking",
      revealAction: "lifting one leg to emphasize the leg line",
      bodyOrientation: "three-quarter view from the front left",
      legPose: "legs extended forward"
    },
    "sole close-up plan": {
      pose: "sitting on the edge of the bed in an adult presentation",
      action: "subtle breathing and natural blinking",
      revealAction: "lifting one leg to emphasize the leg line",
      bodyOrientation: "three-quarter view from the front right",
      legPose: "one knee drawn upward"
    },
    "vulva close-up plan": {
      pose: "a side-lying adult pose with the hips lifted and the full body line presented to the camera",
      action: "slowly and confidently presenting the body with explicit adult intent",
      bodyOrientation: "lying on one side and facing the camera",
      revealMode: "pussy clearly visible",
      revealAction: "lying on one side, lifting the upper leg and spreading the pussy open to the camera",
      requiresLowerBody: true
    },
    "anal close-up plan": {
      pose: "bending slightly with the back turned in an adult presentation",
      action: "slowly and confidently presenting the body with explicit adult intent",
      bodyOrientation: "viewed from behind",
      revealMode: "asshole clearly visible",
      revealAction: "bending forward with the ass and asshole presented toward the camera",
      requiresRear: true,
      requiresLowerBody: true
    },
    "face and lower-body full-frame plan": {
      pose: "standing frontal adult presentation",
      action: "slowly and confidently presenting the body with explicit adult intent",
      bodyOrientation: "facing the camera directly",
      revealMode: "pussy clearly visible",
      revealAction: "standing frontally with the pussy fully exposed",
      requiresLowerBody: true
    },
    "two-person action medium plan": {
      pose: "two consenting adults in a close intertwined intimate pose",
      action: "explicit mutual adult response with one partner guiding and the other actively responding"
    },
    "three-person action wide plan": {
      pose: "three consenting adults arranged in a layered intimate composition with clear foreground and background roles",
      action: "three consenting adults maintaining coordinated mutual adult responsiveness"
    }
  };
  for (const item of O.cameraPlan) {
    if (cameraPlanBehaviors[item.en]) {
      item.plan = { ...item.plan, ...cameraPlanBehaviors[item.en] };
    }
  }

  O.adultProp = [
    pair("不指定", ""),
    pair("未拆封避孕套", "an unopened condom wrapper", { adultOnly: true, intensity: "revealing", propGroup: "避孕套", targets: ["body", "chest", "vulva", "anus", "legwear", "feet"] }),
    pair("拆开的避孕套包装", "an opened condom wrapper", { adultOnly: true, intensity: "revealing", propGroup: "避孕套", targets: ["body", "chest", "vulva", "anus", "legwear", "feet"] }),
    pair("手里的卷状避孕套", "a rolled condom held in one hand", { adultOnly: true, intensity: "revealing", propGroup: "避孕套", targets: ["body", "chest", "vulva", "legwear"] }),
    pair("已佩戴避孕套", "a condom being used during consensual adult intimacy", { adultOnly: true, intensity: "revealing", propGroup: "避孕套", people: 2, targets: ["body", "vulva"] }),
    pair("床边的震动棒", "a vibrator resting on the bedding nearby", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "chest", "vulva", "anus"] }),
    pair("手持震动棒", "a vibrator held in one hand", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "chest", "vulva", "legwear"] }),
    pair("按摩棒贴近身体", "a wand vibrator held close to the body", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "chest", "vulva"] }),
    pair("手持遥控跳蛋", "a remote-control egg vibrator held in one hand", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "vulva", "legwear"] }),
    pair("吸吮玩具贴近身体", "a suction toy held close to the body", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["chest", "vulva"] }),
    pair("震动棒正在使用", "a vibrator pressed against the body during a solo adult scene", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "vulva"] }),
    pair("按摩棒持续刺激", "a wand vibrator in active adult use against the body", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "chest", "vulva"] }),
    pair("吸吮玩具正在使用", "a suction toy in active solo adult use", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["chest", "vulva"] }),
    pair("放置的假阳具", "a dildo resting beside the body", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "vulva"] }),
    pair("放置的双头玩具", "a dual-ended toy resting nearby", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "vulva"] }),
    pair("假阳具主动使用", "a dildo in active solo adult use", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["vulva"] }),
    pair("放置的肛塞", "an anal plug placed beside the body", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "anus"] }),
    pair("手持串珠玩具", "anal beads held in one hand", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["body", "anus"] }),
    pair("串珠玩具主动使用", "anal beads in active solo adult use", { adultOnly: true, intensity: "revealing", propGroup: "情趣玩具", targets: ["anus"] }),
    pair("旁边的软质束缚带", "soft restraints placed nearby", { adultOnly: true, intensity: "revealing", propGroup: "束缚与氛围", targets: ["body", "chest", "legwear"] }),
    pair("手持眼罩", "a blindfold held in one hand", { adultOnly: true, intensity: "revealing", propGroup: "束缚与氛围", targets: ["body", "chest"] }),
    pair("项圈与牵引绳", "a collar with a leash", { adultOnly: true, intensity: "revealing", propGroup: "束缚与氛围", targets: ["body", "chest"] }),
    pair("床边润滑液", "a bottle of lubricant on the bedside table", { adultOnly: true, intensity: "revealing", propGroup: "辅助用品", targets: ["body", "chest", "vulva"] }),
    pair("旁边按摩油", "a bottle of massage oil nearby", { adultOnly: true, intensity: "revealing", propGroup: "辅助用品", targets: ["body", "chest", "legwear"] }),
    pair("折叠毛巾", "a folded towel nearby", { adultOnly: true, intensity: "revealing", propGroup: "辅助用品", targets: ["body", "chest", "vulva", "anus", "legwear", "feet"] })
  ];

  const REVEAL_TARGETS = [
    { key: "all", zh: "全部重点", group: "浏览" },
    { key: "body", zh: "身体线条", group: "身材与姿态" },
    { key: "chest", zh: "胸部 / 乳头", group: "身体重点" },
    { key: "vulva", zh: "阴部", group: "身体重点" },
    { key: "anus", zh: "肛门 / 后庭", group: "身体重点" },
    { key: "legwear", zh: "腿部 / 丝袜", group: "服饰重点" },
    { key: "feet", zh: "足部", group: "服饰重点" }
  ];

  const REVEAL_INTENSITIES = [
    { key: "all", zh: "自动推荐" },
    { key: "tease", zh: "挑逗" },
    { key: "display", zh: "明确展示" },
    { key: "intense", zh: "高强互动" }
  ];

  const REVEAL_POSES = [
    {
      key: "standing-front",
      zh: "正面站立展示",
      targets: ["body", "chest", "vulva", "legwear"],
      intensities: ["display"],
      fields: {
        pose: "standing frontal adult presentation",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "facing the camera directly",
        gaze: "an openly desiring adult gaze directed into the camera"
      }
    },
    {
      key: "standing-side",
      zh: "侧身展示曲线",
      targets: ["body", "chest", "legwear"],
      intensities: ["tease", "display"],
      fields: {
        pose: "standing in a three-quarter adult presentation",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "a sustained intense adult gaze locked on the camera"
      }
    },
    {
      key: "window-lean",
      zh: "窗边倚靠展示",
      targets: ["body", "chest"],
      intensities: ["tease", "display"],
      fields: {
        pose: "leaning by a window in an adult presentation",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "three-quarter view from the front right",
        gaze: "an openly desiring adult gaze directed into the camera"
      }
    },
    {
      key: "bedside-sit",
      zh: "床沿坐姿展示",
      targets: ["body", "chest", "vulva", "legwear", "feet"],
      intensities: ["tease", "display"],
      fields: {
        pose: "sitting on the edge of the bed in an adult presentation",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "facing the camera directly",
        gaze: "an openly desiring adult gaze directed into the camera"
      }
    },
    {
      key: "recline-open",
      zh: "后仰舒展展示",
      targets: ["body", "chest", "vulva"],
      intensities: ["display", "intense"],
      fields: {
        pose: "a supported reclining adult pose with the torso and hips opened toward the camera",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "facing the camera directly",
        gaze: "a sustained intense adult gaze locked on the camera"
      }
    },
    {
      key: "side-hip",
      zh: "侧卧抬髋展示",
      targets: ["body", "vulva", "legwear"],
      intensities: ["display", "intense"],
      fields: {
        pose: "a side-lying adult pose with the hips lifted and the full body line presented to the camera",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "lying on one side and facing the camera",
        gaze: "a sustained intense adult gaze locked on the camera"
      }
    },
    {
      key: "kneel-present",
      zh: "跪姿主动展示",
      targets: ["body", "chest"],
      intensities: ["display"],
      fields: {
        pose: "an upright kneeling adult pose with an openly inviting presentation toward the camera",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "facing the camera directly",
        gaze: "an openly desiring adult gaze directed into the camera",
        legPose: ""
      }
    },
    {
      key: "sofa-side",
      zh: "沙发侧坐展示",
      targets: ["body", "legwear"],
      intensities: ["tease", "display"],
      fields: {
        pose: "sitting sideways on a sofa in an adult presentation",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "a sustained intense adult gaze locked on the camera"
      }
    },
    {
      key: "back-look",
      zh: "背身回望展示",
      targets: ["body", "anus"],
      intensities: ["tease", "display"],
      fields: {
        pose: "standing with the back turned while looking back in an adult presentation",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "viewed from behind while looking back",
        gaze: "a sustained intense adult gaze locked on the camera"
      }
    },
    {
      key: "rear-bend",
      zh: "背身弯腰展示",
      targets: ["anus"],
      intensities: ["intense"],
      fields: {
        pose: "bending slightly with the back turned in an adult presentation",
        action: "slowly and confidently presenting the body with explicit adult intent",
        bodyOrientation: "viewed from behind",
        gaze: "a sustained intense adult gaze locked on the camera"
      }
    }
  ];

  const REVEAL_TARGET_CAMERAS = {
    all: ["cinematic full-body plan", "boudoir medium plan", "waist and lingerie plan", "chest close-up plan", "vulva close-up plan", "anal close-up plan", "legwear close-up plan", "foot close-up plan"],
    body: ["cinematic full-body plan", "boudoir medium plan", "waist and lingerie plan"],
    chest: ["chest close-up plan", "boudoir medium plan"],
    vulva: ["vulva close-up plan", "face and lower-body full-frame plan"],
    anus: ["anal close-up plan", "face and lower-body full-frame plan"],
    legwear: ["legwear close-up plan", "cinematic full-body plan"],
    feet: ["foot close-up plan", "sole close-up plan"]
  };

  const REVEAL_CAMERA_INTENSITIES = {
    "cinematic full-body plan": ["tease", "display", "intense"],
    "boudoir medium plan": ["tease", "display"],
    "waist and lingerie plan": ["display"],
    "chest close-up plan": ["display", "intense"],
    "vulva close-up plan": ["intense"],
    "anal close-up plan": ["intense"],
    "face and lower-body full-frame plan": ["intense"],
    "legwear close-up plan": ["tease", "display"],
    "foot close-up plan": ["tease", "display"],
    "sole close-up plan": ["tease", "display"]
  };

  const REVEAL_SCENARIOS = [
    {
      key: "bedside-slip",
      zh: "床边肩带滑落",
      group: "挑逗",
      target: "body",
      cameraPlan: "boudoir medium plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "quiet suggestive atmosphere",
        atmosphere: "soft steam",
        visualStyle: "tasteful boudoir photography",
        garmentDisplacement: "one shoulder strap slipped down",
        pose: "reclining on one side, propped on one elbow",
        bodyOrientation: "lying on one side and facing the camera",
        gaze: "subtle side glance",
        expression: "soft parted lips",
        handPose: "one hand supporting the body",
        legPose: "legs held together while lying on one side",
        revealMode: "body-line presentation",
        revealAction: "leaning back to emphasize the torso and waistline"
      }
    },
    {
      key: "mirror-curve",
      zh: "镜前曲线展示",
      group: "挑逗",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "in front of a dressing-room mirror",
        lighting: "vanity mirror lighting",
        mood: "restrained longing atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "mirror portrait",
        garmentDisplacement: "one shoulder strap slipped down",
        pose: "standing in a three-quarter adult presentation",
        bodyOrientation: "front-facing reflection in a mirror",
        gaze: "subtle side glance",
        handPose: "one hand resting near the collarbone",
        legPose: "weight shifted onto one leg",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line"
      }
    },
    {
      key: "window-silhouette",
      zh: "窗边薄纱轮廓",
      group: "挑逗",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "an apartment with floor-to-ceiling windows",
        lighting: "side-window rim light",
        mood: "restrained longing atmosphere",
        atmosphere: "volumetric light rays",
        visualStyle: "intimate editorial portrait",
        garmentDisplacement: "garment open at the front",
        pose: "leaning against a floor-to-ceiling window",
        bodyOrientation: "facing the camera directly",
        gaze: "subtle side glance",
        handPose: "one hand resting near the collarbone",
        legPose: "weight shifted onto one leg",
        revealMode: "body-line presentation",
        revealAction: "leaning back to emphasize the torso and waistline"
      }
    },
    {
      key: "chinese-courtyard",
      zh: "古风庭院回眸",
      group: "挑逗",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a moonlit Chinese courtyard",
        lighting: "clustered candlelight",
        mood: "quiet suggestive atmosphere",
        atmosphere: "thin atmospheric haze",
        visualStyle: "historical Chinese drama look",
        garmentDisplacement: "one shoulder strap slipped down",
        pose: "standing with the back turned while looking back in an adult presentation",
        bodyOrientation: "viewed from behind while looking back",
        gaze: "a backward glance over the shoulder toward the camera",
        handPose: "one hand resting near the collarbone",
        legPose: "weight shifted onto one leg",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line"
      }
    },
    {
      key: "sofa-presentation",
      zh: "沙发慵懒展示",
      group: "明确展示",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a studio lounge with a large sofa",
        lighting: "a pool of warm floor-lamp light",
        mood: "cinematic tension",
        atmosphere: "soft glowing highlights",
        visualStyle: "premium glamour portrait",
        garmentDisplacement: "garment open at the front",
        pose: "sitting sideways on a sofa in an adult presentation",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "an openly desiring adult gaze directed into the camera",
        bodyFocus: "an explicit adult composition emphasizing the hips and upper front body line",
        handPose: "one hand supporting the body",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line"
      }
    },
    {
      key: "bathroom-full-body",
      zh: "浴室全身展示",
      group: "明确展示",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a marble bathroom filled with soft steam",
        lighting: "soft light through bathroom steam",
        mood: "cinematic tension",
        atmosphere: "soft steam",
        visualStyle: "premium glamour portrait",
        garmentDisplacement: "selected clothing moved aside",
        pose: "standing frontal adult presentation",
        bodyOrientation: "facing the camera directly",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "dazed adult expression",
        handPose: "one hand resting near the collarbone",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line",
        action: "slowly and confidently presenting the body with explicit adult intent"
      }
    },
    {
      key: "bed-chest",
      zh: "床榻胸部展示",
      group: "明确展示",
      target: "chest",
      cameraPlan: "chest close-up plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "humid ambiguity",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "top partially removed",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "half-lidded adult expression while panting",
        bodyFocus: "an explicit composition clearly presenting the nipples and chest",
        handPose: "",
        legPose: "legs spread wide apart",
        revealMode: "bare tits and nipples clearly visible",
        revealAction: "lifting both tits toward the camera in an explicit presentation"
      }
    },
    {
      key: "bed-vulva",
      zh: "床榻下体展示",
      group: "高强展示",
      target: "vulva",
      cameraPlan: "vulva close-up plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "humid ambiguity",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "innerwear pulled to one side",
        pose: "a fully open reclining adult pose with the body extended toward the camera",
        bodyOrientation: "lying with the legs open toward the camera",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "dazed adult expression",
        bodyFocus: "an explicit composition clearly presenting the spread pussy",
        handPose: "",
        legPose: "both knees pulled back toward the chest",
        revealMode: "pussy lips spread open toward the camera",
        revealAction: "pulling the pussy lips apart with both hands toward the camera"
      }
    },
    {
      key: "bed-face-lower",
      zh: "床榻面体同框",
      group: "高强展示",
      target: "vulva",
      cameraPlan: "face and lower-body full-frame plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "humid ambiguity",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "innerwear pulled to one side",
        pose: "a supported reclining adult pose with the torso and hips opened toward the camera",
        bodyOrientation: "lying with the legs open toward the camera",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "half-lidded adult expression while panting",
        bodyFocus: "an explicit composition clearly presenting the spread pussy",
        handPose: "",
        legPose: "both knees pulled back toward the chest",
        revealMode: "nipples and pussy both clearly visible",
        revealAction: "lying on the back and pulling both knees back to open the pussy to the camera"
      }
    },
    {
      key: "rear-mirror",
      zh: "镜前后庭展示",
      group: "高强展示",
      target: "anus",
      cameraPlan: "anal close-up plan",
      fields: {
        scene: "a bedroom with a large mirror",
        lighting: "soft reflected mirror light",
        mood: "humid ambiguity",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "innerwear pulled to one side",
        pose: "kneeling at the foot of the bed",
        bodyOrientation: "bent over with the ass toward the camera",
        gaze: "a backward glance over the shoulder toward the camera",
        bodyFocus: "an explicit rear composition clearly presenting the spread asshole",
        handPose: "",
        legPose: "kneeling with the knees apart",
        revealMode: "asshole spread open toward the camera",
        revealAction: "reaching back and spreading the ass cheeks apart toward the camera"
      }
    },
    {
      key: "rear-kneel",
      zh: "跪姿后腰展示",
      group: "高强展示",
      target: "anus",
      cameraPlan: "anal close-up plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "quiet suggestive atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "innerwear pulled to one side",
        pose: "bending slightly with the back turned in an adult presentation",
        bodyOrientation: "viewed from behind",
        gaze: "a backward glance over the shoulder toward the camera",
        bodyFocus: "an explicit rear composition clearly presenting the ass and asshole",
        handPose: "",
        legPose: "legs spread wide apart",
        revealMode: "ass cheeks and asshole clearly visible",
        revealAction: "kneeling with the hips pushed back and the asshole presented to the camera"
      }
    },
    {
      key: "legwear-vanity",
      zh: "镜前腿袜展示",
      group: "服饰展示",
      target: "legwear",
      cameraPlan: "legwear close-up plan",
      fields: {
        scene: "in front of a dressing-room mirror",
        lighting: "vanity mirror lighting",
        mood: "quiet suggestive atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "premium glamour portrait",
        garmentDisplacement: "one shoulder strap slipped down",
        pose: "sitting on a chair and leaning forward with an adult presentation",
        bodyOrientation: "three-quarter view from the front right",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand supporting the body",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "lifting one leg to emphasize the leg line"
      }
    },
    {
      key: "foot-bedside",
      zh: "床沿足部展示",
      group: "服饰展示",
      target: "feet",
      cameraPlan: "foot close-up plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "quiet suggestive atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "premium glamour portrait",
        pose: "sitting on the edge of the bed with the feet down",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand supporting the body",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "lifting one leg to emphasize the leg line"
      }
    },
    {
      key: "intense-bed-play",
      zh: "床榻高强互动",
      group: "高强展示",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "high-intensity adult erotic tension",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "selected clothing moved aside",
        pose: "a supported reclining adult pose with the torso and hips opened toward the camera",
        bodyOrientation: "facing the camera directly",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "half-lidded adult expression while panting",
        bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs",
        handPose: "one hand supporting the body",
        legPose: "both knees pulled back toward the chest",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line"
      }
    },
    {
      key: "chest-mirror-intense",
      zh: "镜前胸部高强展示",
      group: "高强展示",
      target: "chest",
      cameraPlan: "chest close-up plan",
      fields: {
        scene: "a bedroom with a large mirror",
        lighting: "soft reflected mirror light",
        mood: "private and intensely passionate adult atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "top partially removed",
        bodyOrientation: "front-facing reflection in a mirror",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "half-lidded adult expression while panting",
        bodyFocus: "an explicit composition clearly presenting the nipples and chest",
        handPose: "",
        legPose: "legs spread wide apart",
        revealMode: "bare tits and nipples clearly visible",
        revealAction: "pinching one nipple between the fingers while facing the camera"
      }
    },
    {
      key: "legwear-tease",
      zh: "镜前腿袜挑逗",
      group: "挑逗",
      target: "legwear",
      cameraPlan: "legwear close-up plan",
      fields: {
        scene: "in front of a dressing-room mirror",
        lighting: "vanity mirror lighting",
        mood: "quiet suggestive atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "tasteful boudoir photography",
        garmentDisplacement: "one shoulder strap slipped down",
        pose: "sitting on a chair and leaning forward with an adult presentation",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "subtle side glance",
        handPose: "one hand supporting the body",
        legPose: "legs casually crossed",
        revealMode: "body-line presentation",
        revealAction: "lifting one leg to emphasize the leg line"
      }
    },
    {
      key: "foot-tease",
      zh: "床沿足部挑逗",
      group: "挑逗",
      target: "feet",
      cameraPlan: "foot close-up plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "quiet suggestive atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "tasteful boudoir photography",
        pose: "sitting on the edge of the bed with the feet down",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "subtle side glance",
        handPose: "one hand supporting the body",
        legPose: "legs casually crossed",
        revealMode: "body-line presentation",
        revealAction: "lifting one leg to emphasize the leg line"
      }
    }
  ];

  O.stylePreset = Object.entries(STYLE_PRESETS).map(([key, item]) =>
    pair(item.zh, key, { group: item.group })
  );
  O.stylePreset.unshift(
    pair("不指定", ""),
    pair("自定义风格", "custom style", { group: "基础" })
  );
  O.styleLook = [
    pair("不指定", ""),
    pair("自定义搭配", "custom style look", { group: "基础" }),
    ...Object.values(STYLE_LOOKS).map((look) =>
      pair(look.zh, look.key, { group: STYLE_PRESETS[look.styleKey]?.zh || "搭配", styleKey: look.styleKey, adultOnly: look.adultOnly, intensity: look.intensity })
    )
  ];
  O.outfitState = [
    pair("穿衣", "dressed"),
    pair("裸体", "nude")
  ];
  O.appearance.push(
    pair("中国地域面貌", "Chinese regional facial features")
  );

  // ===== 露点内容补全 2026-11-14 =====
  // 一、补齐此前被露出动作引用、但从未定义过的选项（否则 applyRevealActionDefaults 静默失效）
  O.bodyFocus.push(
    pair("前裆上缘与阴阜清晰可见", "the upper front crotch and pussy mound clearly visible", { group: "露点目标", adultOnly: true, intensity: "revealing" }),
    pair("男性下体清晰呈现", "an explicit composition clearly presenting the cock and balls", { group: "露点目标", adultOnly: true, intensity: "revealing" }),
    pair("臀部与后庭朝向镜头", "the ass and asshole clearly presented toward the camera", { group: "露点目标", adultOnly: true, intensity: "revealing" }),
    pair("张开阴部特写呈现", "an explicit composition clearly presenting the spread pussy", { group: "露点目标", adultOnly: true, intensity: "revealing" }),
    pair("后庭张开呈现", "an explicit rear composition clearly presenting the spread asshole", { group: "露点目标", adultOnly: true, intensity: "revealing" }),
    pair("湿润阴部呈现", "an explicit composition clearly presenting the visibly wet pussy", { group: "露点目标", adultOnly: true, intensity: "revealing" }),
    pair("全身裸露一览", "an explicit full-body composition with every part uncovered", { group: "露点目标", adultOnly: true, intensity: "revealing" })
  );

  O.bodyOrientation.push(
    pair("坐姿正面朝向镜头", "seated facing the camera", { group: "露点朝向", adultOnly: true, intensity: "revealing" }),
    pair("躺姿开腿朝向镜头", "lying with the legs open toward the camera", { group: "露点朝向", adultOnly: true, intensity: "revealing" }),
    pair("跪姿背身回望镜头", "kneeling with the back to the camera and looking back", { group: "露点朝向", adultOnly: true, intensity: "revealing" }),
    pair("弯腰臀部朝向镜头", "bent over with the ass toward the camera", { group: "露点朝向", adultOnly: true, intensity: "revealing" }),
    pair("镜中正面开腿", "mirrored frontal view with the legs open", { group: "露点朝向", adultOnly: true, intensity: "revealing" })
  );

  O.handPose.push(
    pair("手捏浴巾边缘", "one hand holding the edge of a towel", { group: "露点手部", adultOnly: true, intensity: "revealing" }),
    pair("双手拨开内裤", "both hands pulling the panties aside", { group: "露点手部", adultOnly: true, intensity: "revealing" }),
    pair("双手拉开臀瓣", "both hands spreading the ass cheeks apart", { group: "露点手部", adultOnly: true, intensity: "revealing" }),
    pair("双手托起胸部", "both hands lifting the tits", { group: "露点手部", adultOnly: true, intensity: "revealing" }),
    pair("手指拉开阴唇", "fingers spreading the pussy lips apart", { group: "露点手部", adultOnly: true, intensity: "revealing" }),
    pair("一手勾住膝后", "one hand hooked behind the knee", { group: "露点手部", adultOnly: true, intensity: "revealing" })
  );

  O.legPose.push(
    pair("双腿张开", "legs spread wide apart", { group: "露点腿部", adultOnly: true, intensity: "revealing" }),
    pair("单腿抬高", "one leg lifted high", { group: "露点腿部", adultOnly: true, intensity: "revealing" }),
    pair("双膝压向胸口", "both knees pulled back toward the chest", { group: "露点腿部", adultOnly: true, intensity: "revealing" }),
    pair("跪姿双膝分开", "kneeling with the knees apart", { group: "露点腿部", adultOnly: true, intensity: "revealing" }),
    pair("俯卧抬腿", "lying face down with the legs lifted behind", { group: "露点腿部", adultOnly: true, intensity: "revealing" })
  );

  // 二、露现方式：在既有五类 mode 下补直白部位（append，保证既有自动补齐仍取到原首条）
  O.revealMode.push(
    pair("阴部与后庭同框", "pussy and asshole both clearly visible", { mode: "visibility", target: "vulva", adultOnly: true, intensity: "revealing" }),
    pair("阴唇张开展示", "pussy lips spread open toward the camera", { mode: "visibility", target: "vulva", adultOnly: true, intensity: "revealing" }),
    pair("阴蒂清晰可见", "clit clearly visible", { mode: "visibility", target: "vulva", adultOnly: true, intensity: "revealing" }),
    pair("湿润状态可见", "wet pussy clearly visible with visible slick", { mode: "visibility", target: "vulva", adultOnly: true, intensity: "revealing" }),
    pair("后庭张开展示", "asshole spread open toward the camera", { mode: "visibility", target: "anus", adultOnly: true, intensity: "revealing" }),
    pair("臀瓣与后庭同框", "ass cheeks and asshole clearly visible", { mode: "visibility", target: "anus", adultOnly: true, intensity: "revealing" }),
    pair("裸胸与乳头可见", "bare tits and nipples clearly visible", { mode: "visibility", target: "nipples", adultOnly: true, intensity: "revealing" }),
    pair("乳头与阴部同框", "nipples and pussy both clearly visible", { mode: "visibility", target: "nipples", adultOnly: true, intensity: "revealing" }),
    pair("勃起状态可见", "hard erect cock clearly visible", { mode: "visibility", target: "maleGenitals", adultOnly: true, intensity: "revealing" }),
    pair("男性下体全开放", "cock, balls and asshole all clearly visible", { mode: "visibility", target: "maleGenitals", adultOnly: true, intensity: "revealing" }),
    pair("全身正面裸露", "fully nude front clearly visible", { mode: "visibility", target: "body", adultOnly: true, intensity: "revealing" }),
    pair("全身背面裸露", "fully nude rear clearly visible", { mode: "visibility", target: "body", adultOnly: true, intensity: "revealing" }),
    pair("内裤拨开露阴", "panties pulled aside to bare the pussy", { mode: "opening", target: "vulva", adultOnly: true, intensity: "revealing" }),
    pair("上衣掀起露胸", "top pulled up to bare the tits", { mode: "opening", target: "nipples", adultOnly: true, intensity: "revealing" }),
    pair("双腿张开呈现", "legs spread wide open with the pussy presented", { mode: "body", target: "vulva", adultOnly: true, intensity: "revealing" }),
    pair("面对面亲密", "explicit face-to-face sexual intimacy", { mode: "intimacy", target: "body", adultOnly: true, intensity: "revealing", people: 2 }),
    pair("背后贴身亲密", "explicit intimacy pressed from behind", { mode: "intimacy", target: "anus", adultOnly: true, intensity: "revealing", people: 2 })
  );

  // 三、露出动作：直白部位词 + 成套朝向/构图/手部/腿部，避免随机补齐导致姿势矛盾
  O.revealAction.push(
    pair("双手拉开阴唇", "pulling the pussy lips apart with both hands toward the camera", { modes: ["visibility", "body"], targets: ["vulva"], adultOnly: true, intensity: "revealing", handPose: "fingers spreading the pussy lips apart", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit composition clearly presenting the spread pussy", shotSize: "explicit pussy close-up" }),
    pair("坐地V字开腿", "sitting with the legs spread in a wide V and the pussy presented to the camera", { modes: ["visibility", "body"], targets: ["vulva"], adultOnly: true, intensity: "revealing", legPose: "legs spread wide apart", bodyOrientation: "seated facing the camera", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", shotSize: "full-body shot" }),
    pair("仰卧抱膝张开", "lying on the back and pulling both knees back to open the pussy to the camera", { modes: ["visibility", "body"], targets: ["vulva", "nipples"], adultOnly: true, intensity: "revealing", legPose: "both knees pulled back toward the chest", handPose: "one hand hooked behind the knee", bodyOrientation: "lying with the legs open toward the camera", bodyFocus: "an explicit composition clearly presenting the spread pussy", shotSize: "full-body shot" }),
    pair("单腿高举张开", "standing with one leg lifted high to open the pussy toward the camera", { modes: ["visibility", "body"], targets: ["vulva"], adultOnly: true, intensity: "revealing", legPose: "one leg lifted high", handPose: "one hand hooked behind the knee", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit composition clearly presenting the spread pussy", shotSize: "cowboy shot" }),
    pair("背后掰开臀瓣", "reaching back and spreading the ass cheeks apart toward the camera", { modes: ["visibility"], targets: ["anus"], adultOnly: true, intensity: "revealing", handPose: "both hands spreading the ass cheeks apart", bodyOrientation: "bent over with the ass toward the camera", bodyFocus: "an explicit rear composition clearly presenting the spread asshole", shotSize: "explicit asshole close-up" }),
    pair("跪姿后挺呈现", "kneeling with the hips pushed back and the asshole presented to the camera", { modes: ["visibility", "body"], targets: ["anus"], adultOnly: true, intensity: "revealing", legPose: "kneeling with the knees apart", bodyOrientation: "viewed from behind", bodyFocus: "an explicit rear composition clearly presenting the ass and asshole", shotSize: "full-body shot" }),
    pair("俯卧抬臀呈现", "lying face down with the hips lifted and the asshole raised toward the camera", { modes: ["visibility"], targets: ["anus"], adultOnly: true, intensity: "revealing", legPose: "lying face down with the legs lifted behind", bodyOrientation: "bent over with the ass toward the camera", bodyFocus: "an explicit rear composition clearly presenting the spread asshole", shotSize: "cowboy shot" }),
    pair("桌面弯腰呈现", "bending over a tabletop with the ass and asshole presented toward the camera", { modes: ["visibility"], targets: ["anus"], adultOnly: true, intensity: "revealing", bodyOrientation: "bent over with the ass toward the camera", bodyFocus: "the ass and asshole clearly presented toward the camera", shotSize: "cowboy shot" }),
    pair("内裤拨到一侧露阴", "pulling the panties aside with one hand to bare the pussy", { modes: ["opening"], targets: ["vulva"], adultOnly: true, intensity: "revealing", handPose: "both hands pulling the panties aside", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", shotSize: "full-body shot" }),
    pair("上衣掀起露胸", "pulling the top up with both hands to bare the tits", { modes: ["opening"], targets: ["nipples"], adultOnly: true, intensity: "revealing", handPose: "both hands lifting the tits", bodyFocus: "an explicit composition clearly presenting the nipples and chest", shotSize: "medium close shot" }),
    pair("双手托胸展示", "lifting both tits toward the camera in an explicit presentation", { modes: ["visibility", "body"], targets: ["nipples"], adultOnly: true, intensity: "revealing", handPose: "both hands lifting the tits", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit composition clearly presenting the nipples and chest", shotSize: "medium close shot" }),
    pair("指压乳头呈现", "pinching one nipple between the fingers while facing the camera", { modes: ["visibility", "body"], targets: ["nipples"], adultOnly: true, intensity: "revealing", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit composition clearly presenting the nipples and chest", shotSize: "chest close-up" }),
    pair("手握阴茎展示", "holding the cock and presenting it toward the camera", { modes: ["visibility", "body"], targets: ["maleGenitals"], adultOnly: true, intensity: "revealing", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit composition clearly presenting the cock and balls", shotSize: "cowboy shot" }),
    pair("内裤半褪露男根", "lowering the underwear to expose the cock and balls", { modes: ["opening"], targets: ["maleGenitals"], adultOnly: true, intensity: "revealing", bodyFocus: "an explicit composition clearly presenting the cock and balls", shotSize: "full-body shot" }),
    pair("面对面贴紧呈现", "pressed face to face with the bodies aligned and fully exposed", { modes: ["intimacy"], targets: ["body"], adultOnly: true, intensity: "revealing", people: 2, bodyFocus: "the two adults and their interaction clearly framed", shotSize: "two-shot medium framing" }),
    pair("背后贴合呈现", "pressed closely from behind with both bodies fully exposed", { modes: ["intimacy"], targets: ["anus", "body"], adultOnly: true, intensity: "revealing", people: 2, bodyFocus: "the two adults and their interaction clearly framed", shotSize: "two-shot medium framing" }),
    pair("镜前转身呈现阴部", "turning in front of the mirror so the pussy is reflected toward the camera", { modes: ["visibility", "body"], targets: ["vulva"], adultOnly: true, intensity: "revealing", bodyOrientation: "mirrored frontal view with the legs open", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", shotSize: "full-body shot" }),
    pair("低机位开腿呈现", "sitting low with the knees apart and the pussy presented straight into a low camera", { modes: ["visibility", "body"], targets: ["vulva"], adultOnly: true, intensity: "revealing", legPose: "legs spread wide apart", bodyOrientation: "seated facing the camera", bodyFocus: "an explicit composition clearly presenting the spread pussy", shotSize: "cowboy shot" }),
    pair("全裸正面呈现", "standing fully nude with every part exposed to the camera", { modes: ["visibility", "body"], targets: ["body"], adultOnly: true, intensity: "revealing", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit full-body composition with every part uncovered", shotSize: "full-body shot" }),
    pair("全裸背身呈现", "standing fully nude with the back turned and the ass presented to the camera", { modes: ["visibility"], targets: ["body"], adultOnly: true, intensity: "revealing", bodyOrientation: "viewed from behind", bodyFocus: "an explicit full-body composition with every part uncovered", shotSize: "full-body shot" }),
    pair("湿润特写呈现", "spreading the pussy open to show how wet it is", { modes: ["visibility"], targets: ["vulva"], adultOnly: true, intensity: "revealing", handPose: "fingers spreading the pussy lips apart", bodyFocus: "an explicit composition clearly presenting the visibly wet pussy", shotSize: "explicit pussy close-up" }),
    pair("裙摆全掀露阴", "lifting the whole skirt up to the waist to bare the pussy", { modes: ["skirt"], targets: ["vulva"], skirtAction: true, adultOnly: true, intensity: "revealing", handPose: "both hands lifting the skirt hem", bodyOrientation: "facing the camera directly", bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs", shotSize: "full-body shot" })
  );

  // 四、露点姿势：补成套组合
  REVEAL_POSES.push(
    { key: "open-recline", zh: "开腿仰卧展示", targets: ["vulva", "body"], intensities: ["intense"], fields: { pose: "a fully open reclining adult pose with the body extended toward the camera", action: "slowly and confidently presenting the body with explicit adult intent", bodyOrientation: "lying with the legs open toward the camera", gaze: "an openly desiring adult gaze directed into the camera" } },
    { key: "rear-kneel", zh: "跪姿后庭展示", targets: ["anus"], intensities: ["intense"], fields: { pose: "kneeling at the foot of the bed", action: "slowly and confidently presenting the body with explicit adult intent", bodyOrientation: "viewed from behind", gaze: "a backward glance over the shoulder toward the camera" } },
    { key: "bend-over-table", zh: "桌面弯腰展示", targets: ["anus", "body"], intensities: ["display", "intense"], fields: { pose: "leaning across a table on their forearms", action: "slowly and confidently presenting the body with explicit adult intent", bodyOrientation: "bent over with the ass toward the camera", gaze: "a backward glance over the shoulder toward the camera" } },
    { key: "mirror-turn", zh: "镜前转身展示", targets: ["vulva", "body", "legwear"], intensities: ["display", "intense"], fields: { pose: "caught mid-turn in an adult presentation", action: "slowly and confidently presenting the body with explicit adult intent", bodyOrientation: "mirrored frontal view with the legs open", gaze: "a sustained intense adult gaze locked on the camera" } },
    { key: "nude-stand", zh: "全裸站立展示", targets: ["body"], intensities: ["display", "intense"], fields: { pose: "standing frontal adult presentation", action: "slowly and confidently presenting the body with explicit adult intent", bodyOrientation: "facing the camera directly", gaze: "an openly desiring adult gaze directed into the camera" } }
  );

  // 五、露点方案：17 → 42
  REVEAL_SCENARIOS.push(
    {
      key: "curtain-silhouette-tease",
      zh: "窗帘后侧身轮廓",
      group: "挑逗",
      target: "body",
      cameraPlan: "boudoir medium plan",
      fields: {
        scene: "a bedroom behind sheer curtains",
        lighting: "backlight filtered through sheer curtains",
        mood: "restrained longing atmosphere",
        atmosphere: "thin atmospheric haze",
        visualStyle: "film-noir portrait",
        garmentDisplacement: "garment open at the front",
        pose: "leaning a shoulder against a sheer curtain",
        bodyOrientation: "left profile",
        gaze: "subtle side glance",
        expression: "soft parted lips",
        handPose: "one hand resting near the collarbone",
        legPose: "weight shifted onto one leg",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line"
      }
    },
    {
      key: "morning-stretch-bed",
      zh: "晨光床榻伸展",
      group: "挑逗",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a bedroom in slanted afternoon light",
        lighting: "soft morning light filtered through sheer curtains",
        mood: "lazy morning atmosphere",
        atmosphere: "fine floating dust",
        visualStyle: "morning-light environmental portrait",
        garmentDisplacement: "garment open at the front",
        pose: "stretching both arms overhead",
        bodyOrientation: "facing the camera directly",
        gaze: "subtle side glance",
        handPose: "one hand resting near the collarbone",
        legPose: "weight shifted onto one leg",
        revealMode: "body-line presentation",
        revealAction: "leaning back to emphasize the torso and waistline"
      }
    },
    {
      key: "rain-sofa-recline",
      zh: "雨夜沙发侧卧",
      group: "挑逗",
      target: "body",
      cameraPlan: "boudoir medium plan",
      fields: {
        scene: "a sofa by the window on a rainy day",
        lighting: "low-angle practical light",
        mood: "solitude on a rainy night",
        atmosphere: "rain mist",
        visualStyle: "low-key mood photography",
        pose: "reclining on one side, propped on one elbow",
        bodyOrientation: "lying on one side and facing the camera",
        gaze: "subtle side glance",
        expression: "soft parted lips",
        handPose: "one hand supporting the body",
        legPose: "legs held together while lying on one side",
        revealMode: "body-line presentation",
        revealAction: "leaning back to emphasize the torso and waistline"
      }
    },
    {
      key: "mirror-back-glance",
      zh: "镜前背身回望",
      group: "挑逗",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "in front of a dressing-room mirror",
        lighting: "vanity mirror lighting",
        mood: "quiet suggestive atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "mirror portrait",
        garmentDisplacement: "one shoulder strap slipped down",
        pose: "back to the camera, looking over the shoulder",
        bodyOrientation: "rear reflection in a mirror",
        gaze: "a backward glance over the shoulder toward the camera",
        handPose: "one hand resting near the collarbone",
        legPose: "weight shifted onto one leg",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line"
      }
    },
    {
      key: "bathtub-steam-tease",
      zh: "浴缸蒸汽挑逗",
      group: "挑逗",
      target: "body",
      cameraPlan: "boudoir medium plan",
      fields: {
        scene: "a bathtub by a floor-to-ceiling window",
        lighting: "soft light through bathroom steam",
        mood: "quiet intimacy",
        atmosphere: "soft steam",
        visualStyle: "intimate editorial portrait",
        garmentDisplacement: "garment fully intact",
        pose: "half-lying, half-sitting",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "subtle side glance",
        handPose: "one hand supporting the body",
        legPose: "legs held together while lying on one side",
        revealMode: "body-line presentation",
        revealAction: "leaning back to emphasize the torso and waistline"
      }
    },
    {
      key: "fireplace-open-front",
      zh: "壁炉前服装敞开",
      group: "明确展示",
      target: "body",
      cameraPlan: "waist and lingerie plan",
      fields: {
        scene: "a fireplace lounge",
        lighting: "warm firelight",
        mood: "quiet intimacy",
        atmosphere: "volumetric light rays",
        visualStyle: "low-key textured portrait style",
        garmentDisplacement: "garment open at the front",
        pose: "leaning back into a chair",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "fingers holding the edge of the open garment",
        legPose: "legs spread wide apart",
        revealMode: "open-garment presentation",
        revealAction: "letting one shoulder strap slip down slowly"
      }
    },
    {
      key: "hotel-suite-line",
      zh: "酒店套房全身线条",
      group: "明确展示",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a boutique hotel suite",
        lighting: "warm paired bedside lamps",
        mood: "luxurious private atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "luxury hotel campaign photography",
        garmentDisplacement: "lower garment pulled down",
        pose: "standing with the weight on one leg",
        bodyOrientation: "three-quarter view from the front right",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand resting near the collarbone",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "leaning back to emphasize the torso and waistline"
      }
    },
    {
      key: "studio-chest-bare",
      zh: "摄影棚裸胸特写",
      group: "明确展示",
      target: "chest",
      cameraPlan: "chest close-up plan",
      fields: {
        scene: "a boudoir photography studio",
        lighting: "a single hard spotlight",
        mood: "private tenderness",
        atmosphere: "clean crisp atmosphere",
        visualStyle: "premium glamour portrait",
        garmentDisplacement: "top partially removed",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "soft parted lips",
        bodyFocus: "an explicit composition clearly presenting the nipples and chest",
        handPose: "",
        legPose: "legs spread wide apart",
        revealMode: "bare tits and nipples clearly visible",
        revealAction: "lifting both tits toward the camera in an explicit presentation"
      }
    },
    {
      key: "conservatory-stand",
      zh: "玻璃花房站立展示",
      group: "明确展示",
      target: "body",
      cameraPlan: "boudoir medium plan",
      fields: {
        scene: "a glass conservatory beside a garden",
        lighting: "side-window rim light",
        mood: "polished vintage atmosphere",
        atmosphere: "volumetric light rays",
        visualStyle: "natural intimate lifestyle photography",
        garmentDisplacement: "garment open at the front",
        pose: "leaning on a railing",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand resting near the collarbone",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line"
      }
    },
    {
      key: "sofa-side-hip",
      zh: "沙发侧坐胯线",
      group: "明确展示",
      target: "body",
      cameraPlan: "waist and lingerie plan",
      fields: {
        scene: "a studio lounge with a large sofa",
        lighting: "a pool of warm floor-lamp light",
        mood: "cinematic tension",
        atmosphere: "fine film grain",
        visualStyle: "cinematic close-up portrait",
        garmentDisplacement: "innerwear pulled to one side",
        pose: "sitting sideways on a sofa in an adult presentation",
        bodyOrientation: "three-quarter view from the front right",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand supporting the body",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "turning to present the waist and hip line"
      }
    },
    {
      key: "balcony-dawn-sheer",
      zh: "露台晨光薄衫",
      group: "明确展示",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a private balcony at dawn",
        lighting: "soft dawn glow",
        mood: "a gentle morning haze",
        atmosphere: "airy atmospheric depth",
        visualStyle: "morning-light environmental portrait",
        garmentDisplacement: "one shoulder strap slipped down",
        pose: "leaning on a railing and looking out",
        bodyOrientation: "left profile",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand resting near the collarbone",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "leaning back to emphasize the torso and waistline"
      }
    },
    {
      key: "yacht-cabin-bed",
      zh: "游艇舱内躺姿",
      group: "明确展示",
      target: "body",
      cameraPlan: "waist and lingerie plan",
      fields: {
        scene: "a private cabin bedroom on a yacht",
        lighting: "muted low-light bedside glow",
        mood: "languid closeness",
        atmosphere: "soft glowing highlights",
        visualStyle: "low-light film portrait",
        garmentDisplacement: "selected clothing moved aside",
        pose: "lying on one side with one knee bent",
        bodyOrientation: "lying on one side and facing the camera",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "half-lidded adult expression while panting",
        handPose: "one hand supporting the body",
        legPose: "both knees pulled back toward the chest",
        revealMode: "body-line presentation",
        revealAction: "leaning back to emphasize the torso and waistline"
      }
    },
    {
      key: "stool-legwear",
      zh: "高脚凳腿袜展示",
      group: "明确展示",
      target: "legwear",
      cameraPlan: "legwear close-up plan",
      fields: {
        scene: "a vintage dressing room",
        lighting: "vanity mirror lighting",
        mood: "couture backstage atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "boudoir magazine style",
        pose: "sitting on a chair and leaning forward with an adult presentation",
        bodyOrientation: "three-quarter view from the front right",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand supporting the body",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "lifting one leg to emphasize the leg line"
      }
    },
    {
      key: "bed-pussy-spread",
      zh: "床榻张开阴部",
      group: "高强展示",
      target: "vulva",
      cameraPlan: "vulva close-up plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "warm bedside lamp light",
        mood: "humid ambiguity",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "clothing fully removed",
        pose: "a fully open reclining adult pose with the body extended toward the camera",
        bodyOrientation: "lying with the legs open toward the camera",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "half-lidded adult expression while panting",
        bodyFocus: "an explicit composition clearly presenting the spread pussy",
        handPose: "",
        legPose: "both knees pulled back toward the chest",
        revealMode: "pussy lips spread open toward the camera",
        revealAction: "pulling the pussy lips apart with both hands toward the camera"
      }
    },
    {
      key: "bed-pussy-wet",
      zh: "床榻湿润特写",
      group: "高强展示",
      target: "vulva",
      cameraPlan: "vulva close-up plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "striped window light through blinds",
        mood: "high-intensity adult erotic tension",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "clothing fully removed",
        pose: "a fully open reclining adult pose with the body extended toward the camera",
        bodyOrientation: "facing the camera directly",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "half-lidded adult expression while panting",
        bodyFocus: "an explicit composition clearly presenting the visibly wet pussy",
        handPose: "",
        legPose: "both knees pulled back toward the chest",
        revealMode: "wet pussy clearly visible with visible slick",
        revealAction: "spreading the pussy open to show how wet it is"
      }
    },
    {
      key: "mirror-rear-spread",
      zh: "镜前掰开臀瓣",
      group: "高强展示",
      target: "anus",
      cameraPlan: "anal close-up plan",
      fields: {
        scene: "a bedroom with a large mirror",
        lighting: "soft reflected mirror light",
        mood: "humid ambiguity",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "clothing fully removed",
        pose: "kneeling at the foot of the bed",
        bodyOrientation: "bent over with the ass toward the camera",
        gaze: "a backward glance over the shoulder toward the camera",
        bodyFocus: "an explicit rear composition clearly presenting the spread asshole",
        handPose: "",
        legPose: "kneeling with the knees apart",
        revealMode: "asshole spread open toward the camera",
        revealAction: "reaching back and spreading the ass cheeks apart toward the camera"
      }
    },
    {
      key: "kneel-rear-present",
      zh: "跪姿后挺呈现",
      group: "高强展示",
      target: "anus",
      cameraPlan: "anal close-up plan",
      fields: {
        scene: "a boudoir photography studio",
        lighting: "low-angle practical light",
        mood: "private and intensely passionate adult atmosphere",
        atmosphere: "fine film grain",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "clothing fully removed",
        pose: "kneeling at the foot of the bed",
        bodyOrientation: "viewed from behind",
        gaze: "a backward glance over the shoulder toward the camera",
        bodyFocus: "an explicit rear composition clearly presenting the ass and asshole",
        handPose: "",
        legPose: "kneeling with the knees apart",
        revealMode: "ass cheeks and asshole clearly visible",
        revealAction: "kneeling with the hips pushed back and the asshole presented to the camera"
      }
    },
    {
      key: "face-and-pussy-open",
      zh: "面与阴同框张开",
      group: "高强展示",
      target: "vulva",
      cameraPlan: "face and lower-body full-frame plan",
      fields: {
        scene: "a bedroom with silk bedding",
        lighting: "a gentle bedside light gradient",
        mood: "hushed intimacy",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "clothing fully removed",
        pose: "a fully open reclining adult pose with the body extended toward the camera",
        bodyOrientation: "lying with the legs open toward the camera",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "dazed adult expression",
        bodyFocus: "an explicit composition clearly presenting the spread pussy",
        handPose: "",
        legPose: "both knees pulled back toward the chest",
        revealMode: "nipples and pussy both clearly visible",
        revealAction: "lying on the back and pulling both knees back to open the pussy to the camera"
      }
    },
    {
      key: "chest-pinch-close",
      zh: "指压乳头特写",
      group: "高强展示",
      target: "chest",
      cameraPlan: "chest close-up plan",
      fields: {
        scene: "a bedroom with layered sheer curtains",
        lighting: "diffused steam-filled light",
        mood: "high-intensity adult erotic tension",
        atmosphere: "thin atmospheric haze",
        visualStyle: "close texture-focused portrait",
        garmentDisplacement: "top partially removed",
        pose: "leaning back against the headboard",
        bodyOrientation: "facing the camera directly",
        gaze: "an openly desiring adult gaze directed into the camera",
        expression: "half-lidded adult expression while panting",
        bodyFocus: "an explicit composition clearly presenting the nipples and chest",
        handPose: "",
        legPose: "legs spread wide apart",
        revealMode: "bare tits and nipples clearly visible",
        revealAction: "pinching one nipple between the fingers while facing the camera"
      }
    },
    {
      key: "nude-front-stand",
      zh: "全裸正面站立",
      group: "高强展示",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a dark luxury apartment",
        lighting: "quiet chiaroscuro lighting",
        mood: "mysterious night atmosphere",
        atmosphere: "thin atmospheric haze",
        visualStyle: "low-key textured portrait style",
        garmentDisplacement: "clothing fully removed",
        pose: "standing frontal adult presentation",
        bodyOrientation: "facing the camera directly",
        gaze: "an openly desiring adult gaze directed into the camera",
        bodyFocus: "an explicit full-body composition with every part uncovered",
        handPose: "one hand resting near the collarbone",
        legPose: "legs spread wide apart",
        revealMode: "fully nude front clearly visible",
        revealAction: "standing fully nude with every part exposed to the camera"
      }
    },
    {
      key: "nude-rear-stand",
      zh: "全裸背身站立",
      group: "高强展示",
      target: "body",
      cameraPlan: "cinematic full-body plan",
      fields: {
        scene: "a dark luxury apartment",
        lighting: "striped window light through blinds",
        mood: "mysterious night atmosphere",
        atmosphere: "fine film grain",
        visualStyle: "low-key textured portrait style",
        garmentDisplacement: "clothing fully removed",
        pose: "standing with the back to the camera",
        bodyOrientation: "viewed from behind",
        gaze: "a backward glance over the shoulder toward the camera",
        bodyFocus: "an explicit full-body composition with every part uncovered",
        handPose: "one hand resting near the collarbone",
        legPose: "legs spread wide apart",
        revealMode: "fully nude rear clearly visible",
        revealAction: "standing fully nude with the back turned and the ass presented to the camera"
      }
    },
    {
      key: "table-bend-rear",
      zh: "桌面弯腰呈现",
      group: "高强展示",
      target: "anus",
      cameraPlan: "anal close-up plan",
      fields: {
        scene: "a modern apartment living room",
        lighting: "low-angle table lamp light",
        mood: "steamy diffused atmosphere",
        atmosphere: "soft steam",
        visualStyle: "explicit intimate adult editorial photography",
        garmentDisplacement: "clothing fully removed",
        pose: "leaning across a table on their forearms",
        bodyOrientation: "bent over with the ass toward the camera",
        gaze: "a backward glance over the shoulder toward the camera",
        bodyFocus: "the ass and asshole clearly presented toward the camera",
        handPose: "",
        legPose: "legs spread wide apart",
        revealMode: "ass cheeks and asshole clearly visible",
        revealAction: "bending over a tabletop with the ass and asshole presented toward the camera"
      }
    },
    {
      key: "mirror-turn-vulva",
      zh: "镜前转身呈现",
      group: "高强展示",
      target: "vulva",
      cameraPlan: "face and lower-body full-frame plan",
      fields: {
        scene: "a vanity room with mirrors",
        lighting: "vanity mirror lighting",
        mood: "private and intensely passionate adult atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "mirror portrait",
        garmentDisplacement: "clothing fully removed",
        pose: "caught mid-turn in an adult presentation",
        bodyOrientation: "mirrored frontal view with the legs open",
        gaze: "an openly desiring adult gaze directed into the camera",
        bodyFocus: "an explicit front composition clearly presenting the pussy and inner thighs",
        handPose: "one hand resting near the collarbone",
        legPose: "legs spread wide apart",
        revealMode: "pussy clearly visible",
        revealAction: "turning in front of the mirror so the pussy is reflected toward the camera"
      }
    },
    {
      key: "garter-side-display",
      zh: "吊带袜侧面展示",
      group: "服饰展示",
      target: "legwear",
      cameraPlan: "legwear close-up plan",
      fields: {
        scene: "a vintage dressing room",
        lighting: "wall-washer sconce light",
        mood: "polished vintage atmosphere",
        atmosphere: "soft glowing highlights",
        visualStyle: "vintage film portrait",
        pose: "standing in profile with the arms hanging",
        bodyOrientation: "left profile",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand resting near the collarbone",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "lifting one leg to emphasize the leg line"
      }
    },
    {
      key: "sole-mirror-press",
      zh: "足底贴镜展示",
      group: "服饰展示",
      target: "feet",
      cameraPlan: "sole close-up plan",
      fields: {
        scene: "a vanity room with mirrors",
        lighting: "soft reflected mirror light",
        mood: "quiet ambiguity",
        atmosphere: "clean crisp atmosphere",
        visualStyle: "boudoir magazine style",
        pose: "sitting on the edge of the bed with the feet down",
        bodyOrientation: "three-quarter view from the front left",
        gaze: "an openly desiring adult gaze directed into the camera",
        handPose: "one hand supporting the body",
        legPose: "legs spread wide apart",
        revealMode: "body-line presentation",
        revealAction: "lifting one leg to emphasize the leg line"
      }
    }
  );

  window.PS_DATA = {
    MODELS,
    O,
    ROLE_PRESETS,
    STYLE_PRESETS,
    STYLE_LOOKS,
    REVEAL_SCENARIOS,
    REVEAL_TARGETS,
    REVEAL_INTENSITIES,
    REVEAL_POSES,
    REVEAL_TARGET_CAMERAS,
    REVEAL_CAMERA_INTENSITIES,
    QUICK_PRESETS,
    LORA_CATALOG,
    version: "2026-11-12-director-final"
  };
})();
