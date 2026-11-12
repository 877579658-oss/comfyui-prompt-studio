from pathlib import Path
import os


PROJECT = Path(__file__).resolve().parents[1]
FILES = [
    ("index.html", "index.html"),
    ("app.js", "app.js"),
    ("styles.css", "styles.css"),
    ("data/prompts.js", "data/prompts.js"),
    ("README.md", "README.md"),
    ("server.js", "server.js"),
    ("\u542f\u52a8\u63d0\u793a\u8bcd\u5de5\u4f5c\u53f0.cmd", "start-local.cmd"),
    ("\u542f\u52a8\u5c40\u57df\u7f51\u8bbf\u95ee.cmd", "start-lan.cmd"),
]
COMFY_ROOT = Path(
    os.environ.get("COMFYUI_ROOT", r"E:\Comfy-Desktop\ComfyUI-Installs\ComfyUI")
)
TEXT_ENCODERS = COMFY_ROOT / "ComfyUI" / "comfy" / "text_encoders"
TOKENIZERS = [
    TEXT_ENCODERS / "qwen25_tokenizer",
    TEXT_ENCODERS / "qwen35_tokenizer",
]
UMT5_MODEL = Path(
    os.environ.get(
        "COMFYUI_SHARED_MODELS",
        r"E:\Comfy-Desktop\ComfyUI-Shared\models",
    )
) / "text_encoders" / "umt5_xxl_fp8_e4m3fn_scaled.safetensors"
TEXTS = [
    "\u4e00\u4f4d\u660e\u786e\u6210\u5e74\u7684\u865a\u6784\u89d2\u8272\uff0c"
    "\u8eab\u7a7f\u4e1d\u8d28\u7761\u888d\uff0c\u67d4\u548c\u7a97\u5149\u3002",
    "\u96e8\u591c\u8857\u9053\uff0c\u9713\u8679\u5012\u5f71\uff0c"
    "\u955c\u5934\u7f13\u6162\u63a8\u8fdb\u3002",
]


def audit_project_files():
    failed = False
    for relative, label in FILES:
        path = PROJECT / relative
        data = path.read_bytes()
        try:
            text = data.decode("utf-8", errors="strict")
        except UnicodeDecodeError as error:
            print(f"FAIL {label}: invalid UTF-8 at byte {error.start}")
            failed = True
            continue
        replacement = text.count("\ufffd")
        nul = "\x00" in text
        status = "OK" if replacement == 0 and not nul else "FAIL"
        print(
            f"{status} {label}: bytes={len(data)} "
            f"replacement={replacement} nul={nul}"
        )
        failed = failed or replacement > 0 or nul
    return failed


def audit_tokenizers():
    try:
        from transformers import Qwen2Tokenizer
    except Exception as error:
        print(f"SKIP tokenizers: {error}")
        return False

    failed = False
    for tokenizer_path in TOKENIZERS:
        if not tokenizer_path.exists():
            print(f"SKIP missing tokenizer: {tokenizer_path}")
            failed = True
            continue
        tokenizer = Qwen2Tokenizer.from_pretrained(str(tokenizer_path))
        for index, text in enumerate(TEXTS, start=1):
            token_ids = tokenizer.encode(text, add_special_tokens=False)
            decoded = tokenizer.decode(token_ids, skip_special_tokens=False)
            ok = decoded == text
            print(
                f"{'OK' if ok else 'FAIL'} {tokenizer_path.name} text={index} "
                f"codepoints={len(text)} tokens={len(token_ids)}"
            )
            failed = failed or not ok
    return failed


def audit_umt5():
    if not UMT5_MODEL.exists():
        print(f"SKIP missing UMT5 model: {UMT5_MODEL}")
        return True
    try:
        import sentencepiece as spm
        from safetensors import safe_open
    except Exception as error:
        print(f"SKIP UMT5: {error}")
        return False

    with safe_open(str(UMT5_MODEL), framework="np") as model:
        raw = model.get_tensor("spiece_model").tobytes()
    processor = spm.SentencePieceProcessor(model_proto=raw)
    failed = False
    for index, text in enumerate(TEXTS, start=1):
        pieces = processor.encode(text, out_type=str)
        decoded = processor.decode(processor.encode(text))
        ok = decoded == text
        print(
            f"{'OK' if ok else 'FAIL'} umt5_xxl text={index} "
            f"codepoints={len(text)} pieces={len(pieces)}"
        )
        failed = failed or not ok
    return failed


if __name__ == "__main__":
    has_failures = audit_project_files()
    has_failures = audit_tokenizers() or has_failures
    has_failures = audit_umt5() or has_failures
    raise SystemExit(1 if has_failures else 0)
