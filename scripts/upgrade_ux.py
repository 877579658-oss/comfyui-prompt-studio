from pathlib import Path
root = Path(__file__).resolve().parents[1]
p = root / 'app.js'
s = p.read_text(encoding='utf-8')
def replace(old, new):
    global s
    if old not in s: raise ValueError('Missing anchor: '+old[:100])
    s = s.replace(old,new,1)

# The two output fields have stable language identities, including old saved states.
replace('primaryLanguage = state.primaryLanguage;', 'primaryLanguage = "en";')
replace('    latestOutput = buildOutput();', '    primaryLanguage = "en";\n    $("language").value = "en";\n    latestOutput = buildOutput();')
replace('    updatePromptStats();\n    refreshFieldMarks();', '    updatePromptStats();\n    refreshFieldMarks();\n    refreshUsability();')
replace('    if (!$("bodyFocus").value) applyTemplateBodyFocus("pose");\n    updateOutput();', '    if (!$("bodyFocus").value) applyTemplateBodyFocus("pose");\n    syncAspectRatioFromSize();\n    setupUsability();\n    updateOutput();')
replace('    if (lockedAspectRatio()) applyLockedAspectRatio();\n    syncScaleSwitch();', '    if (lockedAspectRatio()) applyLockedAspectRatio();\n    else syncAspectRatioFromSize();\n    syncScaleSwitch();')
replace('    const scaleHint = needsRevealing ? "（套用时切换露点）" : "";', '    const scaleHint = needsRevealing ? "（与当前尺度不兼容，请手动选择尺度）" : "";')
replace('    if (needsRevealing && contentScale() !== "revealing" && scaleLocked()) {', '    if (needsRevealing && contentScale() !== "revealing") {')
replace('      showToast("尺度已锁定。请先解锁，再套用需要露点的方案");', '      showToast("此预设与当前尺度不兼容。未修改任何设置，请手动选择合适尺度。");')
replace('    if (applyMode === "random-rest") lastRandomState = collectState();', '    lastRandomState = collectState();')
replace('    showToast("已撤销上一次随机");', '    saveAutosave();\n    showToast("已撤销上一次修改");')
# Keep a transparent, conservative preview instead of silently applying fuzzy matches.
start=s.index('      const text = $("sentenceInput").value.trim();',s.index('$("sentenceButton").addEventListener'))
end=s.index('\n    });',start)
s=s[:start]+'      previewSentence();'+s[end:]
replace('    primaryLanguage = detectInputLanguage($("sentenceInput")?.value || "");', '    primaryLanguage = "en";')
start=s.index('    const corrections = randomize({',s.index('  function applySentence(items)'))
end=s.index('    updateVisibility();',start)
s=s[:start]+'''    for (const item of items) noteUserFieldChange(item.field);
    const corrections = resolveConflicts(null, { silent: true });
    reapplySentenceLocks();
'''+s[end:]
start=s.index('    $("sentenceSummary").textContent = items.length >= SENTENCE_MAX_FIELDS')
end=s.index('\n  }',start)
s=s[:start]+'''    $("sentenceSummary").textContent = `已应用 ${items.length} 个确定选项；未识别内容未写入，其他字段保留。${corrections.length ? `联动修正 ${corrections.length} 项，详见修改记录。` : ""}`;
    $("sentenceApply").disabled = true;
    recordUsabilityChange(sentenceSnapshot, "应用解析选项");
'''+s[end:]
# Expose the limits of rule checking rather than a misleading quality score.
replace('score.textContent = `${review.percent} 分 · 通过 ${passed}/${review.checks.length} 项${', 'score.textContent = `基础规则检查 · 通过 ${passed}/${review.checks.length} 项${')
replace('        ? "核心结构已经完整，可以检查警告项后使用。"\n        : "检查通过，可以复制并使用。";', '        ? "请查看提醒。此检查不验证完整语义、原句覆盖率或模型出图效果。"\n        : "已通过列出的基础规则；完整语义、原句覆盖率和出图效果尚未验证。";')
replace('    const sizeBucket = size.width % 64 === 0 && size.height % 64 === 0;', '''    const sizeBucket = size.width % 8 === 0 && size.height % 8 === 0;
    const targetRatio = ASPECT_TO_RATIO[$("aspectRatio").value];
    checks.push({status: !targetRatio || Math.abs(size.width / size.height - targetRatio) / targetRatio < 0.04 ? "pass" : "fail", title: "比例与像素一致性", detail: `提示词比例：${$("aspectRatio").selectedOptions[0]?.textContent || "未指定"}；实际尺寸：${size.width}×${size.height}。尺寸仍需在 ComfyUI 中设置。`});
    if ($("sentenceInput").value.trim()) checks.push({status:"warn", title:"原句覆盖范围", detail:"本地匹配只处理预览中列出的选项；请核对原句中未识别的主体、颜色、场景和时间。"});
    if (quickPresetDirty) checks.push({status:"warn", title:"待应用预设", detail:"顶部仍有未应用的选择。复制的是当前结果，不包含待应用修改。"});''')
replace('，宽高建议取 64 的倍数','，宽高未对齐 8 像素；请核对具体工作流要求')
replace('    const points = checks.reduce', '    checks.push(...usabilityChecks());\n    const points = checks.reduce')
replace('    if (applied.length && !silent) showToast(applied.join("；"));', '    if (applied.length) usabilityCorrections = applied.slice();\n    if (applied.length && !silent) showToast(applied.join("；"));')
# Persist honest save status.
replace('      localStorage.setItem(key, JSON.stringify(value));', '''      localStorage.setItem(key, JSON.stringify(value));
      if (key === "promptStudio.autosave.v1" && $("saveStatus")) {
        $("saveStatus").textContent = `已保存 ${new Date().toLocaleTimeString("zh-CN", {hour12:false})}`;
        $("saveStatus").dataset.state = "saved";
      }
      return true;''')
replace('      showToast("浏览器存储不可用，当前修改不会持久保存");', '''      if ($("saveStatus")) { $("saveStatus").textContent = "保存失败，请导出备份"; $("saveStatus").dataset.state = "error"; }
      showToast("浏览器存储不可用，当前修改不会持久保存");
      return false;''')
replace('  function saveAutosave() {\n    window.clearTimeout', '  function saveAutosave() {\n    if ($("saveStatus")) $("saveStatus").textContent = "正在保存…";\n    window.clearTimeout')
# All editor metadata travels with backup, undo and autosave.
replace('    state.primaryLanguage = primaryLanguage;', '    state.customEditors = structuredClone(customEditors);\n    state.sentenceDraft = $("sentenceInput")?.value || "";\n    state.primaryLanguage = "en";')
replace('    if (!state) return;\n    userTouchedFields.clear();', '    if (!state) return;\n    customEditors = state.customEditors && typeof state.customEditors === "object" ? structuredClone(state.customEditors) : {};\n    if (typeof state.sentenceDraft === "string") $("sentenceInput").value = state.sentenceDraft;\n    userTouchedFields.clear();')
replace('  function customText(id, lang) {\n    const english', '  function customText(id, lang) {\n    if (!customEditorActive(id)) return "";\n    const english')
replace('  function subjectText(lang) {\n    const type', '  function subjectText(lang) {\n    if (customEditorActive("characterCustom") && customEditors.characterCustom?.mode === "replace" && currentSubjectType() === "person") return languageJoin([pairText("firstGender", lang), customText("characterCustom", lang)], lang);\n    const type')
replace('  function garmentGraphicText(lang) {\n    const zone', '  function garmentGraphicText(lang) {\n    if (customEditorActive("garmentGraphicCustom") && customEditors.garmentGraphicCustom?.mode === "replace") return customText("garmentGraphicCustom", lang);\n    const zone')
replace('    const status = $("bilingualStatus");', '    const status = $("bilingualStatus");')
replace('    $("jsonOutput").value = currentJson();', '''    if (!freeEditMode && missingCustomTranslations().length) {
      if (status) status.textContent = "自定义内容缺少另一语言；未自动翻译，请分别核对";
      $("outputModeHint").textContent = "只读 · 双语未配齐";
    } else if (!freeEditMode) $("outputModeHint").textContent = "同组选项生成，只读";
    $("jsonOutput").value = currentJson();''')
# Do not insert video-only boilerplate in ordinary image output.
replace('    const motion = motionText(lang);\n    const adultDetails', '    const motion = motionText(lang);\n    const adultDetails')
replace('    return { positive, positiveZh, negative, json, model };', '''    return { positive, positiveZh, negative, json, model };''')
extension = (root/'scripts'/'usability.inc.js').read_text(encoding='utf-8')
replace('  function init() {', extension+'\n  function init() {')
p.write_text(s,encoding='utf-8')

p=root/'index.html'; h=p.read_text(encoding='utf-8')
h=h.replace('20261112-181','20261112-ux-1')
h=h.replace('<span class="status-pill muted">自动保存</span>','<span class="status-pill muted" id="saveStatus" role="status">本地自动保存</span>')
h=h.replace('一句话描述画面，按回车解析并补全（本地匹配，不联网）','描述画面，先预览确定选项（本地匹配，不自动翻译）')
h=h.replace('>解析并补全</button>','>预览识别</button>')
h=h.replace('人物（人种）','地域外观参考')
h=h.replace('id="sentenceUndo" type="button">撤销全部','id="sentenceUndo" type="button">撤销本次解析')
h=h.replace('<div class="sentence-chips" id="sentenceChips"></div>', '<div class="sentence-chips" id="sentenceChips"></div><p id="sentenceCoverage" class="ux-note"></p><button class="button secondary small" id="sentenceApply" type="button" disabled>应用已识别选项</button>')
h=h.replace('没有匹配到字段。试着换成具体的词：场景（雨夜街道）、服装（白衬衫）、动作（回头）、景别（特写）、风格（电影感）。','没有足够明确的匹配，未修改任何设置。原句已保留；请在详细设置手动选择，或填写自定义中英文描述。')
h=h.replace('英文主提示词 + 中文同步参考','英文主提示词 + 中文参考（自定义需分别填写）')
h=h.replace('快捷键：Ctrl + Enter 套用当前','快捷键：Ctrl + Enter 应用当前选择')
h=h.replace('>复制并使用</button>','>复制英文</button>')
p.write_text(h,encoding='utf-8')
# A normal vocabulary label incorrectly implied a hair color absent from its English value.
p=root/'data'/'prompts.js'; d=p.read_text(encoding='utf-8').replace('pair("亚麻长发微卷", "long wavy hair with natural texture")','pair("自然微卷长发", "long wavy hair with natural texture")'); p.write_text(d,encoding='utf-8')
print('Updated app.js, index.html and ordinary vocabulary; backup preserved.')
