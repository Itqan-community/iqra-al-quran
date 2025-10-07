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
    global asr_model, MODEL_NAME
    
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
                print("✅ Ultimate fallback model loaded")
    
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
