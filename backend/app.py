# app.py
"""
Quran Reciter App
مهمّة: تطبيق لاختبار التلاوة (جزء 30).
"""

import os
import time
import tempfile
import shutil
import random
import requests
import re
import unicodedata
import json
from difflib import SequenceMatcher
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment
from jiwer import wer
from i18n.translations import get_translation, get_feedback_message, is_supported_language
from data.surah_names import get_english_name

# ------------- إعداد التطبيق -------------
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET", "change_this_in_prod")
CORS(app)  # Enable CORS for mobile app

# حد حجم التحميل (10 ميجابايت)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

# ------------- إعداد النموذج المحسّن بـ faster-whisper -------------
# Use the optimized CTranslate2 model for 4x speed improvement
MODEL_NAME = "OdyAsh/faster-whisper-base-ar-quran"

# Import faster-whisper for optimal performance
try:
    from faster_whisper import WhisperModel
    USE_FASTER_WHISPER = True
    print("✅ Using faster-whisper for OPTIMAL performance (4x faster!)")
except ImportError:
    from transformers import pipeline
    USE_FASTER_WHISPER = False
    print("⚠️ faster-whisper not available, using transformers (slower)")

# Device configuration
import torch
gpu_available = torch.cuda.is_available()

# Global model instance
asr_model = None

def get_asr_pipeline():
    """تحميل نموذج ASR محسّن بـ faster-whisper للحصول على أفضل أداء"""
    global asr_model, MODEL_NAME, USE_FASTER_WHISPER
    
    if asr_model is None:
        print(f"🚀 Loading OPTIMIZED ASR model: {MODEL_NAME}")
        device_info = 'GPU' if gpu_available else 'CPU'
        print(f"🎯 Device: {device_info}")
        
        start_time = time.time()
        
        try:
            if USE_FASTER_WHISPER:
                # Use faster-whisper (CTranslate2) - Much faster!
                device = "cuda" if gpu_available else "cpu"
                compute_type = "float16" if gpu_available else "int8"  # Quantization for speed
                
                print(f"🔥 Loading with faster-whisper (device={device}, compute_type={compute_type})")
                asr_model = WhisperModel(
                    MODEL_NAME,
                    device=device,
                    compute_type=compute_type,
                    download_root=None,
                    local_files_only=False
                )
                
                load_time = time.time() - start_time
                print(f"✅ faster-whisper model loaded in {load_time:.2f} seconds")
                
                # Model warmup with faster-whisper
                print("🔥 Warming up faster-whisper model...")
                warmup_start = time.time()
                try:
                    import numpy as np
                    # Create 1 second of silence for warmup
                    dummy_audio = np.zeros(16000, dtype=np.float32)
                    
                    # Run warmup inference
                    segments, info = asr_model.transcribe(dummy_audio, language="ar")
                    list(segments)  # Consume the generator
                    
                    warmup_time = time.time() - warmup_start
                    print(f"🚀 faster-whisper warmed up in {warmup_time:.2f} seconds!")
                    print("💡 Model ready for BLAZING FAST inference!")
                    
                except Exception as e:
                    print(f"⚠️ faster-whisper warmup failed: {e}")
                
            else:
                # Fallback to transformers pipeline
                device = 0 if gpu_available else -1
                asr_model = pipeline(
                    "automatic-speech-recognition",
                    model="tarteel-ai/whisper-base-ar-quran",
                    device=device,
                    torch_dtype=torch.float16 if gpu_available else torch.float32
                )
                
                load_time = time.time() - start_time
                print(f"✅ Transformers pipeline loaded in {load_time:.2f} seconds")
                
        except Exception as e:
            print(f"❌ Error loading optimized model: {e}")
            print("🔄 Falling back to basic model...")
            
            # Ultimate fallback
            if USE_FASTER_WHISPER:
                try:
                    asr_model = WhisperModel("base", device="cpu", compute_type="int8")
                    print("✅ Fallback faster-whisper model loaded")
                except:
                    USE_FASTER_WHISPER = False
            
            if not USE_FASTER_WHISPER:
                device = 0 if gpu_available else -1
                from transformers import pipeline
                asr_model = pipeline("automatic-speech-recognition", model="openai/whisper-base", device=device)
                print("✅ Ultimate fallback to transformers model loaded")
    
    return asr_model

def transcribe_audio_optimized(audio_path):
    """Transcribe audio using the optimized faster-whisper model"""
    model = get_asr_pipeline()
    
    if USE_FASTER_WHISPER:
        # Use faster-whisper transcription (MUCH FASTER!)
        segments, info = model.transcribe(audio_path, language="ar")
        
        # Extract text from segments
        transcription = ""
        for segment in segments:
            transcription += segment.text + " "
        
        return {
            "text": transcription.strip(),
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "optimized": True
        }
    else:
        # Use transformers pipeline (fallback)
        import numpy as np
        import soundfile as sf
        
        if isinstance(audio_path, str):
            # Load audio file as numpy array
            audio, sample_rate = sf.read(audio_path)
            if sample_rate != 16000:
                import librosa
                audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=16000)
        else:
            audio = audio_path
            
        result = model(audio)
        return {"text": result["text"], "optimized": False}

# ------------- إعدادات API للقرآن الكريم -------------
API_BASE_URL = "https://api.quran.com/api/v4"


# متغيرات تخزين مؤقت للسور (Cache)
_cached_surahs = None
_cache_timestamp = None
CACHE_DURATION = 3600  # ساعة واحدة


# ------------- وظائف API للقرآن الكريم -------------
def clean_html_tags(text):
    """إزالة علامات HTML من النص."""
    clean_text = re.sub(r"<sup.*?</sup>", "", text)
    clean_text = re.sub(r"<[^>]+>", "", clean_text)
    return clean_text.strip()


def get_all_surahs():
    """جلب قائمة جميع السور من API مع نظام تخزين مؤقت."""
    global _cached_surahs, _cache_timestamp

    # فحص التخزين المؤقت
    if _cached_surahs and _cache_timestamp:
        if (time.time() - _cache_timestamp) < CACHE_DURATION:
            return _cached_surahs, None

    url = f"{API_BASE_URL}/chapters"
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        chapters = response.json().get("chapters", [])

        # تحويل البيانات إلى تنسيق مناسب مع الأسماء الإنجليزية
        surahs = [(ch["id"], ch["name_arabic"], ch.get("name_simple", f"Surah {ch['id']}")) for ch in chapters]

        # حفظ في التخزين المؤقت
        _cached_surahs = surahs
        _cache_timestamp = time.time()

        return surahs, None

    except requests.exceptions.RequestException as e:
        print(f"خطأ في جلب السور: {e}")
        # في حالة الخطأ، ارجع للقائمة اليدوية لجزء عمّ مع أسماء إنجليزية
        juz30_surahs = get_juz30_surahs_fallback()
        # Add English names to the fallback data
        enhanced_surahs = []
        for surah_id, arabic_name in juz30_surahs:
            english_name = get_english_name(surah_id)
            enhanced_surahs.append((surah_id, arabic_name, english_name))
        return (
            enhanced_surahs,
            f"تم استخدام القائمة المحلية بسبب خطأ في الشبكة: {e}",
        )


def get_juz30_surahs():
    """جلب سور جزء عمّ فقط من API."""
    all_surahs, error = get_all_surahs()
    if error:
        return all_surahs, error

    # تصفية السور لجزء عمّ (السور من 78 إلى 114)
    juz30_surahs = [(id, arabic_name, english_name) for id, arabic_name, english_name in all_surahs if 78 <= id <= 114]
    return juz30_surahs, None


def get_juz30_surahs_fallback():
    """قائمة احتياطية لسور جزء عمّ في حالة عدم توفر الإنترنت."""
    return [
        (78, "النبأ", "An-Naba"),
        (79, "النازعات", "An-Naziat"),
        (80, "عبس", "Abasa"),
        (81, "التكوير", "At-Takwir"),
        (82, "الانفطار", "Al-Infitar"),
        (83, "المطففين", "Al-Mutaffifin"),
        (84, "الانشقاق", "Al-Inshiqaq"),
        (85, "البروج", "Al-Buruj"),
        (86, "الطارق", "At-Tariq"),
        (87, "الأعلى", "Al-A'la"),
        (88, "الغاشية", "Al-Ghashiyah"),
        (89, "الفجر", "Al-Fajr"),
        (90, "البلد", "Al-Balad"),
        (91, "الشمس", "Ash-Shams"),
        (92, "الليل", "Al-Layl"),
        (93, "الضحى", "Ad-Duha"),
        (94, "الشرح", "Ash-Sharh"),
        (95, "التين", "At-Tin"),
        (96, "العلق", "Al-Alaq"),
        (97, "القدر", "Al-Qadr"),
        (98, "البينة", "Al-Bayyinah"),
        (99, "الزلزلة", "Az-Zalzalah"),
        (100, "العاديات", "Al-Adiyat"),
        (101, "القارعة", "Al-Qariah"),
        (102, "التكاثر", "At-Takathur"),
        (103, "العصر", "Al-Asr"),
        (104, "الهمزة", "Al-Humazah"),
        (105, "الفيل", "Al-Fil"),
        (106, "قريش", "Quraysh"),
        (107, "الماعون", "Al-Ma'un"),
        (108, "الكوثر", "Al-Kawthar"),
        (109, "الكافرون", "Al-Kafirun"),
        (110, "النصر", "An-Nasr"),
        (111, "المسد", "Al-Masad"),
        (112, "الإخلاص", "Al-Ikhlas"),
        (113, "الفلق", "Al-Falaq"),
        (114, "الناس", "An-Nas"),
    ]


def get_surah_verses(surah_id):
    """جلب آيات سورة معينة."""
    url = f"{API_BASE_URL}/chapters/{surah_id}/verses"
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
        verses = data.get("verses", [])
        return verses, None
    except requests.exceptions.RequestException as e:
        print(f"خطأ في جلب آيات السورة {surah_id}: {e}")
        return [], f"خطأ في جلب آيات السورة: {e}"


def get_ayah_from_quran_api(surah_id, ayah_number):
    """جلب نص آية معينة من API الرئيسي (Quran.com)."""
    url = f"{API_BASE_URL}/verses/by_key/{surah_id}:{ayah_number}"
    params = {"fields": "text_imlaei"}
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        verse = data.get("verse", {})
        text = verse.get("text_imlaei", "")
        return clean_html_tags(text)
    except Exception as e:
        print(f"خطأ في API الرئيسي: {e}")
    return ""


def get_ayah_text(surah_id, ayah_number):
    """جلب نص الآية مع نظام احتياطي متعدد."""
    # أولاً: جرب API الرئيسي
    text = get_ayah_from_quran_api(surah_id, ayah_number)
    if text:
        return text
    # وإلا لا يوجد نص متاح
    return ""


# ------------- وظائف مساعدة -------------
def remove_diacritics(text):
    """إزالة التشكيل - للاستخدام في حالات خاصة فقط"""
    return "".join(
        c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn"
    )


def normalize_text_for_compare(text):
    """تطبيع النص مع الاحتفاظ بالتشكيل للمقارنة الدقيقة"""
    if not text:
        return ""

    # لا نزيل التشكيل، فقط نزيل علامات الترقيم والأرقام
    text = re.sub(
        r"[^\w\s\u0600-\u06FF\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]", "", text
    )  # احتفظ بالحروف العربية والتشكيل
    text = unicodedata.normalize("NFKC", text)  # تطبيع Unicode للتشكيل
    return " ".join(text.split())  # تنظيف المسافات


def color_diff_html(ref_text, hyp_text):
    """
    تلوين كلمة-بكلمة باستخدام opcodes من SequenceMatcher.
    الكلمات المتطابقة تصبح باللون الأخضر، الكلمات المستبدلة بالأحمر،
    الإدخالات بالبرتقالي، الحذوفات بخط مائل.
    """
    ref_words = ref_text.split()
    hyp_words = hyp_text.split()
    s = SequenceMatcher(None, ref_words, hyp_words)
    parts = []
    for tag, i1, i2, j1, j2 in s.get_opcodes():
        if tag == "equal":
            for w in ref_words[i1:i2]:
                parts.append(f"<span class='word correct'>{w}</span>")
        elif tag == "replace":
            for w in hyp_words[j1:j2]:
                parts.append(f"<span class='word wrong'>{w}</span>")
        elif tag == "insert":
            for w in hyp_words[j1:j2]:
                parts.append(f"<span class='word insert'>{w}</span>")
        elif tag == "delete":
            for w in ref_words[i1:i2]:
                parts.append(f"<span class='word deleted'>{w}</span>")
    return " ".join(parts)


def create_word_analysis(ref_text, hyp_text):
    """
    Create structured word-by-word analysis data for API consumption.
    Returns list of word objects with text and status.
    """
    if not ref_text or not hyp_text:
        return []
    
    ref_words = ref_text.split()
    hyp_words = hyp_text.split()
    s = SequenceMatcher(None, ref_words, hyp_words)
    analysis = []
    
    for tag, i1, i2, j1, j2 in s.get_opcodes():
        if tag == "equal":
            # Correct words
            for w in ref_words[i1:i2]:
                analysis.append({
                    "text": w,
                    "status": "correct",
                    "type": "reference"
                })
        elif tag == "replace":
            # Wrong words - show both reference and detected
            for idx, w in enumerate(ref_words[i1:i2]):
                analysis.append({
                    "text": w,
                    "status": "wrong",
                    "type": "reference"
                })
            for idx, w in enumerate(hyp_words[j1:j2]):
                analysis.append({
                    "text": w,
                    "status": "wrong",
                    "type": "detected"
                })
        elif tag == "insert":
            # Extra words (inserted by user)
            for w in hyp_words[j1:j2]:
                analysis.append({
                    "text": w,
                    "status": "insert",
                    "type": "detected"
                })
        elif tag == "delete":
            # Missing words (should have been said)
            for w in ref_words[i1:i2]:
                analysis.append({
                    "text": w,
                    "status": "missing",
                    "type": "reference"
                })
    
    return analysis


def convert_to_wav(src_path):
    """
    تحويل أي ملف صوتي وارد (webm/ogg/mp3) إلى WAV مونو 16kHz - محسّن للسرعة.
    إرجاع مسار ملف WAV الجديد.
    """
    print(f"🎵 Converting audio: {os.path.basename(src_path)}")
    convert_start = time.time()
    
    basename = os.path.splitext(os.path.basename(src_path))[0]
    out_wav = os.path.join(tempfile.gettempdir(), f"{basename}_fast.wav")
    
    audio = AudioSegment.from_file(src_path)
    
    # Aggressive performance optimizations
    audio = audio.set_channels(1)  # Mono for faster processing
    audio = audio.set_frame_rate(16000)  # Whisper's optimal rate
    audio = audio.set_sample_width(2)  # 16-bit for balance of quality/speed
    
    # Trim silence to reduce processing time
    audio = audio.strip_silence(silence_len=100, silence_thresh=-50)
    
    # Limit audio length to 30 seconds (Whisper's max anyway)
    if len(audio) > 30000:  # 30 seconds
        print("⏰ Audio > 30s, trimming for faster processing")
        audio = audio[:30000]
    
    # Fast export with minimal processing
    audio.export(out_wav, format="wav", parameters=["-ac", "1", "-ar", "16000"])
    
    convert_time = time.time() - convert_start
    print(f"✅ Audio converted in {convert_time:.2f}s")
    
    return out_wav


# ------------- منطق تقييم التلاوة (محدّث) -------------
def evaluate_recitation(file_path, surah_id, ayah_number):
    """
    1) تحويل الملف إلى WAV إن لزم
    2) تشغيل ASR لإخراج النص
    3) جلب النص المرجعي من API
    4) مقارنة، حساب WER، تجهيز HTML ملون وإخراج رسالة تشجيع
    """
    # تأكد من صلاحية المدخلات (أساسية)
    try:
        wav_path = convert_to_wav(file_path)
    except Exception as e:
        print("Audio convert error:", e)
        # إذا التحويل فشل، جرّب إرسال الملف الأصلي مباشرة إلى الأنبوب
        wav_path = file_path

    # 1) استدعاء نموذج التعرف على الكلام
    asr_pipeline = get_asr_pipeline()
    asr_result = asr_pipeline(wav_path)
    hypothesis = asr_result.get("text", "").strip()

    # 2) نص المرجع من API
    reference_raw = get_ayah_text(surah_id, ayah_number)
    if not reference_raw:
        reference_raw = ""

    # 3) تطبيع النصوص للمقارنة وحساب WER
    ref_norm = normalize_text_for_compare(reference_raw)
    hyp_norm = normalize_text_for_compare(hypothesis)

    # حساب WER باستخدام jiwer
    try:
        error = wer(ref_norm, hyp_norm)
    except Exception:
        error = 1.0

    # 4) توليد HTML ملون
    colored = color_diff_html(ref_norm, hyp_norm)

    # 5)
    if error <= 0.10:
        feedback = "ممتاز"
    elif error <= 0.30:
        feedback = "انتبه لبعض الأخطاء"
    else:
        feedback = "جرب مرة أخرى!"

    return {
        "hypothesis": hypothesis,
        "reference_raw": reference_raw,
        "ref_norm": ref_norm,
        "hyp_norm": hyp_norm,
        "wer": error,
        "colored_html": colored,
        "feedback": feedback,
        "wav_path": wav_path,
    }


# ------------- مسارات الويب (Routes) -------------
# Flask template route removed - frontend is now served by Express/React


@app.route("/api/get_ayah", methods=["GET"])
def get_ayah_api():
    """API بسيط لجلب نص الآية (يستخدمه الجافاسكربت في الواجهة)."""
    surah = request.args.get("surah")
    ayah = request.args.get("ayah")
    if not surah or not ayah:
        return jsonify({"text": ""}), 400

    text = get_ayah_text(surah, ayah)
    return jsonify({"text": text or ""})


@app.route("/api/get_surah_info/<int:surah_id>", methods=["GET"])
def get_surah_info(surah_id):
    """جلب معلومات السورة وعدد آياتها."""
    url = f"{API_BASE_URL}/chapters/{surah_id}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        chapter = data.get("chapter", {})
        return jsonify(
            {
                "id": chapter.get("id"),
                "name_arabic": chapter.get("name_arabic"),
                "verses_count": chapter.get("verses_count"),
                "revelation_place": chapter.get("revelation_place"),
            }
        )
    except Exception as e:
        print(f"خطأ في جلب معلومات السورة: {e}")
        return jsonify({"error": "فشل في جلب معلومات السورة"}), 500


@app.route("/api/surahs", methods=["GET"])
def api_juz30_surahs():
    """API لجلب سور جزء عمّ فقط."""
    surahs_raw, error = get_juz30_surahs()
    
    # Convert to mobile-compatible format
    surahs = []
    for surah_data in surahs_raw:
        if isinstance(surah_data, (list, tuple)) and len(surah_data) >= 2:
            surah_id = surah_data[0]
            arabic_name = surah_data[1]
            # Use provided English name if available (3-tuple), otherwise fallback to get_english_name
            english_name = surah_data[2] if len(surah_data) > 2 else get_english_name(surah_id)
            
            surahs.append({
                'id': surah_id,
                'name_arabic': arabic_name,
                'name_simple': english_name,
                'name_english': english_name
            })
    
    if error:
        return jsonify({"surahs": surahs, "error": error}), 200
    return jsonify({"surahs": surahs})


@app.route("/api/all_surahs", methods=["GET"])
def api_all_surahs():
    """API لجلب جميع السور."""
    surahs_raw, error = get_all_surahs()
    
    # Convert to mobile-compatible format
    surahs = []
    for surah_data in surahs_raw:
        if isinstance(surah_data, (list, tuple)) and len(surah_data) >= 2:
            english_name = surah_data[2] if len(surah_data) > 2 else f"Surah {surah_data[0]}"
            surahs.append({
                'id': surah_data[0],
                'name_arabic': surah_data[1],
                'name_simple': english_name,
                'name_english': english_name
            })
    
    if error:
        return jsonify({"surahs": surahs, "error": error}), 200
    return jsonify({"surahs": surahs})


@app.route("/health")
@app.route("/api/health")
def health_check():
    """Health check endpoint for monitoring."""
    language = request.args.get('lang', 'en')
    if not is_supported_language(language):
        language = 'en'
    
    return jsonify({
        "status": "healthy",
        "service": get_translation("service_name", language),
        "message": get_translation("service_healthy", language),
        "supported_languages": ["en", "ar"]
    })


@app.route("/api/check", methods=["POST"])
def api_check_recitation():
    """API endpoint for mobile app recitation checking with language support."""
    try:
        # Get language preference
        language = request.form.get('language', 'en')
        if not is_supported_language(language):
            language = 'en'
        
        # Validate input
        audio_file = request.files.get('audio')
        if not audio_file or audio_file.filename == "":
            return jsonify({
                "error": get_translation("missing_audio", language)
            }), 400

        try:
            surah_id = int(request.form.get('surah_id'))
            ayah_number = int(request.form.get('ayah_number'))
        except (TypeError, ValueError):
            return jsonify({
                "error": get_translation("missing_surah", language)
            }), 400

        # Process the audio file temporarily
        tmp_dir = tempfile.mkdtemp(prefix="iqra_api_")
        try:
            saved_path = os.path.join(tmp_dir, audio_file.filename)
            audio_file.save(saved_path)

            # Evaluate recitation
            result = evaluate_recitation_api(saved_path, surah_id, ayah_number, language)
            return jsonify(result)

        finally:
            # Clean up temporary files
            try:
                shutil.rmtree(tmp_dir)
            except Exception:
                pass

    except Exception as e:
        import traceback
        print(f"❌ API check error: {e}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return jsonify({
            "error": get_translation("processing_error", language),
            "debug_message": str(e)
        }), 500


def evaluate_recitation_web(file_path, surah_id, ayah_number, language="ar"):
    """
    Evaluate recitation for web interface with language support.
    Returns dictionary for template rendering.
    """
    try:
        # Convert audio to WAV if needed
        try:
            wav_path = convert_to_wav(file_path)
        except Exception as e:
            print("Audio convert error:", e)
            wav_path = file_path

        # ASR processing
        asr_pipeline = get_asr_pipeline()
        asr_result = asr_pipeline(wav_path)
        hypothesis = asr_result.get("text", "").strip()

        # Get reference text
        reference_raw = get_ayah_text(surah_id, ayah_number)
        if not reference_raw:
            return {
                "error": get_translation("ayah_not_found", language)
            }

        # Normalize texts for comparison
        ref_norm = normalize_text_for_compare(reference_raw)
        hyp_norm = normalize_text_for_compare(hypothesis)

        # Calculate WER
        try:
            wer_score = wer(ref_norm, hyp_norm) if ref_norm and hyp_norm else 1.0
        except Exception:
            wer_score = 1.0

        # Get contextual feedback
        feedback = get_feedback_message(wer_score, language)

        # Create colored diff for web display
        colored_html = create_colored_diff(ref_norm, hyp_norm)

        return {
            "success": True,
            "wer_score": wer_score,
            "accuracy_percentage": round((1 - wer_score) * 100, 1),
            "detected_text": hypothesis,
            "reference_text": reference_raw,
            "feedback": feedback,
            "colored_diff": colored_html,
            "language": language,
            "surah_id": surah_id,
            "ayah_number": ayah_number
        }

    except Exception as e:
        print(f"Web evaluation error: {e}")
        return {
            "error": get_translation("processing_error", language)
        }


def evaluate_recitation_api(file_path, surah_id, ayah_number, language="en"):
    """
    Evaluate recitation for API with PERFORMANCE MONITORING.
    Returns JSON-formatted result.
    """
    total_start = time.time()
    
    try:
        print(f"🎯 Starting PERFORMANCE-MONITORED evaluation for Surah {surah_id}, Ayah {ayah_number}")
        
        # 1. Convert audio to WAV if needed (TIMED)
        audio_start = time.time()
        try:
            wav_path = convert_to_wav(file_path)
        except Exception as e:
            print(f"❌ Audio convert error: {e}")
            wav_path = file_path
        audio_time = time.time() - audio_start

        # 2. ASR processing with OPTIMIZED faster-whisper (TIMED)
        print("🎤 Starting OPTIMIZED speech recognition...")
        asr_start = time.time()
        
        # Use the optimized transcription function
        asr_result = transcribe_audio_optimized(wav_path)
        hypothesis = asr_result.get("text", "").strip()
        is_optimized = asr_result.get("optimized", False)
        
        asr_time = time.time() - asr_start
        print(f"🚀 {'FASTER-WHISPER' if is_optimized else 'TRANSFORMERS'} transcription: '{hypothesis[:50]}...'")
        print(f"⚡ Speech recognition time: {asr_time:.2f}s")

        # 3. Get reference text (TIMED)
        ref_start = time.time()
        reference_raw = get_ayah_text(surah_id, ayah_number)
        if not reference_raw:
            return {
                "error": get_translation("ayah_not_found", language),
                "processing_time": round(time.time() - total_start, 2)
            }
        ref_time = time.time() - ref_start

        # 4. Text processing (TIMED)
        text_start = time.time()
        ref_norm = normalize_text_for_compare(reference_raw)
        hyp_norm = normalize_text_for_compare(hypothesis)

        # Calculate WER
        try:
            wer_score = wer(ref_norm, hyp_norm) if ref_norm and hyp_norm else 1.0
        except Exception:
            wer_score = 1.0

        # Get contextual feedback
        feedback = get_feedback_message(wer_score, language)

        # Create word-by-word analysis
        word_analysis = create_word_analysis(ref_norm, hyp_norm)
        text_time = time.time() - text_start
        
        total_time = time.time() - total_start
        
        # Performance logging
        print(f"📊 PERFORMANCE BREAKDOWN:")
        print(f"   🎵 Audio conversion: {audio_time:.2f}s")
        print(f"   🎤 Speech recognition: {asr_time:.2f}s")
        print(f"   📖 Reference lookup: {ref_time:.2f}s")
        print(f"   📝 Text processing: {text_time:.2f}s")
        print(f"   ⏱️ TOTAL TIME: {total_time:.2f}s")

        return {
            "success": True,
            "wer_score": wer_score,
            "accuracy_percentage": round((1 - wer_score) * 100, 1),
            "detected_text": hypothesis,
            "reference_text": reference_raw,
            "feedback": feedback,
            "word_analysis": word_analysis,
            "language": language,
            "surah_id": surah_id,
            "ayah_number": ayah_number,
            # PERFORMANCE METRICS
            "processing_time": round(total_time, 2),
            "performance_breakdown": {
                "audio_conversion": round(audio_time, 2),
                "speech_recognition": round(asr_time, 2),
                "reference_lookup": round(ref_time, 2),
                "text_processing": round(text_time, 2)
            },
            "model_used": MODEL_NAME + (" (faster-whisper)" if USE_FASTER_WHISPER else " (transformers)")
        }

    except Exception as e:
        import traceback
        total_time = time.time() - total_start
        print(f"❌ Evaluation error: {e}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return {
            "error": get_translation("processing_error", language),
            "debug_message": str(e),
            "processing_time": round(total_time, 2)
        }


# ------------- تشغيل التطبيق -------------
if __name__ == "__main__":
    # اختبار الاتصال بالAPI عند بدء التشغيل
    print("اختبار الاتصال بـ API القرآن الكريم...")
    surahs, error = get_juz30_surahs()
    if error:
        print(f"تحذير: {error}")
        print(f"تم تحميل {len(surahs)} سورة من القائمة المحلية")
    else:
        print(f"تم تحميل {len(surahs)} سورة من API بنجاح")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
