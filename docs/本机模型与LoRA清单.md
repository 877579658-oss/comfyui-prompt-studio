# 本机模型与 LoRA 清单

> 扫描位置：`E:\Comfy-Desktop\ComfyUI-Shared\models`
> 生成时间：2026-11-11
> 说明：**明确属于性行为 / 性器官类的 LoRA（共 22 个）已规避，不在本清单列出文件名**；其余模型、加速 LoRA、模型级增强与服饰材质类 LoRA 全部列出。

---

## 一、扩散模型（8 个）

| 文件 | 大小 | 分辨率 | 步数 / CFG / 采样 | 站点对应 |
| --- | --- | --- | --- | --- |
| `z_image_turbo_bf16.safetensors` | 11,740 MB | 1024² | 8 / 1.0 / `res_multistep`+`simple` | Z-Image Turbo |
| `z_image_int8_convrot.safetensors` | 5,914 MB | 1024² | 32 / 4 / `res_multistep`+`simple` | Z-Image INT8 |
| `moss_image_sft_int8_convrot.safetensors` | 5,163 MB | 1024² | 25 / 2.5 / `er_sde`+`simple` | MOSS Image / MOSS 图像编辑 |
| `flux-2-klein-4b-fp8.safetensors` | 3,882 MB | 1024² | — | Flux2 Klein |
| `minimax_h3_fl2va_pruned_w6a8.safetensors` | 15,243 MB | 864×480 | 快 4 / 画质 18 | MiniMax H3（三个选项） |
| `wan2.2_ti2v_5B_fp16.safetensors` | 9,536 MB | 768×768 | 24 / 5 / `uni_pc`+`simple` | Wan 2.2 TI2V-5B |
| `Wan2.2-I2V-A14B-HighNoise-Q4_K_M.gguf` | 9,205 MB | 640×640 | 4（lightx2v） | Wan 2.2 I2V-A14B |
| `Wan2.2-I2V-A14B-LowNoise-Q4_K_M.gguf` | 9,205 MB | 640×640 | 4（lightx2v） | Wan 2.2 I2V-A14B（4 步加速） |

---

## 二、加速 / 画质类 LoRA（4 个）

| 文件 | 大小 | 用途 |
| --- | --- | --- |
| `wan2.2_i2v_lightx2v_4steps_lora_v1_high_noise.safetensors` | 1,170 MB | Wan I2V 4 步加速（high noise） |
| `wan2.2_i2v_lightx2v_4steps_lora_v1_low_noise.safetensors` | 1,170 MB | Wan I2V 4 步加速（low noise） |
| `MiniMaxH3-turbo-4step-pruned.safetensors` | 592 MB | H3 快出模式 4 步 |
| `MiniMaxH3-realism-people.safetensors` | 125 MB | H3 写实人像增强 |

---

## 三、模型级增强 LoRA（11 个）

| 文件 | 大小 | 用途 |
| --- | --- | --- |
| `ZImage-NSFW\NSFW-Master-ZIT.safetensors` | 1,185 MB | Z-Image 主增强 |
| `NSFW-22-H-e8.safetensors` | 585 MB | Wan 视频增强（high） |
| `NSFW-22-L-e8.safetensors` | 585 MB | Wan 视频增强（low） |
| `Wan2.2-NSFW\DR34ML4Y_I2V_14B_HIGH_V2.safetensors` | 293 MB | Wan I2V 14B 增强（high） |
| `Wan2.2-NSFW\DR34ML4Y_I2V_14B_LOW_V2.safetensors` | 293 MB | Wan I2V 14B 增强（low） |
| `Wan2.2-NSFW\DR34ML4Y_TI2V_5B_V1.safetensors` | 308 MB | Wan TI2V 5B 增强 |
| `MiniMaxH3-NSFW-AIO-V2.safetensors` | 296 MB | H3 综合增强 V2 |
| `MiniMaxH3-NSFW-AIO-V2.5.safetensors` | 82 MB | H3 综合增强 V2.5 |
| `MOSS-Image-NSFW-Uncensored-LoRA-ComfyUI.safetensors` | 71 MB | MOSS 增强 |
| `ZImage-NSFW\actions\lora-nsfw1.safetensors` | 593 MB | Z-Image 通用增强 |

---

## 四、服饰 / 材质 / 人物类 LoRA（7 个）

| 文件 | 大小 | 用途 |
| --- | --- | --- |
| `ZImage-NSFW\actions\lora-lingerie.safetensors` | 162 MB | 内衣质感 |
| `ZImage-NSFW\actions\lora-panty.safetensors` | 162 MB | 袜类 / 内搭质感 |
| `ZImage-NSFW\actions\lora-oiled-skin.safetensors` | 162 MB | 油润皮肤质感 |
| `ZImage-NSFW\actions\lora-tattoo.safetensors` | 162 MB | 纹身元素 |
| `ZImage-NSFW\actions\lora-women.safetensors` | 162 MB | 女性人物表现 |
| `ZImage-NSFW\actions\lora-foot.safetensors` | 324 MB | 足部细节 |
| `ZImage-NSFW\actions\lora-footing.safetensors` | 324 MB | 足部表现 |

---

## 五、已规避项（仅统计，不列文件名）

`ZImage-NSFW\actions\` 下共 **22 个** LoRA 属于明确性行为 / 性器官类，按约定不列入本清单。

> 如需在站点里使用上面列出的 LoRA：把它们的触发词填到「我的 LoRA 清单」（支持批量粘贴 / 导入 JSON）。触发词以 LoRA 作者页面或模型元数据为准，站点不预置。

---

## 六、与站点的对应关系

| 站点能力 | 对应本清单 |
| --- | --- |
| 模型下拉 12 项 | 第一节的模型 + 两个 4 步加速工作流 |
| 自动套用尺寸 | 第一节的分辨率列 |
| 自动触发词 | MOSS → `moss_xvstyle`；H3 → `hmmotion` |
| 负面通道 | H3 无负面通道，句尾补排除项 |
| 机位约束 | Wan / H3 建议 `static camera` |
| LoRA 清单 | 第二、三、四节的条目，手动录入触发词后使用 |
