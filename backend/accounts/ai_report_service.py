"""Génération des textes d'évaluation (points forts / à améliorer / objectif) via Gemini.

Le coach saisit les scores dans PlayerManagement.js ; ce module transforme ces
scores + le contexte du joueur en un prompt structuré pour Gemini, qui renvoie
une analyse experte au format JSON. La clé API reste côté serveur (jamais
exposée au frontend).
"""
import json
import time

from django.conf import settings

SYSTEM_PROMPT = """أنت مساعد يكتب لأولياء أمور لاعبين شباب في أكاديمية كرة قدم ملخصًا شهريًا بسيطًا عن أداء أطفالهم. يجب أن يفهمه أي والد أو والدة، حتى لو لم يكونا خبيرين في كرة القدم.

قواعد صارمة:
- علّق فقط على المعطيات المُقدّمة، ولا تخترع أي معلومة غير موجودة.
- "التعب" و"النوم" مقياسهما من 1 (سيئ) إلى 5 (ممتاز) — 5/5 يعني دائمًا نتيجة جيدة.
- لا تربط بين معلومتين بعلاقة سبب-نتيجة إلا إذا كان الفرق بينهما واضحًا ومنطقيًا فعلاً.

أسلوب الكتابة:
- اكتب بالعربية الفصحى البسيطة، بجمل قصيرة ومباشرة، بدون مصطلحات كروية معقدة.
- كن إيجابيًا ومشجعًا، حتى عند ذكر ما يحتاج إلى تحسين — الهدف طمأنة الوالدين وتوجيههم، لا انتقاد الطفل.
- تجنب الأرقام والإحصائيات المعقدة؛ صف الأداء بكلمات بسيطة يفهمها غير المختص.

صيغة الخرج (JSON فقط، بدون أي نص خارج JSON، والقيم بالعربية):
{
  "points_forts": ["1-2 جملة بسيطة عن نقاط قوة الطفل"],
  "points_a_ameliorer": ["1-2 جملة بسيطة وإيجابية عمّا يمكن تحسينه"],
  "objectif_mois_prochain": "هدف بسيط وواضح للشهر القادم، في جملة أو جملتين"
}
"""


class AIReportError(Exception):
    pass


def _build_user_prompt(player_data: dict) -> str:
    return f"""
Joueur: {player_data['nom']}, {player_data['poste']}, {player_data['periode']}
Score global: {player_data['score_global']}/10
Scores par pilier: {json.dumps(player_data['scores_piliers'], ensure_ascii=False)}
Sous-scores détaillés: {json.dumps(player_data['sous_scores'], ensure_ascii=False)}
Contexte: {json.dumps(player_data['contexte'], ensure_ascii=False)}

أنشئ JSON بالمفاتيح التالية: points_forts (قائمة)، points_a_ameliorer (قائمة)، objectif_mois_prochain (نص) — والقيم بالعربية.
"""


def _as_text(value) -> str:
    if isinstance(value, list):
        return '\n'.join(f'• {item}' for item in value if item)
    return (value or '').strip()


def _is_transient(exc: Exception) -> bool:
    """Gemini overload errors (503 UNAVAILABLE) are temporary — worth a retry."""
    text = str(exc)
    return '503' in text or 'UNAVAILABLE' in text or 'overloaded' in text.lower()


def generate_report_texts(player_data: dict) -> dict:
    """Appelle Gemini et renvoie {strength, to_improve, objective}."""
    if not settings.GEMINI_API_KEY:
        raise AIReportError('GEMINI_API_KEY is not configured on the server')

    from google import genai

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        try:
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=_build_user_prompt(player_data),
                config={
                    'system_instruction': SYSTEM_PROMPT,
                    'response_mime_type': 'application/json',
                },
            )
            result = json.loads(response.text)
            break
        except Exception as exc:
            if attempt < max_attempts and _is_transient(exc):
                time.sleep(1.5 * attempt)
                continue
            raise AIReportError(str(exc)) from exc

    return {
        'strength':   _as_text(result.get('points_forts')),
        'to_improve': _as_text(result.get('points_a_ameliorer')),
        'objective':  _as_text(result.get('objectif_mois_prochain')),
    }
