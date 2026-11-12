  // Generic editor state and feedback. No generation-specific content is added here.
  let customEditors = {};
  let usabilityCorrections = [];
  let usabilityReady = false;
  let usabilityLastState = null;
  let usabilityUndo = [];
  let usabilityRestoring = false;
  let sentencePreview = [];
  let sentencePreviewSource = "";
  const CUSTOM_EDITOR_IDS = ["characterCustom", "secondCharacterCustom", "thirdCharacterCustom", "objectDescription", "garmentGraphicCustom", "customDetails", "dialogueScript", "voiceoverScript"];

  function uxElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function customEditorActive(id) {
    const state = customEditors[id];
    if (state?.enabled === false || (state?.scope && state.scope !== contentScale())) return false;
    if (id === "objectDescription" && currentSubjectType() !== "object") return false;
    if (id === "characterCustom" && currentSubjectType() === "object") return false;
    if (id === "secondCharacterCustom" && !["couple", "group"].includes(currentSubjectType())) return false;
    if (id === "thirdCharacterCustom" && currentSubjectType() !== "group") return false;
    if (["dialogueScript", "voiceoverScript"].includes(id) && getModel().type !== "video") return false;
    return true;
  }

  function missingCustomTranslations() {
    return CUSTOM_EDITOR_IDS.filter(id => customEditorActive(id) && Boolean(inputValue(id)) !== Boolean(inputValue(`${id}Zh`)));
  }

  function previewSentence() {
    const source = $("sentenceInput").value.trim();
    sentencePreviewSource = source;
    // Exact vocabulary only: a partial phrase such as “西装” must not imply “黑色修身西装”.
    const harmlessHints = new Set(["firstGender", "gender", "subjectType", "shotSize", "aspectRatio"]);
    sentencePreview = sentenceCandidates(source).filter(item => {
      if (/Color$|color$/.test(item.field)) return false; // Colors need an explicit object binding.
      return source.toLowerCase().includes(item.zh.toLowerCase()) || (item.via === "hint" && harmlessHints.has(item.field));
    });
    $("sentenceResult").hidden = !source;
    $("sentenceEmpty").hidden = Boolean(sentencePreview.length);
    $("sentenceSummary").textContent = `识别到 ${sentencePreview.length} 个确定选项，尚未应用；不会随机补全。`;
    $("sentenceCoverage").textContent = `原句：${source}\n只识别下列选项。未列出的主体、地点、时间、颜色及关系均未解析，不会自动翻译或写入。`;
    const root = $("sentenceChips"); root.replaceChildren();
    for (const item of sentencePreview) root.append(uxElement("span", "ux-chip", `${sentenceFieldLabel(item.field)}：${item.zh}`));
    $("sentenceApply").disabled = !sentencePreview.length;
    saveAutosave();
  }

  function usabilityChecks() {
    const checks = [];
    if (missingCustomTranslations().length) checks.push({status:"warn", title:"自定义内容未翻译", detail:"部分自定义内容只填写一种语言；另一语言输出不包含该描述，请补齐后分别核对。"});
    if (getModel().type === "image" && /coherent motion|natural blinking/.test(currentEnglish())) checks.push({status:"warn", title:"图片中的运动描述", detail:"当前图片提示词含运动或眨眼描述；如不需要，可清空动作或对应画质标签。"});
    const shoes = $("shoes")?.value || "";
    if (shoes && !/barefoot/.test(shoes) && /bare feet|barefoot/.test($("legPose")?.value || "")) checks.push({status:"warn", title:"鞋履与腿部描述", detail:"同时选择了鞋履和赤足描述，请在服装或动作中保留一种。"});
    return checks;
  }

  function recordUsabilityChange(before, label) {
    if (!usabilityReady || usabilityRestoring || !before) return;
    const after = collectState();
    const fields = Object.keys(after).filter(id => $(id)?.matches("[data-state]") && String(before[id] ?? "") !== String(after[id] ?? ""));
    if (JSON.stringify(before.customEditors) !== JSON.stringify(after.customEditors)) fields.push("自定义启用与范围");
    if (JSON.stringify(before.quality) !== JSON.stringify(after.quality)) fields.push("画质标签");
    if (!fields.length) { usabilityLastState = after; return; }
    usabilityUndo.push(structuredClone(before));
    if (usabilityUndo.length > 20) usabilityUndo.shift();
    const list = $("uxChangeList"); list.replaceChildren();
    for (const id of fields) {
      const row = uxElement("li", "", `${$(id) ? sentenceFieldLabel(id) : id}：${String(before[id] || "未指定")} → ${String(after[id] || "未指定")}`);
      list.append(row);
    }
    for (const reason of usabilityCorrections) list.append(uxElement("li", "", `联动原因：${reason}`));
    usabilityCorrections = [];
    $("uxChangeSummary").textContent = `${label} · 修改 ${fields.length} 项（查看前后值）`;
    usabilityLastState = after;
    $("uxUndo").disabled = false;
    refreshUsability();
  }

  function jumpToEditor(id) {
    const el = $(id); const card = el?.closest(".form-card");
    if (!el || !card) return;
    setWorkspaceView(true);
    compactMode = false; applyCompactMode();
    goToWizardStep(WIZARD_STEPS.findIndex(step => step[0] === card.id));
    // Keep dependency gates intact; search does not force unavailable controls visible.
    const field = el.closest(".field") || el.closest("label");
    for (const button of $$("#wizardCategories button")) {
      if (field?.offsetParent !== null) break;
      button.click();
    }
    if (field?.offsetParent === null) {
      $("uxSearchStatus").textContent = "已定位所属步骤；此字段受当前主体、模式或前置选项限制，暂不可编辑。";
      return;
    }
    field?.scrollIntoView({block:"center",behavior:"smooth"});
    field?.classList.add("ux-focus");
    setTimeout(() => field?.classList.remove("ux-focus"),2000);
    const focus = field?.querySelector(".combo-input") || el;
    focus.focus();
  }

  function refreshSearch() {
    if (!usabilityReady) return;
    const query = $("uxFieldSearch").value.trim().toLowerCase();
    const modifiedOnly = $("uxModifiedOnly").checked;
    const list = $("uxSearchResults"); list.replaceChildren();
    if (!query && !modifiedOnly) { $("uxSearchStatus").textContent = "搜索全部步骤；点击结果跳转，隐藏项会说明依赖限制。"; return; }
    const matches = $$(".form-card [data-state]").filter(el => {
      if (el.type === "hidden") return false;
      const label = sentenceFieldLabel(el.id);
      return (!modifiedOnly || fieldModified(el.id)) && (!query || `${label} ${el.value}`.toLowerCase().includes(query));
    });
    for (const el of matches.slice(0,40)) {
      const btn = uxElement("button", "ux-search-item", `${sentenceFieldLabel(el.id)}${fieldModified(el.id) ? " · 已修改" : ""}`);
      btn.type="button"; btn.addEventListener("click", () => jumpToEditor(el.id)); list.append(btn);
    }
    $("uxSearchStatus").textContent = `找到 ${matches.length} 个字段${matches.length > 40 ? "，显示前 40 项，请继续缩小搜索" : ""}`;
  }

  function refreshUsability() {
    if (!usabilityReady) return;
    for (const [proxy,id] of [["uxModel","model"],["uxSubject","subjectType"]]) {
      const source = $(id), dest = $(proxy);
      if (dest.options.length !== source.options.length) dest.replaceChildren(...[...source.options].map(op => op.cloneNode(true)));
      dest.value = source.value;
    }
    const pending = quickPresetDirty || Boolean($("stylePreset")?.value && !quickPresetApplied);
    $("uxOutputState").textContent = pending ? "有待应用预设 · 下方仍是当前生效结果" : "当前生效结果 · 手动字段已同步";
    $("uxOutputState").classList.toggle("is-pending", pending);
    $("uxApplied").textContent = [getModel().label, $("subjectType").selectedOptions[0]?.textContent, `${getSize().width}×${getSize().height}`, pairText("scene","zh"), pairText("shotSize","zh")].filter(Boolean).join(" · ");
    $("applyQuickButton").textContent = styleCurrentMode() === "random-rest" ? "应用并补全未固定项" : "应用当前选择";
    $("applyQuickButton").title = "顶部选择会替换对应字段；手动修改的其他字段会保留。应用后可撤销并查看修改记录。";
    for (const id of CUSTOM_EDITOR_IDS) {
      const control = $(`${id}UxStatus`); if (!control) continue;
      const hasText = Boolean(inputValue(id) || inputValue(`${id}Zh`));
      const state = customEditors[id] || {};
      control.textContent = !hasText ? "空白，不写入结果" : !customEditorActive(id) ? "草稿已保留 · 当前未启用或不适用" : missingCustomTranslations().includes(id) ? "已启用 · 缺少另一语言，不自动翻译" : "已启用 · 中英文分别采用原文";
      $(`${id}UxEnabled`).checked = state.enabled !== false;
      if ($(`${id}UxMode`)) $(`${id}UxMode`).value = state.mode || "append";
    }
    $("uxUndo").disabled = !usabilityUndo.length;
    const conflicts = detectConflicts();
    for (const hint of $$(".ux-field-warning")) hint.remove();
    for (const conflict of conflicts) for (const id of conflict.fields) {
      $(id)?.closest("label")?.append(uxElement("small","ux-field-warning",`存在冲突：${conflict.fields.map(sentenceFieldLabel).join(" / ")}。请核对选择。`));
    }
    refreshSearch();
  }

  function setupUsability() {
    const quick = uxElement("div","ux-quick-context");
    for (const [id,source,label] of [["uxModel","model","目标模型"],["uxSubject","subjectType","主体类型"]]) {
      const wrap=uxElement("label","",label); const select=uxElement("select"); select.id=id;
      select.append(...[...$(source).options].map(op=>op.cloneNode(true)));
      select.addEventListener("change",()=> { $(source).value=select.value; $(source).dispatchEvent(new Event("change",{bubbles:true})); });
      wrap.append(select); quick.append(wrap);
    }
    document.querySelector(".command-bar").prepend(quick);
    const panel=uxElement("section","ux-detail-tools");
    panel.innerHTML='<label>查找设置 <input id="uxFieldSearch" type="search" placeholder="字段名称或当前值"></label><label class="ux-inline"><input type="checkbox" id="uxModifiedOnly">只看已修改</label><button type="button" class="button secondary small" id="uxUndo" disabled>撤销上一步</button><small id="uxSearchStatus"></small><div id="uxSearchResults"></div><details><summary id="uxChangeSummary">修改记录 · 尚无修改</summary><ul id="uxChangeList"></ul></details><p class="ux-note">“不指定”不写入对应选项；“跟随预设”允许联动。手动修改会标记为已修改，随机补全保留这些字段。</p>';
    document.querySelector(".wizard-bar").after(panel);
    $("uxFieldSearch").addEventListener("input",refreshSearch);
    $("uxModifiedOnly").addEventListener("change",refreshSearch);
    $("uxUndo").addEventListener("click",()=> {
      const previous=usabilityUndo.pop(); if (!previous) return;
      usabilityRestoring=true; applyState(previous); usabilityRestoring=false;
      usabilityLastState=collectState(); saveAutosave(); refreshUsability();
      $("uxChangeSummary").textContent="已撤销上一步修改"; $("uxChangeList").replaceChildren();
    });
    const output=uxElement("div","ux-output-state");
    output.innerHTML='<strong id="uxOutputState" role="status"></strong><small id="uxApplied"></small><small>像素尺寸仅供参考，仍需在 ComfyUI 中设置。</small>';
    document.querySelector(".output-header").after(output);
    const zhToggle=uxElement("button","text-button","收起中文参考"); zhToggle.type="button"; zhToggle.id="uxZhToggle";
    document.querySelector(".bilingual-secondary-head").append(zhToggle);
    const syncZh=()=> { const hidden=storageGet("promptStudio.zhCollapsed.v1",false); $("promptZhOutput").hidden=hidden; zhToggle.textContent=hidden?"展开中文参考":"收起中文参考"; zhToggle.setAttribute("aria-expanded",String(!hidden)); };
    zhToggle.addEventListener("click",()=> {storageSet("promptStudio.zhCollapsed.v1",!$("promptZhOutput").hidden);syncZh();}); syncZh();
    const privacy=uxElement("label","ux-inline"); const privacyInput=uxElement("input"); privacyInput.type="checkbox";
    privacyInput.checked=storageGet("promptStudio.hideSavedPreview.v1",false);
    const applyPrivacy=()=> document.querySelector('.tab-panel[data-panel="saved"]').classList.toggle("ux-hide-previews",privacyInput.checked);
    privacyInput.addEventListener("change",()=> {storageSet("promptStudio.hideSavedPreview.v1",privacyInput.checked);applyPrivacy();});
    privacy.append(privacyInput,document.createTextNode("隐藏收藏与历史正文预览")); document.querySelector('.tab-panel[data-panel="saved"]').prepend(privacy); applyPrivacy();
    for (const id of CUSTOM_EDITOR_IDS) {
      const input=$(id); const wrap=input?.closest("label"); if(!wrap) continue;
      const controls=uxElement("div","ux-custom-controls");
      const enabledLabel=uxElement("label","ux-inline"); const enabled=uxElement("input"); enabled.type="checkbox"; enabled.id=`${id}UxEnabled`; enabled.checked=true;
      enabledLabel.append(enabled,document.createTextNode("启用此草稿")); controls.append(enabledLabel);
      enabled.addEventListener("change",()=> {customEditors[id]={...customEditors[id],enabled:enabled.checked,scope:contentScale()};updateOutput();saveAutosave();});
      if (["characterCustom","garmentGraphicCustom"].includes(id)) {
        const mode=uxElement("select"); mode.id=`${id}UxMode`; mode.setAttribute("aria-label",`${sentenceFieldLabel(id)}作用方式`);
        for(const [value,label] of [["append","补充本组描述"],["replace",id==="characterCustom"?"替换角色外观（保留身份）":"替换服装图案描述"]]) {const option=uxElement("option","",label); option.value=value;mode.append(option);}
        mode.addEventListener("change",()=> {customEditors[id]={...customEditors[id],mode:mode.value};updateOutput();saveAutosave();});controls.append(mode);
      }
      const status=uxElement("small");status.id=`${id}UxStatus`;controls.append(status);
      // Controls live outside the textarea's label: nested labels are invalid HTML.
      wrap.after(controls);
      for(const field of [input,$(`${id}Zh`)].filter(Boolean)) field.addEventListener("input",()=> {
        customEditors[id]={...customEditors[id],scope:contentScale()};
      });
    }
    for(const card of $$(".form-card")) {
      const button=uxElement("button","text-button","重置本组");button.type="button";
      button.addEventListener("click",()=> {
        const state=collectState();
        for(const field of $$('[data-state]',card)) state[field.id]=DEFAULTS[field.id]??(field.type==="checkbox"?false:"");
        applyState(state);saveAutosave();
      });
      card.querySelector(".card-heading")?.append(button);
      for(const input of $$('[data-state]',card)) {
        if(input.type==="hidden") continue;
        const field=input.closest("label.field"); if(!field || field.querySelector(".ux-reset"))continue;
        const reset=uxElement("button","text-button ux-reset","恢复默认");reset.type="button";reset.setAttribute("aria-label",`恢复默认：${sentenceFieldLabel(input.id)}`);
        reset.addEventListener("click",event=> {event.preventDefault();event.stopPropagation();const value=DEFAULTS[input.id]??"";if(input.type==="checkbox")input.checked=Boolean(value);else if(input.tagName==="SELECT")setSelectValue(input.id,String(value));else input.value=String(value);input.dispatchEvent(new Event("change",{bubbles:true}));});
        field.append(reset);
        field.addEventListener("focusin",()=> {
          const en=selectedPair(input.id,"en"),zh=selectedPair(input.id,"zh");
          for(const [id,fragment] of [["promptOutput",en],["promptZhOutput",zh]]) {
            const out=$(id),index=fragment?out.value.toLowerCase().indexOf(fragment.toLowerCase()):-1;
            if(index>=0)out.setSelectionRange(index,index+fragment.length);
          }
        });
      }
    }
    $("sentenceApply").addEventListener("click",()=> {if($("sentenceInput").value.trim()!==sentencePreviewSource){previewSentence();return;} if(sentencePreview.length)applySentence(sentencePreview);});
    $("sentenceInput").addEventListener("input",()=> {$("sentenceApply").disabled=true;saveAutosave();});
    // Log after existing application handlers have completed, including linked updates.
    let timer;
    const schedule=event=> {
      if(event.target.closest("#uxSearchResults") || ["uxFieldSearch","uxModifiedOnly","uxUndo"].includes(event.target.id))return;
      if(!event.target.closest("main"))return;
      clearTimeout(timer);timer=setTimeout(()=>recordUsabilityChange(usabilityLastState,"最近操作"),180);
    };
    document.addEventListener("change",schedule);
    document.addEventListener("input",schedule);
    document.addEventListener("click",schedule);
    usabilityReady=true;usabilityLastState=collectState();refreshUsability();
  }
